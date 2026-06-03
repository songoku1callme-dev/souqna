import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { SELLERS, getSellerById } from '@/data/sellers';
import type { SellerStatus, SellerSummary } from '@/types';
import { delay } from './client';

type SellerRow = {
  id: string;
  display_name: string;
  status: SellerStatus;
  city_id: string | null;
  rating_avg: number | null;
  rating_count: number | null;
  created_at: string | null;
};

const SELLER_SELECT = 'id, display_name, status, city_id, rating_avg, rating_count, created_at';

function mapSellerRow(row: SellerRow): SellerSummary {
  return {
    id: row.id,
    displayName: row.display_name,
    status: row.status,
    cityId: row.city_id ?? undefined,
    ratingAvg: row.rating_avg ?? undefined,
    ratingCount: row.rating_count ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function fetchFeaturedSellers(): Promise<SellerSummary[]> {
  if (env.useMocks || !supabase) {
    return delay(SELLERS.filter((s) => s.status === 'verified'));
  }
  const { data, error } = await supabase
    .from('seller_profiles')
    .select(SELLER_SELECT)
    .eq('status', 'verified')
    .order('rating_avg', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return ((data as SellerRow[] | null) ?? []).map(mapSellerRow);
}

export async function fetchSeller(id: string): Promise<SellerSummary | null> {
  if (env.useMocks || !supabase) {
    return delay(getSellerById(id) ?? null);
  }
  const { data, error } = await supabase
    .from('seller_profiles')
    .select(SELLER_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSellerRow(data as SellerRow) : null;
}
