import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { Conversation, Listing, Message, Order, SellerSummary, ListingFilters } from '@/types';
import { fetchConversations, fetchMessages, sendMessage } from './conversationsApi';
import {
  fetchMyOrders,
  fetchOrder,
  placeOrder,
  reportOrderIssue,
  type PlaceOrderInput,
} from './ordersApi';
import {
  fetchListing,
  fetchListings,
  fetchListingsPage,
  fetchNewestListings,
  fetchPopularNearby,
  fetchRelatedListings,
  fetchSellerListings,
} from './listingsApi';
import { queryKeys } from './queryKeys';
import { fetchFeaturedSellers, fetchSeller } from './sellersApi';

export function useListings(filters: ListingFilters = {}): UseQueryResult<Listing[]> {
  return useQuery({ queryKey: queryKeys.listings(filters), queryFn: () => fetchListings(filters) });
}

/** Paginated listings for the browse feeds (search + category). */
export function useInfiniteListings(filters: ListingFilters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.listings(filters),
    queryFn: ({ pageParam }) => fetchListingsPage(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}

export function useNewestListings() {
  return useQuery({
    queryKey: queryKeys.listings({ sort: 'newest' }),
    queryFn: () => fetchNewestListings(),
  });
}

export function usePopularNearby(cityId?: string | null) {
  return useQuery({
    queryKey: ['popular', cityId ?? 'all'],
    queryFn: () => fetchPopularNearby(cityId),
  });
}

export function useListing(id: string) {
  return useQuery({ queryKey: queryKeys.listing(id), queryFn: () => fetchListing(id) });
}

export function useRelatedListings(id: string) {
  return useQuery({ queryKey: queryKeys.related(id), queryFn: () => fetchRelatedListings(id) });
}

export function useFeaturedSellers(): UseQueryResult<SellerSummary[]> {
  return useQuery({ queryKey: queryKeys.sellers, queryFn: fetchFeaturedSellers });
}

export function useSeller(id: string) {
  return useQuery({ queryKey: queryKeys.seller(id), queryFn: () => fetchSeller(id) });
}

export function useSellerListings(id: string) {
  return useQuery({
    queryKey: ['seller', id, 'listings'],
    queryFn: () => fetchSellerListings(id),
  });
}

export function useConversations(): UseQueryResult<Conversation[]> {
  return useQuery({ queryKey: queryKeys.conversations, queryFn: fetchConversations });
}

export function useMessages(conversationId: string): UseQueryResult<Message[]> {
  return useQuery({
    queryKey: queryKeys.messages(conversationId),
    queryFn: () => fetchMessages(conversationId),
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => sendMessage(conversationId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

/* ------------------------------------------------------------------ *
 * Orders / checkout
 * ------------------------------------------------------------------ */

/** The signed-in user's placed orders (buyer perspective). */
export function useMyOrders(): UseQueryResult<Order[]> {
  return useQuery({ queryKey: queryKeys.myOrders, queryFn: fetchMyOrders });
}

/** A single order with items, status history and shipment tracking. */
export function useOrder(id: string): UseQueryResult<Order | null> {
  return useQuery({ queryKey: queryKeys.order(id), queryFn: () => fetchOrder(id) });
}

/** Place an order from a listing, then refresh the buyer's orders. */
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PlaceOrderInput) => placeOrder(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myOrders });
    },
  });
}

/** Raise an issue on an order; refreshes the order + the orders list. */
export function useReportOrderIssue(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note: string) => reportOrderIssue(orderId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.order(orderId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.myOrders });
    },
  });
}
