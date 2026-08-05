import { apiClient } from '@/api/client';
import type { Conversation, Message, MessageType, ReportTargetType } from '@/types/domain';

export interface SendMessageInput {
  content?: string;
  type?: MessageType;
  attachments?: string[];
  replyToId?: string;
}

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
}

export async function createInquiry(jobId: string, seekerId: string): Promise<Conversation> {
  const { data } = await apiClient.post<Conversation>('/chat/conversations', { jobId, seekerId });
  return data;
}

export async function listMyConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get<Conversation[]>('/chat/conversations/mine');
  return data;
}

export async function getTotalUnreadCount(): Promise<{ total: number }> {
  const { data } = await apiClient.get<{ total: number }>('/chat/unread-count');
  return data;
}

export async function getContractWorkroom(contractId: string): Promise<Conversation> {
  const { data } = await apiClient.get<Conversation>(`/chat/contracts/${contractId}/workroom`);
  return data;
}

export async function getConversation(id: string): Promise<Conversation> {
  const { data } = await apiClient.get<Conversation>(`/chat/conversations/${id}`);
  return data;
}

export async function listMessages(
  id: string,
  options: { before?: string; search?: string } = {},
): Promise<Message[]> {
  const { data } = await apiClient.get<Message[]>(`/chat/conversations/${id}/messages`, {
    params: options,
  });
  return data;
}

export async function sendMessage(id: string, dto: SendMessageInput): Promise<Message> {
  const { data } = await apiClient.post<Message>(`/chat/conversations/${id}/messages`, dto);
  return data;
}

export async function editMessage(messageId: string, content: string): Promise<Message> {
  const { data } = await apiClient.patch<Message>(`/chat/messages/${messageId}`, { content });
  return data;
}

export async function deleteMessage(messageId: string): Promise<Message> {
  const { data } = await apiClient.delete<Message>(`/chat/messages/${messageId}`);
  return data;
}

export async function markConversationRead(id: string): Promise<unknown> {
  const { data } = await apiClient.post(`/chat/conversations/${id}/mark-read`);
  return data;
}

export async function blockConversation(id: string): Promise<Conversation> {
  const { data } = await apiClient.post<Conversation>(`/chat/conversations/${id}/block`);
  return data;
}

export async function unblockConversation(id: string): Promise<Conversation> {
  const { data } = await apiClient.post<Conversation>(`/chat/conversations/${id}/unblock`);
  return data;
}

export async function reportTarget(dto: CreateReportInput): Promise<unknown> {
  const { data } = await apiClient.post('/chat/reports', dto);
  return data;
}
