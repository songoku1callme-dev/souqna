import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SelectableOption } from '@/components/SelectableOption';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useSettingsStore, type LanguagePreference } from '@/store/settingsStore';
import { useTheme } from '@/theme/ThemeProvider';

const OPTIONS: { value: LanguagePreference; labelKey: string }[] = [
  { value: 'system', labelKey: 'language.system' },
  { value: 'ar', labelKey: 'language.arabic' },
  { value: 'en', labelKey: 'language.english' },
];

export default function LanguageSettings() {
  const theme = useTheme();
  const { t } = useTranslation();
  const languagePreference = useSettingsStore((s) => s.languagePreference);
  const setLanguagePreference = useSettingsStore((s) => s.setLanguagePreference);

  return (
    <Screen scroll contentContainerStyle={{ gap: theme.spacing.md }}>
      <Text variant="body" color="textMuted">
        {t('language.subtitle')}
      </Text>
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
      <Text variant="caption" color="textMuted">
        {t('language.rtlNote')}
      </Text>
    </Screen>
  );
}
