import { Redirect } from 'expo-router';

import { useSettingsStore } from '@/store/settingsStore';

/** Entry point: route to onboarding on first run, otherwise into the tabs. */
export default function Index() {
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  return <Redirect href={onboardingComplete ? '/(tabs)' : '/onboarding'} />;
}
