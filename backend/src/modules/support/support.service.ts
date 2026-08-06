import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddMessageDto } from '@/modules/support/dto/add-message.dto';
import { CreateTicketDto } from '@/modules/support/dto/create-ticket.dto';
import { SupportMessage } from '@/modules/support/entities/support-message.entity';
import { SupportTicket } from '@/modules/support/entities/support-ticket.entity';
import { SupportTicketStatus } from '@/modules/support/enums/support-ticket-status.enum';
import { NotificationEventType } from '@/modules/notifications/enums/notification-event-type.enum';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
    @InjectRepository(SupportMessage)
    private readonly messageRepository: Repository<SupportMessage>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createTicket(user: User, dto: CreateTicketDto): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.save(
      this.ticketRepository.create({
        requesterId: user.id,
        subject: dto.subject,
        status: SupportTicketStatus.OPEN,
      }),
    );
    await this.messageRepository.save(
      this.messageRepository.create({
        ticketId: ticket.id,
        senderId: user.id,
        body: dto.message,
      }),
    );
    return ticket;
  }

  async listMine(user: User): Promise<SupportTicket[]> {
    return this.ticketRepository.find({
      where: { requesterId: user.id },
      order: { updatedAt: 'DESC' },
    });
  }

  private async findByIdOrFail(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }
    return ticket;
  }

  async getMessages(ticketId: string): Promise<SupportMessage[]> {
    return this.messageRepository.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
    });
  }

  async getDetailForUser(user: User, id: string): Promise<{ ticket: SupportTicket; messages: SupportMessage[] }> {
    const ticket = await this.findByIdOrFail(id);
    if (ticket.requesterId !== user.id) {
      throw new ForbiddenException('You do not have access to this ticket');
    }
    return { ticket, messages: await this.getMessages(id) };
  }

  async addMessageAsRequester(user: User, id: string, dto: AddMessageDto): Promise<SupportMessage> {
    const ticket = await this.findByIdOrFail(id);
    if (ticket.requesterId !== user.id) {
      throw new ForbiddenException('You do not have access to this ticket');
    }
    const message = await this.messageRepository.save(
      this.messageRepository.create({ ticketId: id, senderId: user.id, body: dto.body }),
    );
    ticket.status = SupportTicketStatus.OPEN;
    await this.ticketRepository.save(ticket);
    return message;
  }

  async listAllForAdmin(status?: SupportTicketStatus): Promise<SupportTicket[]> {
    return this.ticketRepository.find({
      where: status ? { status } : {},
      relations: { requester: true },
      order: { updatedAt: 'DESC' },
    });
  }

  async getDetailForAdmin(id: string): Promise<{ ticket: SupportTicket; messages: SupportMessage[] }> {
    const ticket = await this.ticketRepository.findOne({ where: { id }, relations: { requester: true } });
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }
    return { ticket, messages: await this.getMessages(id) };
  }

  async replyAsAdmin(admin: User, id: string, dto: AddMessageDto): Promise<SupportMessage> {
    const ticket = await this.findByIdOrFail(id);
    const message = await this.messageRepository.save(
      this.messageRepository.create({ ticketId: id, senderId: admin.id, body: dto.body }),
    );

    await this.ticketRepository.save(ticket);

    const requester = await this.ticketRepository.manager.findOne(User, { where: { id: ticket.requesterId } });
    if (requester) {
      await this.notificationsService.notify(requester, {
        type: NotificationEventType.SUPPORT_REPLY,
        title: 'Support replied to your ticket',
        message: dto.body,
        link: `/support/tickets/${ticket.id}`,
      });
    }

    return message;
  }

  async setStatus(id: string, status: SupportTicketStatus): Promise<SupportTicket> {
    const ticket = await this.findByIdOrFail(id);
    ticket.status = status;
    return this.ticketRepository.save(ticket);
  }
}
