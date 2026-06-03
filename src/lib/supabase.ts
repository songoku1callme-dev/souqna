import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import { env } from '@/config/env';

/**
 * Supabase client.
 *
 * In mock mode (no credentials configured) we expose `null` and the rest of
 * the app routes through the mock API layer instead. Components/queries should
 * use the API helpers in `src/api`, not this client directly.
 */
export const supabase: SupabaseClient | null = env.hasSupabaseCredentials
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  return supabase;
}
