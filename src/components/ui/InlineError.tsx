import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';
import { Text } from './Text';

export type InlineErrorProps = {
  onRetry: () => void;
  message?: string;
};

/** Compact inline error + retry for a single section (e.g. a home carousel). */
export function InlineError({ onRetry, message }: InlineErrorProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={{ gap: theme.spacing.sm, paddingVertical: theme.spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Ionicons name="cloud-offline-outline" size={18} color={theme.colors.textMuted} />
        <Text variant="body" color="textMuted">
          {message ?? t('errors.generic')}
        </Text>
      </View>
      <Button
        title={t('common.retry')}
        variant="secondary"
        fullWidth={false}
        onPress={onRetry}
      />
    </View>
  );
}
