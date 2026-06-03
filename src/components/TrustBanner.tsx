import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './ui/Text';

export function TrustBanner() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: theme.spacing.md,
        alignItems: 'center',
        backgroundColor: theme.colors.primaryMuted,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.lg,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          backgroundColor: theme.colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="shield-checkmark" size={22} color={theme.colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="label" style={{ color: theme.colors.primary }}>
          {t('home.trustBannerTitle')}
        </Text>
        <Text variant="caption" color="textMuted">
          {t('home.trustBannerBody')}
        </Text>
      </View>
    </View>
  );
}
