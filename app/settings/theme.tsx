import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SelectableOption } from '@/components/SelectableOption';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useSettingsStore, type ThemePreference } from '@/store/settingsStore';
import { useTheme } from '@/theme/ThemeProvider';

const OPTIONS: {
  value: ThemePreference;
  labelKey: string;
  icon: 'phone-portrait-outline' | 'sunny-outline' | 'moon-outline';
}[] = [
  { value: 'system', labelKey: 'theme.system', icon: 'phone-portrait-outline' },
  { value: 'light', labelKey: 'theme.light', icon: 'sunny-outline' },
  { value: 'dark', labelKey: 'theme.dark', icon: 'moon-outline' },
];

export default function ThemeSettings() {
  const theme = useTheme();
  const { t } = useTranslation();
  const themePreference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);

  return (
    <Screen scroll contentContainerStyle={{ gap: theme.spacing.md }}>
      <Text variant="body" color="textMuted">
        {t('theme.subtitle')}
      </Text>
      <View style={{ gap: theme.spacing.md }}>
        {OPTIONS.map((option) => (
          <SelectableOption
            key={option.value}
            label={t(option.labelKey)}
            icon={option.icon}
            selected={themePreference === option.value}
            onPress={() => setThemePreference(option.value)}
          />
        ))}
      </View>
    </Screen>
  );
}
