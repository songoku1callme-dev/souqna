import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { SelectableOption } from '@/components/SelectableOption';
import { Button } from '@/components/ui/Button';
import { useSettingsStore, type LanguagePreference } from '@/store/settingsStore';
import { useTheme } from '@/theme/ThemeProvider';

const OPTIONS: { value: LanguagePreference; labelKey: string }[] = [
  { value: 'system', labelKey: 'language.system' },
  { value: 'ar', labelKey: 'language.arabic' },
  { value: 'en', labelKey: 'language.english' },
];

export default function OnboardingLanguage() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const languagePreference = useSettingsStore((s) => s.languagePreference);
  const setLanguagePreference = useSettingsStore((s) => s.setLanguagePreference);

  return (
    <OnboardingScaffold
      step={1}
      totalSteps={4}
      title={t('onboarding.languageTitle')}
      body={t('onboarding.languageBody')}
      footer={
        <Button title={t('common.continue')} onPress={() => router.push('/onboarding/location')} />
      }
    >
      <View style={{ gap: theme.spacing.md }}>
        {OPTIONS.map((option) => (
          <SelectableOption
            key={option.value}
            label={t(option.labelKey)}
            icon="language-outline"
            selected={languagePreference === option.value}
            onPress={() => setLanguagePreference(option.value)}
          />
        ))}
      </View>
    </OnboardingScaffold>
  );
}
