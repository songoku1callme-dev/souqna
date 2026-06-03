import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

const TRUST_POINTS: { icon: keyof typeof Ionicons.glyphMap; key: string }[] = [
  { icon: 'shield-checkmark-outline', key: 'onboarding.trustPointVerified' },
  { icon: 'location-outline', key: 'onboarding.trustPointLocal' },
  { icon: 'flag-outline', key: 'onboarding.trustPointSafe' },
];

export default function Welcome() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flex: 1, justifyContent: 'center', gap: theme.spacing.lg }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="storefront" size={32} color={theme.colors.onPrimary} />
        </View>
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="display">{t('onboarding.welcomeTitle')}</Text>
          <Text variant="body" color="textMuted">
            {t('onboarding.welcomeBody')}
          </Text>
        </View>

        <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
          {TRUST_POINTS.map((point) => (
            <View
              key={point.key}
              style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.primaryMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={point.icon} size={20} color={theme.colors.primary} />
              </View>
              <Text variant="body" style={{ flex: 1 }}>
                {t(point.key)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <Button
          title={t('onboarding.getStarted')}
          onPress={() => router.push('/onboarding/language')}
        />
        <Button
          title={t('onboarding.alreadyHaveAccount')}
          variant="ghost"
          onPress={() => router.push('/(auth)/sign-in')}
        />
      </View>
    </Screen>
  );
}
