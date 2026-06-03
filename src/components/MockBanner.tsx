import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { env } from '@/config/env';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './ui/Text';

/** Small ribbon shown only in mock mode so it's obvious data isn't persisted. */
export function MockBanner() {
  const theme = useTheme();
  const { t } = useTranslation();
  if (!env.useMocks) return null;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: theme.radii.sm,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
      }}
    >
      <Ionicons name="flask-outline" size={14} color={theme.colors.textMuted} />
      <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
        {t('mock.banner')}
      </Text>
    </View>
  );
}
