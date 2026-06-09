import type { ListingFilters } from '@/types';

/** Centralized React Query keys to keep cache invalidation consistent. */
export const queryKeys = {
  categories: ['categories'] as const,
  sellers: ['sellers'] as const,
  seller: (id: string) => ['seller', id] as const,
  listings: (filters?: ListingFilters) => ['listings', filters ?? {}] as const,
  listing: (id: string) => ['listing', id] as const,
  related: (id: string) => ['listing', id, 'related'] as const,
  conversations: ['conversations'] as const,
  messages: (id: string) => ['messages', id] as const,
  myOrders: ['orders', 'me'] as const,
  order: (id: string) => ['order', id] as const,
};
