import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { LISTINGS, getListingById } from '@/data/listings';
import type {
  CategorySlug,
  Listing,
  ListingCondition,
  ListingFilters,
  ListingStatus,
  SellerStatus,
  SellerSummary,
} from '@/types';
import { delay } from './client';

/** Number of listings fetched per page in the infinite browse feeds. */
export const LISTINGS_PAGE_SIZE = 12;

/** One page of listings plus the cursor + total used by infinite queries. */
export type ListingsPage = {
  items: Listing[];
  /** Next page index, or `null` when the last page has been reached. */
  nextPage: number | null;
  /** Total matching rows (exact when available), for the results count. */
  total: number;
};

/* ------------------------------------------------------------------ *
 * Mock filtering / sorting (used when `env.useMocks`)
 * ------------------------------------------------------------------ */

function matchesFilters(listing: Listing, filters: ListingFilters): boolean {
  if (listing.status !== 'active') return false;

  if (filters.query) {
    const q = filters.query.trim().toLowerCase();
    const haystack = `${listing.title} ${listing.description}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (filters.categorySlug && listing.categorySlug !== filters.categorySlug) return false;
  if (filters.cityId && listing.cityId !== filters.cityId) return false;
  if (filters.postalCode && listing.postalCode !== filters.postalCode.trim()) return false;
  if (filters.condition && listing.condition !== filters.condition) return false;
  if (typeof filters.minPrice === 'number' && listing.price < filters.minPrice) return false;
  if (typeof filters.maxPrice === 'number' && listing.price > filters.maxPrice) return false;
  if (filters.verifiedOnly && listing.seller?.status !== 'verified') return false;
  return true;
}

function sortListings(listings: Listing[], sort: ListingFilters['sort']): Listing[] {
  const copy = [...listings];
  switch (sort) {
    case 'price_low':
      return copy.sort((a, b) => a.price - b.price);
    case 'price_high':
      return copy.sort((a, b) => b.price - a.price);
    case 'newest':
    case 'nearest':
    default:
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

/* ------------------------------------------------------------------ *
 * Live Supabase reads (used when credentials are configured)
 * Row shapes mirror supabase/schema.sql; mapped to the app `Listing`.
 * ------------------------------------------------------------------ */

type ListingImageRow = { url: string; position: number | null };

type SellerJoinRow = {
  id: string;
  display_name: string;
  status: SellerStatus;
  city_id: string | null;
  rating_avg: number | null;
  rating_count: number | null;
  created_at: string | null;
};

type ListingRow = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  category_slug: CategorySlug;
  price: number;
  currency: string;
  condition: ListingCondition;
  city_id: string | null;
  postal_code: string | null;
  delivery: boolean;
  pickup: boolean;
  status: ListingStatus;
  created_at: string | null;
  listing_images: ListingImageRow[] | null;
  // PostgREST returns a to-one embed as an object, but typings allow an array.
  seller: SellerJoinRow | SellerJoinRow[] | null;
};

/** Columns selected for every listing read, including the seller join + images. */
const LISTING_SELECT =
  'id, seller_id, title, description, category_slug, price, currency, condition, city_id, postal_code, delivery, pickup, status, created_at, listing_images(url, position), seller:seller_profiles!inner(id, display_name, status, city_id, rating_avg, rating_count, created_at)';

function mapSeller(seller: ListingRow['seller']): SellerSummary | undefined {
  const row = Array.isArray(seller) ? seller[0] : seller;
  if (!row) return undefined;
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

function mapListing(row: ListingRow): Listing {
  const images = (row.listing_images ?? [])
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((i) => i.url);
  return {
    id: row.id,
    sellerId: row.seller_id,
    title: row.title,
    description: row.description ?? '',
    categorySlug: row.category_slug,
    price: Number(row.price),
    currency: row.currency,
    condition: row.condition,
    cityId: row.city_id ?? '',
    postalCode: row.postal_code ?? undefined,
    images,
    delivery: row.delivery,
    pickup: row.pickup,
    status: row.status,
    createdAt: row.created_at ?? new Date().toISOString(),
    seller: mapSeller(row.seller),
  };
}

/* ------------------------------------------------------------------ *
 * Public API (mock/live aware)
 * ------------------------------------------------------------------ */

/** Fetch a single page of listings for the infinite browse feeds. */
export async function fetchListingsPage(
  filters: ListingFilters = {},
  page = 0,
  pageSize = LISTINGS_PAGE_SIZE,
): Promise<ListingsPage> {
  const from = page * pageSize;

  if (env.useMocks || !supabase) {
    const all = sortListings(
      LISTINGS.filter((l) => matchesFilters(l, filters)),
      filters.sort,
    );
    const items = all.slice(from, from + pageSize);
    return delay({
      items,
      nextPage: from + pageSize < all.length ? page + 1 : null,
      total: all.length,
    });
  }

  // Build the filtered query; each filter method returns the same builder type
  // so reassignment is type-safe. Ordering/range are applied last.
  let query = supabase.from('listings').select(LISTING_SELECT, { count: 'exact' }).eq('status', 'active');
  if (filters.query) {
    const term = filters.query.trim().replace(/[%,]/g, ' ');
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }
  if (filters.categorySlug) query = query.eq('category_slug', filters.categorySlug);
  if (filters.cityId) query = query.eq('city_id', filters.cityId);
  if (filters.postalCode) query = query.eq('postal_code', filters.postalCode.trim());
  if (filters.condition) query = query.eq('condition', filters.condition);
  if (typeof filters.minPrice === 'number') query = query.gte('price', filters.minPrice);
  if (typeof filters.maxPrice === 'number') query = query.lte('price', filters.maxPrice);
  if (filters.verifiedOnly) query = query.eq('seller.status', 'verified');

  const ordered =
    filters.sort === 'price_low'
      ? query.order('price', { ascending: true })
      : filters.sort === 'price_high'
        ? query.order('price', { ascending: false })
        : query.order('created_at', { ascending: false });

  const { data, error, count } = await ordered.range(from, from + pageSize - 1);
  if (error) throw error;
  const items = ((data as ListingRow[] | null) ?? []).map(mapListing);
  const total = count ?? from + items.length;
  return { items, nextPage: from + items.length < total ? page + 1 : null, total };
}

export async function fetchListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const page = await fetchListingsPage(filters, 0, 100);
  return page.items;
}

export async function fetchListing(id: string): Promise<Listing | null> {
  if (env.useMocks || !supabase) {
    return delay(getListingById(id) ?? null);
  }
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapListing(data as ListingRow) : null;
}

export async function fetchRelatedListings(id: string): Promise<Listing[]> {
  if (env.useMocks || !supabase) {
    const base = getListingById(id);
    if (!base) return delay([]);
    const related = LISTINGS.filter(
      (l) => l.id !== id && l.categorySlug === base.categorySlug && l.status === 'active',
    ).slice(0, 6);
    return delay(related);
  }
  const base = await fetchListing(id);
  if (!base) return [];
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'active')
    .eq('category_slug', base.categorySlug)
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) throw error;
  return ((data as ListingRow[] | null) ?? []).map(mapListing);
}

export async function fetchSellerListings(sellerId: string): Promise<Listing[]> {
  if (env.useMocks || !supabase) {
    const sorted = sortListings(
      LISTINGS.filter((l) => l.sellerId === sellerId && l.status === 'active'),
      'newest',
    );
    return delay(sorted);
  }
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as ListingRow[] | null) ?? []).map(mapListing);
}

export async function fetchNewestListings(limit = 8): Promise<Listing[]> {
  if (env.useMocks || !supabase) {
    const sorted = sortListings(
      LISTINGS.filter((l) => l.status === 'active'),
      'newest',
    );
    return delay(sorted.slice(0, limit));
  }
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data as ListingRow[] | null) ?? []).map(mapListing);
}

export async function fetchPopularNearby(cityId?: string | null, limit = 8): Promise<Listing[]> {
  if (env.useMocks || !supabase) {
    const active = LISTINGS.filter((l) => l.status === 'active');
    const nearby = cityId ? active.filter((l) => l.cityId === cityId) : [];
    const pool = nearby.length > 0 ? nearby : active;
    return delay(pool.slice(0, limit));
  }
  const run = (city?: string | null) => {
    let q = supabase!
      .from('listings')
      .select(LISTING_SELECT)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (city) q = q.eq('city_id', city);
    return q;
  };
  const { data, error } = await run(cityId);
  if (error) throw error;
  let rows = (data as ListingRow[] | null) ?? [];
  // Fall back to all active listings when nothing matches the selected city.
  if (rows.length === 0 && cityId) {
    const fallback = await run(null);
    if (fallback.error) throw fallback.error;
    rows = (fallback.data as ListingRow[] | null) ?? [];
  }
  return rows.map(mapListing);
}
