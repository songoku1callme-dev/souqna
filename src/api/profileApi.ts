import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

/**
 * Low-level profile/roles reads against live Supabase.
 *
 * These run only on the live auth path (mock mode never reaches here). All
 * queries respect RLS: `profiles` is world-readable for basic fields, and a
 * user can read only their own `user_roles` rows.
 */

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  city_id: string | null;
  postal_code: string | null;
  created_at: string | null;
};

export async function fetchUserRoles(userId: string): Promise<UserRole[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId);
  if (error || !data) return [];
  return data.map((row) => row.role as UserRole);
}

export async function fetchUserProfile(userId: string): Promise<ProfileRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, city_id, postal_code, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) return null;
  return (data as ProfileRow | null) ?? null;
}

/**
 * Build the app `Profile` for an authenticated Supabase user by combining the
 * `profiles` row + `user_roles`. Falls back to auth metadata when the DB row
 * isn't readable yet (e.g. the `handle_new_user` trigger is mid-flight), and
 * defaults to `['buyer']` so a freshly signed-up user always has a role.
 */
export async function loadProfileForAuthUser(authUser: User): Promise<Profile> {
  const [row, roles] = await Promise.all([
    fetchUserProfile(authUser.id),
    fetchUserRoles(authUser.id),
  ]);

  const metadataName =
    typeof authUser.user_metadata?.full_name === 'string'
      ? (authUser.user_metadata.full_name as string)
      : '';

  return {
    id: authUser.id,
    fullName: row?.full_name || metadataName || '',
    email: row?.email ?? authUser.email ?? '',
    avatarUrl: row?.avatar_url ?? undefined,
    roles: roles.length > 0 ? roles : ['buyer'],
    cityId: row?.city_id ?? undefined,
    postalCode: row?.postal_code ?? undefined,
    createdAt: row?.created_at ?? authUser.created_at ?? new Date().toISOString(),
  };
}
