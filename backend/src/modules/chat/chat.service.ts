import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { CreateApplicationDto } from '@/modules/applications/dto/create-application.dto';
import { Application } from '@/modules/applications/entities/application.entity';
import { ApplicationSource } from '@/modules/applications/enums/application-source.enum';
import { ApplicationsService } from '@/modules/applications/applications.service';
import { ConversationParticipant } from '@/modules/chat/entities/conversation-participant.entity';
import { Conversation } from '@/modules/chat/entities/conversation.entity';
import { Message } from '@/modules/chat/entities/message.entity';
import { Report } from '@/modules/chat/entities/report.entity';
import { MessageType } from '@/modules/chat/enums/message-type.enum';
import { CreateConversationDto } from '@/modules/chat/dto/create-conversation.dto';
import { CreateReportDto } from '@/modules/chat/dto/create-report.dto';
import { EditMessageDto } from '@/modules/chat/dto/edit-message.dto';
import { SendMessageDto } from '@/modules/chat/dto/send-message.dto';
import { ChatEventsEmitter } from '@/modules/chat/gateway/chat-events.emitter';
import { ContractsService } from '@/modules/contracts/contracts.service';
import { Job } from '@/modules/jobs/entities/job.entity';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(Report) private readonly reportRepository: Repository<Report>,
    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,
    private readonly usersService: UsersService,
    private readonly contractsService: ContractsService,
    private readonly applicationsService: ApplicationsService,
    private readonly events: ChatEventsEmitter,
  ) {}

  private assertParticipant(conversation: Conversation, userId: string): void {
    if (conversation.clientId !== userId && conversation.seekerId !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }
  }

  private otherPartyId(conversation: Conversation, userId: string): string {
    return conversation.clientId === userId ? conversation.seekerId : conversation.clientId;
  }

  async findByIdOrFail(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({ where: { id } });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  // ---- Conversations ----

  /** Spec §6.2: client initiates only. */
  async createInquiry(client: User, dto: CreateConversationDto): Promise<Conversation> {
    if (!client.roles.includes(UserRole.CLIENT)) {
      throw new ForbiddenException('You do not hold the CLIENT role');
    }

    const job = await this.jobRepository.findOne({ where: { id: dto.jobId } });
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    if (job.clientId !== client.id) {
      throw new ForbiddenException('You can only initiate chat about your own job postings');
    }

    const seeker = await this.usersService.findByIdOrFail(dto.seekerId);
    if (!seeker.roles.includes(UserRole.SEEKER)) {
      throw new BadRequestException('Target user is not a seeker');
    }

    const existing = await this.conversationRepository.findOne({
      where: { jobId: dto.jobId, clientId: client.id, seekerId: dto.seekerId },
    });
    if (existing) {
      return existing;
    }

    const conversation = await this.conversationRepository.save(
      this.conversationRepository.create({
        jobId: dto.jobId,
        clientId: client.id,
        seekerId: dto.seekerId,
        initiatedBy: client.id,
      }),
    );
    await this.createParticipants(conversation.id, [client.id, dto.seekerId]);
    return conversation;
  }

  /** Auto-created on first access rather than requiring a hook in ContractsService. */
  async getOrCreateContractWorkroom(user: User, contractId: string): Promise<Conversation> {
    const contract = await this.contractsService.findByIdOrFail(contractId);
    if (contract.clientId !== user.id && contract.seekerId !== user.id) {
      throw new ForbiddenException('You are not a party to this contract');
    }

    const existing = await this.conversationRepository.findOne({ where: { contractId } });
    if (existing) {
      return existing;
    }

    const conversation = await this.conversationRepository.save(
      this.conversationRepository.create({
        contractId,
        jobId: contract.jobId,
        clientId: contract.clientId,
        seekerId: contract.seekerId,
        initiatedBy: contract.clientId,
      }),
    );
    await this.createParticipants(conversation.id, [contract.clientId, contract.seekerId]);
    return conversation;
  }

  private async createParticipants(conversationId: string, userIds: string[]): Promise<void> {
    await this.participantRepository.save(
      userIds.map((userId) => this.participantRepository.create({ conversationId, userId })),
    );
  }

  async listMine(user: User): Promise<Array<Conversation & { unreadCount: number }>> {
    const participants = await this.participantRepository.find({ where: { userId: user.id } });
    const byConversationId = new Map(participants.map((p) => [p.conversationId, p]));

    const conversations = await this.conversationRepository.find({
      where: [{ clientId: user.id }, { seekerId: user.id }],
      order: { lastMessageAt: 'DESC' },
    });

    return conversations.map((c) => ({
      ...c,
      unreadCount: byConversationId.get(c.id)?.unreadCount ?? 0,
    }));
  }

  async getConversation(user: User, id: string): Promise<Conversation> {
    const conversation = await this.findByIdOrFail(id);
    this.assertParticipant(conversation, user.id);
    return conversation;
  }

  async getTotalUnreadCount(user: User): Promise<{ total: number }> {
    const participants = await this.participantRepository.find({ where: { userId: user.id } });
    return { total: participants.reduce((sum, p) => sum + p.unreadCount, 0) };
  }

  // ---- Messages ----

  async sendMessage(sender: User, conversationId: string, dto: SendMessageDto): Promise<Message> {
    const conversation = await this.findByIdOrFail(conversationId);
    this.assertParticipant(conversation, sender.id);
    if (conversation.isBlocked) {
      throw new ForbiddenException('This conversation is blocked');
    }

    const type = dto.type ?? MessageType.TEXT;
    if (type === MessageType.TEXT && !dto.content) {
      throw new BadRequestException('content is required for TEXT messages');
    }
    if (
      (type === MessageType.IMAGE || type === MessageType.FILE) &&
      (!dto.attachments || dto.attachments.length === 0)
    ) {
      throw new BadRequestException('attachments are required for IMAGE/FILE messages');
    }

    const message = await this.createAndBroadcastMessage(conversation, sender.id, {
      content: dto.content ?? null,
      type,
      attachments: dto.attachments ?? [],
      replyToId: dto.replyToId ?? null,
    });

    return message;
  }

  private async createAndBroadcastMessage(
    conversation: Conversation,
    senderId: string | null,
    fields: Pick<Message, 'content' | 'type' | 'attachments' | 'replyToId'>,
  ): Promise<Message> {
    const message = await this.messageRepository.save(
      this.messageRepository.create({
        conversationId: conversation.id,
        senderId,
        ...fields,
      }),
    );

    conversation.lastMessageAt = message.createdAt;
    await this.conversationRepository.save(conversation);

    if (senderId) {
      const recipientId = this.otherPartyId(conversation, senderId);
      const recipient = await this.participantRepository.findOne({
        where: { conversationId: conversation.id, userId: recipientId },
      });
      if (recipient) {
        recipient.unreadCount += 1;
        await this.participantRepository.save(recipient);
        this.events.toUser(recipientId, 'unread_update', {
          conversationId: conversation.id,
          unreadCount: recipient.unreadCount,
        });
      }
    }

    this.events.toConversation(conversation.id, 'new_message', message);
    return message;
  }

  async listMessages(
    user: User,
    conversationId: string,
    options: { before?: string; search?: string } = {},
  ): Promise<Message[]> {
    const conversation = await this.findByIdOrFail(conversationId);
    this.assertParticipant(conversation, user.id);

    const qb = this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'DESC')
      .take(50);

    if (options.before) {
      const beforeMessage = await this.messageRepository.findOne({ where: { id: options.before } });
      if (beforeMessage) {
        qb.andWhere('message.createdAt < :before', { before: beforeMessage.createdAt });
      }
    }
    if (options.search) {
      qb.andWhere('message.content ILIKE :search', { search: `%${options.search}%` });
    }

    return qb.getMany();
  }

  async editMessage(sender: User, messageId: string, dto: EditMessageDto): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.senderId !== sender.id) {
      throw new ForbiddenException('You can only edit your own messages');
    }
    if (message.isDeleted) {
      throw new ConflictException('Cannot edit a deleted message');
    }
    if (message.type !== MessageType.TEXT) {
      throw new BadRequestException('Only TEXT messages can be edited');
    }

    message.content = dto.content;
    message.isEdited = true;
    const saved = await this.messageRepository.save(message);
    this.events.toConversation(message.conversationId, 'message_edited', saved);
    return saved;
  }

  async deleteMessage(sender: User, messageId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.senderId !== sender.id) {
      throw new ForbiddenException('You can only delete your own messages');
    }
    if (message.isDeleted) {
      return message;
    }

    message.isDeleted = true;
    message.content = null;
    message.attachments = [];
    const saved = await this.messageRepository.save(message);
    this.events.toConversation(message.conversationId, 'message_deleted', { id: saved.id });
    return saved;
  }

  async markRead(user: User, conversationId: string): Promise<{ message: string }> {
    const conversation = await this.findByIdOrFail(conversationId);
    this.assertParticipant(conversation, user.id);

    const latest = await this.messageRepository.findOne({
      where: { conversationId },
      order: { createdAt: 'DESC' },
    });

    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId: user.id })
      .andWhere('senderId IS NOT NULL')
      .andWhere('isRead = false')
      .execute();

    const participant = await this.participantRepository.findOne({
      where: { conversationId, userId: user.id },
    });
    if (participant) {
      participant.unreadCount = 0;
      participant.lastReadMessageId = latest?.id ?? null;
      await this.participantRepository.save(participant);
    }

    const otherId = this.otherPartyId(conversation, user.id);
    this.events.toUser(otherId, 'read_receipt', { conversationId, readBy: user.id });

    return { message: 'Marked as read.' };
  }

  // ---- Block / unblock (spec §6.2) ----

  async block(user: User, conversationId: string): Promise<Conversation> {
    const conversation = await this.findByIdOrFail(conversationId);
    this.assertParticipant(conversation, user.id);
    if (conversation.isBlocked) {
      throw new ConflictException('This conversation is already blocked');
    }
    conversation.isBlocked = true;
    conversation.blockedBy = user.id;
    const saved = await this.conversationRepository.save(conversation);
    this.events.toConversation(conversationId, 'conversation_blocked', { blockedBy: user.id });
    return saved;
  }

  async unblock(user: User, conversationId: string): Promise<Conversation> {
    const conversation = await this.findByIdOrFail(conversationId);
    this.assertParticipant(conversation, user.id);
    if (!conversation.isBlocked) {
      throw new ConflictException('This conversation is not blocked');
    }
    if (conversation.blockedBy !== user.id) {
      throw new ForbiddenException('Only the user who blocked this conversation can unblock it');
    }
    conversation.isBlocked = false;
    conversation.blockedBy = null;
    const saved = await this.conversationRepository.save(conversation);
    this.events.toConversation(conversationId, 'conversation_unblocked', {});
    return saved;
  }

  // ---- Report (spec §6.2/§17) ----

  async report(user: User, dto: CreateReportDto): Promise<Report> {
    return this.reportRepository.save(
      this.reportRepository.create({
        reporterId: user.id,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
      }),
    );
  }

  // ---- Proposal from chat (spec §6.3) ----

  async proposeFromChat(
    seeker: User,
    conversationId: string,
    dto: CreateApplicationDto,
  ): Promise<Application> {
    const conversation = await this.findByIdOrFail(conversationId);
    this.assertParticipant(conversation, seeker.id);
    if (conversation.seekerId !== seeker.id) {
      throw new ForbiddenException('Only the seeker in this conversation can send a proposal');
    }
    if (!conversation.jobId || conversation.contractId) {
      throw new BadRequestException('Proposals can only be sent in a pre-hire job inquiry thread');
    }

    const application = await this.applicationsService.create(
      seeker,
      conversation.jobId,
      dto,
      ApplicationSource.CHAT,
    );

    // Attributed to the seeker (so the client's unread count bumps normally)
    // but rendered specially via type: SYSTEM.
    await this.createAndBroadcastMessage(conversation, seeker.id, {
      content: 'Sent a proposal for this job.',
      type: MessageType.SYSTEM,
      attachments: [],
      replyToId: null,
    });

    return application;
  }
}
