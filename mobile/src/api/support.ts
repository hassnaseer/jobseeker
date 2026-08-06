import { apiClient } from '@/api/client';

export type SupportTicketStatus = 'OPEN' | 'RESOLVED';

export interface SupportTicket {
  id: string;
  requesterId: string;
  subject: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  requester?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    activeRole: string;
  };
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface SupportTicketDetail {
  ticket: SupportTicket;
  messages: SupportMessage[];
}

export async function adminListTickets(status?: SupportTicketStatus): Promise<SupportTicket[]> {
  const { data } = await apiClient.get<SupportTicket[]>('/admin/support/tickets', {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function adminGetTicketDetail(id: string): Promise<SupportTicketDetail> {
  const { data } = await apiClient.get<SupportTicketDetail>(`/admin/support/tickets/${id}`);
  return data;
}

export async function adminReplyToTicket(id: string, body: string): Promise<SupportMessage> {
  const { data } = await apiClient.post<SupportMessage>(`/admin/support/tickets/${id}/reply`, { body });
  return data;
}

export async function adminResolveTicket(id: string): Promise<SupportTicket> {
  const { data } = await apiClient.post<SupportTicket>(`/admin/support/tickets/${id}/resolve`);
  return data;
}

export async function adminReopenTicket(id: string): Promise<SupportTicket> {
  const { data } = await apiClient.post<SupportTicket>(`/admin/support/tickets/${id}/reopen`);
  return data;
}
