import { useEffect, useRef } from 'react';

import { initI18n } from '@/i18n';
import { applyLayoutDirection } from '@/i18n/rtl';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * One-time app bootstrap: waits for persisted settings to rehydrate, then
 * initializes i18n + layout direction and restores any auth session. Returns
 * `ready` so the root can hold the splash until routing is safe.
 */
export function useBootstrap(): { ready: boolean } {
  const hasHydrated = useSettingsStore((s) => s.hasHydrated);
  const languagePreference = useSettingsStore((s) => s.languagePreference);
  const initialize = useAuthStore((s) => s.initialize);
  const authInitialized = useAuthStore((s) => s.initialized);

  const authStarted = useRef(false);

  // Keep i18n + RTL in sync with the stored language preference.
  useEffect(() => {
    if (!hasHydrated) return;
    const language = initI18n(languagePreference);
    applyLayoutDirection(language);
  }, [hasHydrated, languagePreference]);

  useEffect(() => {
    if (hasHydrated && !authStarted.current) {
      authStarted.current = true;
      void initialize();
    }
  }, [hasHydrated, initialize]);

  return { ready: hasHydrated && authInitialized };
}
