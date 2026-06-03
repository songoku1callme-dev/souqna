import { CONVERSATIONS, MESSAGES } from '@/data/conversations';
import type { Conversation, Message } from '@/types';
import { delay } from './client';

export async function fetchConversations(): Promise<Conversation[]> {
  return delay(
    [...CONVERSATIONS].sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    ),
  );
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  return delay(MESSAGES[conversationId] ?? []);
}

/**
 * Optimistically append a message to the in-memory store. In a Supabase-backed
 * build this becomes an insert + realtime subscription.
 */
export async function sendMessage(conversationId: string, body: string): Promise<Message> {
  const message: Message = {
    id: `m-${Date.now()}`,
    conversationId,
    senderId: 'me',
    body,
    createdAt: new Date().toISOString(),
  };
  MESSAGES[conversationId] = [...(MESSAGES[conversationId] ?? []), message];
  const conv = CONVERSATIONS.find((c) => c.id === conversationId);
  if (conv) {
    conv.lastMessage = body;
    conv.lastMessageAt = message.createdAt;
  }
  return delay(message, 200);
}
