import type { Conversation, Message } from '@/types';

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    listingId: 'lst-iphone',
    listingTitle: 'iPhone 13 — 128GB, unlocked',
    participantName: 'Sham Electronics · شام',
    participantId: 'seller-tech',
    lastMessage: 'Sure, it is still available. When would you like to meet?',
    lastMessageAt: '2025-06-03T08:42:00.000Z',
    unreadCount: 1,
    verified: true,
  },
  {
    id: 'conv-2',
    listingId: 'lst-embroidered-dress',
    listingTitle: 'Hand-embroidered evening dress',
    participantName: 'Amal Atelier · أمل',
    participantId: 'seller-amal',
    lastMessage: 'Thank you! I can ship it tomorrow morning.',
    lastMessageAt: '2025-06-02T19:05:00.000Z',
    unreadCount: 0,
    verified: true,
  },
  {
    id: 'conv-3',
    listingId: 'lst-wool-blanket',
    listingTitle: 'Handwoven wool blanket',
    participantName: 'Bayt al-Dafa · بيت الدفء',
    participantId: 'seller-bayt',
    lastMessage: 'Is the price negotiable for two pieces?',
    lastMessageAt: '2025-06-01T12:18:00.000Z',
    unreadCount: 0,
    verified: true,
  },
];

export const MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'm1',
      conversationId: 'conv-1',
      senderId: 'me',
      body: 'Hi! Is the iPhone 13 still available?',
      createdAt: '2025-06-03T08:30:00.000Z',
    },
    {
      id: 'm2',
      conversationId: 'conv-1',
      senderId: 'seller-tech',
      body: 'Sure, it is still available. When would you like to meet?',
      createdAt: '2025-06-03T08:42:00.000Z',
    },
  ],
  'conv-2': [
    {
      id: 'm3',
      conversationId: 'conv-2',
      senderId: 'me',
      body: 'The dress is beautiful — could you ship to Homs?',
      createdAt: '2025-06-02T18:50:00.000Z',
    },
    {
      id: 'm4',
      conversationId: 'conv-2',
      senderId: 'seller-amal',
      body: 'Thank you! I can ship it tomorrow morning.',
      createdAt: '2025-06-02T19:05:00.000Z',
    },
  ],
  'conv-3': [
    {
      id: 'm5',
      conversationId: 'conv-3',
      senderId: 'me',
      body: 'Is the price negotiable for two pieces?',
      createdAt: '2025-06-01T12:18:00.000Z',
    },
  ],
};
