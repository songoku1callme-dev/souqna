import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';

import type {
  Conversation,
  Listing,
  Message,
  SellerProfile,
  SellerSummary,
  ListingFilters,
} from '@/types';
import { fetchConversations, fetchMessages, sendMessage } from './conversationsApi';
import {
  createListing,
  fetchListing,
  fetchListings,
  fetchListingsPage,
  fetchNewestListings,
  fetchPopularNearby,
  fetchRelatedListings,
  fetchSellerListings,
  type CreateListingInput,
} from './listingsApi';
import { queryKeys } from './queryKeys';
import {
  fetchFeaturedSellers,
  fetchMySellerProfile,
  fetchSeller,
  submitSellerVerification,
  type SellerVerificationInput,
} from './sellersApi';

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

/** Live seller profile (status) for the current user; `null` in mock mode. */
export function useMySellerProfile(enabled = true): UseQueryResult<SellerProfile | null> {
  return useQuery({
    queryKey: queryKeys.mySellerProfile,
    queryFn: fetchMySellerProfile,
    enabled,
  });
}

/** Create a listing, then refresh the browse/home feeds so it appears. */
export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListingInput) => createListing(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['listings'] });
      void queryClient.invalidateQueries({ queryKey: ['popular'] });
    },
  });
}

/** Submit a seller verification request (uploads docs in live mode). */
export function useSubmitVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SellerVerificationInput) => submitSellerVerification(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.mySellerProfile });
    },
  });
}
