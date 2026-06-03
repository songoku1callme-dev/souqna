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

/**
 * A leaked or malformed `EXPO_PUBLIC_SUPABASE_URL` (common when a shared dev
 * shell injects vars from another project) must NOT hard-crash the app at
 * import time. We validate the URL and degrade gracefully to mock mode instead
 * of letting `createClient` throw `Invalid supabaseUrl` on boot.
 */
function isValidSupabaseUrl(value: string): boolean {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const hasValidUrl = isValidSupabaseUrl(supabaseUrl);
const hasSupabaseCredentials = Boolean(hasValidUrl && supabaseAnonKey);

/**
 * Mock mode is ON when explicitly requested, OR automatically when valid
 * Supabase credentials are missing. This lets the app run end-to-end with zero
 * config, and prevents a bad env var from taking the whole app down.
 */
const useMocks = useMocksFlag === 'true' || !hasSupabaseCredentials;

export const env = {
  // Only expose the URL downstream when it is actually usable.
  supabaseUrl: hasValidUrl ? supabaseUrl : '',
  supabaseAnonKey,
  hasSupabaseCredentials,
  useMocks,
  appVersion: '1.0.0',
} as const;
