import { I18nManager } from 'react-native';

import { isRTLLanguage, type AppLanguage } from './index';

/**
 * Align the native layout direction with the active language.
 *
 * `I18nManager.forceRTL` only fully takes effect after a reload on native
 * platforms. We return whether a direction change happened so callers can
 * decide to prompt for a restart. We never auto-reload to avoid yanking the
 * user mid-flow; instead the settings screen surfaces a gentle hint.
 */
export function applyLayoutDirection(language: AppLanguage): { changed: boolean } {
  const shouldBeRTL = isRTLLanguage(language);
  if (I18nManager.isRTL !== shouldBeRTL) {
    try {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    } catch {
      // No-op: some platforms (web) ignore forceRTL.
    }
    return { changed: true };
  }
  return { changed: false };
}

export function isRTL(): boolean {
  return I18nManager.isRTL;
}
