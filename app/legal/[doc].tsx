import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

const DOC_KEYS: Record<string, { titleKey: string; bodyKey: string }> = {
  terms: { titleKey: 'legal.termsTitle', bodyKey: 'legal.termsBody' },
  privacy: { titleKey: 'legal.privacyTitle', bodyKey: 'legal.privacyBody' },
  'content-policy': { titleKey: 'legal.contentPolicyTitle', bodyKey: 'legal.contentPolicyBody' },
  support: { titleKey: 'legal.supportTitle', bodyKey: 'legal.supportBody' },
};

export default function LegalDoc() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const keys = DOC_KEYS[doc] ?? DOC_KEYS.terms;

  return (
    <Screen scroll contentContainerStyle={{ gap: theme.spacing.lg }}>
      <Stack.Screen options={{ title: t(keys.titleKey) }} />
      <Text variant="title">{t(keys.titleKey)}</Text>
      <Text variant="body" color="textMuted" style={{ lineHeight: 24 }}>
        {t(keys.bodyKey)}
      </Text>
      <Text variant="caption" color="textMuted">
        {t('legal.placeholderNote')}
      </Text>
    </Screen>
  );
}
