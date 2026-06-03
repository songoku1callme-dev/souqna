/**
 * Centralized, typed access to runtime configuration.
 *
 * Expo inlines `process.env.EXPO_PUBLIC_*` at build time. We never read these
 * scattered across the app — everything goes through this module so behavior
 * (e.g. mock mode) is decided in one place.
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
const useMocksFlag = process.env.EXPO_PUBLIC_USE_MOCKS?.trim().toLowerCase();

const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Mock mode is ON when explicitly requested, OR automatically when Supabase
 * credentials are missing. This lets the app run end-to-end with zero config.
 */
const useMocks = useMocksFlag === 'true' || !hasSupabaseCredentials;

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  hasSupabaseCredentials,
  useMocks,
  appVersion: '1.0.0',
} as const;
