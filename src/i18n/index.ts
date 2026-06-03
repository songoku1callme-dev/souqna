import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import type { LanguagePreference } from '@/store/settingsStore';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const RTL_LANGUAGES: AppLanguage[] = ['ar'];

export const resources = {
  en: { translation: en },
  ar: { translation: ar },
} as const;

/** Resolve the device's preferred language to one we support. */
export function getDeviceLanguage(): AppLanguage {
  const locales = Localization.getLocales();
  const code = locales[0]?.languageCode?.toLowerCase();
  return code && SUPPORTED_LANGUAGES.includes(code as AppLanguage) ? (code as AppLanguage) : 'en';
}

/** Map a stored preference ("system" | "en" | "ar") to a concrete language. */
export function resolveLanguage(preference: LanguagePreference): AppLanguage {
  if (preference === 'system') return getDeviceLanguage();
  return preference;
}

export function isRTLLanguage(language: AppLanguage): boolean {
  return RTL_LANGUAGES.includes(language);
}

let initialized = false;

export function initI18n(preference: LanguagePreference): AppLanguage {
  const language = resolveLanguage(preference);
  if (!initialized) {
    // eslint-disable-next-line import/no-named-as-default-member
    i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      returnNull: false,
      compatibilityJSON: 'v4',
    });
    initialized = true;
  } else {
    // eslint-disable-next-line import/no-named-as-default-member
    void i18n.changeLanguage(language);
  }
  return language;
}

export default i18n;
