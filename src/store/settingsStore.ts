import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';
export type LanguagePreference = 'system' | 'en' | 'ar';

type SettingsState = {
  /** User intent for theme; the active theme also factors in the OS scheme. */
  themePreference: ThemePreference;
  /** User intent for language; "system" follows the device locale. */
  languagePreference: LanguagePreference;
  /** Whether the user has completed the first-run onboarding flow. */
  onboardingComplete: boolean;
  /** Hydration flag so the UI can wait for persisted values before routing. */
  hasHydrated: boolean;
  setThemePreference: (value: ThemePreference) => void;
  setLanguagePreference: (value: LanguagePreference) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      languagePreference: 'system',
      onboardingComplete: false,
      hasHydrated: false,
      setThemePreference: (value) => set({ themePreference: value }),
      setLanguagePreference: (value) => set({ languagePreference: value }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetOnboarding: () => set({ onboardingComplete: false }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'souqna.settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themePreference: state.themePreference,
        languagePreference: state.languagePreference,
        onboardingComplete: state.onboardingComplete,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
