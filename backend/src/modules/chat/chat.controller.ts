import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateApplicationDto } from '@/modules/applications/dto/create-application.dto';
import { ChatService } from '@/modules/chat/chat.service';
import { CreateConversationDto } from '@/modules/chat/dto/create-conversation.dto';
import { CreateReportDto } from '@/modules/chat/dto/create-report.dto';
import { EditMessageDto } from '@/modules/chat/dto/edit-message.dto';
import { SendMessageDto } from '@/modules/chat/dto/send-message.dto';
import { User } from '@/modules/users/entities/user.entity';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  createInquiry(@CurrentUser() client: User, @Body() dto: CreateConversationDto) {
    return this.chatService.createInquiry(client, dto);
  }

  @Get('conversations/mine')
  mine(@CurrentUser() user: User) {
    return this.chatService.listMine(user);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: User) {
    return this.chatService.getTotalUnreadCount(user);
  }

  @Get('contracts/:contractId/workroom')
  workroom(@CurrentUser() user: User, @Param('contractId', ParseUUIDPipe) contractId: string) {
    return this.chatService.getOrCreateContractWorkroom(user, contractId);
  }

  @Get('conversations/:id')
  detail(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.getConversation(user, id);
  }

  @Get('conversations/:id/messages')
  messages(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('before') before?: string,
    @Query('search') search?: string,
  ) {
    return this.chatService.listMessages(user, id, { before, search });
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(user, id, dto);
  }

  @Patch('messages/:id')
  editMessage(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EditMessageDto,
  ) {
    return this.chatService.editMessage(user, id, dto);
  }

  @Delete('messages/:id')
  deleteMessage(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.deleteMessage(user, id);
  }

  @Post('conversations/:id/mark-read')
  markRead(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.markRead(user, id);
  }

  @Post('conversations/:id/block')
  block(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.block(user, id);
  }

  @Post('conversations/:id/unblock')
  unblock(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.unblock(user, id);
  }

  @Post('conversations/:id/propose')
  propose(
    @CurrentUser() seeker: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.chatService.proposeFromChat(seeker, id, dto);
  }

  @Post('reports')
  report(@CurrentUser() user: User, @Body() dto: CreateReportDto) {
    return this.chatService.report(user, dto);
  }
}
