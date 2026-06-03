import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useIsAuthenticated } from '@/store/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './ui/Text';

export function GuestBanner() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) return null;

  return (
    <Pressable
      onPress={() => router.push('/(auth)/sign-in')}
      style={{
        flexDirection: 'row',
        gap: theme.spacing.md,
        alignItems: 'center',
        backgroundColor: theme.colors.accentMuted,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.md,
      }}
    >
      <Ionicons name="person-circle-outline" size={26} color={theme.colors.accent} />
      <View style={{ flex: 1 }}>
        <Text variant="label" style={{ color: theme.colors.accent }}>
          {t('auth.guestBannerTitle')}
        </Text>
        <Text variant="caption" color="textMuted">
          {t('auth.guestBannerBody')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.accent} />
    </Pressable>
  );
}
