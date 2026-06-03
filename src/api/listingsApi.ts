import { LISTINGS, getListingById } from '@/data/listings';
import type { Listing, ListingFilters } from '@/types';
import { delay } from './client';

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

export async function fetchListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const filtered = LISTINGS.filter((l) => matchesFilters(l, filters));
  return delay(sortListings(filtered, filters.sort));
}

export async function fetchListing(id: string): Promise<Listing | null> {
  return delay(getListingById(id) ?? null);
}

export async function fetchRelatedListings(id: string): Promise<Listing[]> {
  const base = getListingById(id);
  if (!base) return delay([]);
  const related = LISTINGS.filter(
    (l) => l.id !== id && l.categorySlug === base.categorySlug && l.status === 'active',
  ).slice(0, 6);
  return delay(related);
}

export async function fetchSellerListings(sellerId: string): Promise<Listing[]> {
  const sorted = sortListings(
    LISTINGS.filter((l) => l.sellerId === sellerId && l.status === 'active'),
    'newest',
  );
  return delay(sorted);
}

export async function fetchNewestListings(limit = 8): Promise<Listing[]> {
  const sorted = sortListings(
    LISTINGS.filter((l) => l.status === 'active'),
    'newest',
  );
  return delay(sorted.slice(0, limit));
}

export async function fetchPopularNearby(cityId?: string | null, limit = 8): Promise<Listing[]> {
  const active = LISTINGS.filter((l) => l.status === 'active');
  const nearby = cityId ? active.filter((l) => l.cityId === cityId) : [];
  // Fall back to all active listings when nothing matches the selected city.
  const pool = nearby.length > 0 ? nearby : active;
  return delay(pool.slice(0, limit));
}
