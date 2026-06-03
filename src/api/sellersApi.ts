import { SELLERS, getSellerById } from '@/data/sellers';
import type { SellerSummary } from '@/types';
import { delay } from './client';

export async function fetchFeaturedSellers(): Promise<SellerSummary[]> {
  return delay(SELLERS.filter((s) => s.status === 'verified'));
}

export async function fetchSeller(id: string): Promise<SellerSummary | null> {
  return delay(getSellerById(id) ?? null);
}
