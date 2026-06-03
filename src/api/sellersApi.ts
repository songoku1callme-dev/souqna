import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';
import { SELLERS, getSellerById } from '@/data/sellers';
import type { CategorySlug, SellerProfile, SellerStatus, SellerSummary } from '@/types';
import { delay } from './client';
import { uploadVerificationDocs } from './storageApi';

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

/* ------------------------------------------------------------------ *
 * Current user's seller profile + verification submission
 * ------------------------------------------------------------------ */

type SellerProfileRow = {
  id: string;
  user_id: string;
  display_name: string;
  legal_name: string | null;
  phone: string | null;
  email: string | null;
  city_id: string | null;
  postal_code: string | null;
  category_slugs: CategorySlug[] | null;
  status: SellerStatus;
  rating_avg: number | null;
  rating_count: number | null;
  created_at: string | null;
};

const SELLER_PROFILE_SELECT =
  'id, user_id, display_name, legal_name, phone, email, city_id, postal_code, category_slugs, status, rating_avg, rating_count, created_at';

function mapSellerProfile(row: SellerProfileRow): SellerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    legalName: row.legal_name ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    cityId: row.city_id ?? undefined,
    postalCode: row.postal_code ?? undefined,
    categorySlugs: row.category_slugs ?? [],
    status: row.status,
    ratingAvg: row.rating_avg ?? undefined,
    ratingCount: row.rating_count ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

/** The current authenticated user's seller profile, or null if none exists. */
export async function fetchMySellerProfile(): Promise<SellerProfile | null> {
  if (env.useMocks || !supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;
  const { data, error } = await supabase
    .from('seller_profiles')
    .select(SELLER_PROFILE_SELECT)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSellerProfile(data as SellerProfileRow) : null;
}

/** Fields collected by the seller verification form. */
export type SellerVerificationInput = {
  displayName: string;
  legalName: string;
  phone: string;
  email: string;
  cityId: string | null;
  postalCode: string;
  categorySlugs: CategorySlug[];
  acceptedTerms: boolean;
  /** Local URIs of identity/business documents to upload (private bucket). */
  documentUris: string[];
};

/**
 * Submit (or re-submit) a seller verification request.
 *
 * Live: upserts the user's `seller_profiles` row to `pending`, uploads any
 * documents to the private bucket, then inserts a `seller_verification_requests`
 * row for the moderation queue. Approval is an admin action (RLS restricts role
 * + status writes to admins), so the status stays `pending` until reviewed.
 */
export async function submitSellerVerification(
  input: SellerVerificationInput,
): Promise<SellerProfile> {
  if (env.useMocks || !supabase) {
    // Mock mode persists via the seller store; return a pending profile shape.
    return delay({
      id: 'seller-me',
      userId: 'mock-user',
      displayName: input.displayName,
      legalName: input.legalName || undefined,
      phone: input.phone || undefined,
      email: input.email || undefined,
      cityId: input.cityId ?? undefined,
      postalCode: input.postalCode || undefined,
      categorySlugs: input.categorySlugs,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('Not authenticated.');

  const { data: profileRow, error: profileError } = await supabase
    .from('seller_profiles')
    .upsert(
      {
        user_id: userId,
        display_name: input.displayName,
        legal_name: input.legalName || null,
        phone: input.phone || null,
        email: input.email || null,
        city_id: input.cityId,
        postal_code: input.postalCode || null,
        category_slugs: input.categorySlugs,
        status: 'pending',
      },
      { onConflict: 'user_id' },
    )
    .select(SELLER_PROFILE_SELECT)
    .single();
  if (profileError) throw profileError;
  const profile = mapSellerProfile(profileRow as SellerProfileRow);

  const docPaths =
    input.documentUris.length > 0
      ? await uploadVerificationDocs(userId, input.documentUris)
      : [];

  const { error: requestError } = await supabase.from('seller_verification_requests').insert({
    seller_profile_id: profile.id,
    user_id: userId,
    legal_name: input.legalName || null,
    id_document_path: docPaths[0] ?? null,
    document_paths: docPaths,
    accepted_terms: input.acceptedTerms,
    status: 'pending',
  });
  if (requestError) throw requestError;

  return profile;
}
