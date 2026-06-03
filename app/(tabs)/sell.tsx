import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/Header';
import { LoginRequired } from '@/components/LoginRequired';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useIsAuthenticated } from '@/store/authStore';
import { useSellerStore } from '@/store/sellerStore';
import { useTheme } from '@/theme/ThemeProvider';

const BENEFITS: { icon: keyof typeof Ionicons.glyphMap; key: string }[] = [
  { icon: 'shield-checkmark-outline', key: 'sell.benefitsTrust' },
  { icon: 'people-outline', key: 'sell.benefitsReach' },
  { icon: 'construct-outline', key: 'sell.benefitsTools' },
];

export default function SellScreen() {
  const { t } = useTranslation();
  const isAuthenticated = useIsAuthenticated();
  const status = useSellerStore((s) => s.status);

  return (
    <Screen scroll edges={['top']} contentContainerStyle={{ gap: 20 }}>
      <Header title={t('sell.title')} />
      {!isAuthenticated ? (
        <LoginRequired />
      ) : status === 'verified' ? (
        <VerifiedView />
      ) : status === 'pending' ? (
        <StatusView
          tone="warning"
          icon="hourglass-outline"
          title={t('sell.pendingTitle')}
          body={t('sell.pendingBody')}
          badge={t('sell.statusPending')}
        />
      ) : status === 'rejected' ? (
        <RejectedView />
      ) : (
        <GateView benefits={BENEFITS} />
      )}
    </Screen>
  );
}

function GateView({ benefits }: { benefits: typeof BENEFITS }) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View style={{ gap: theme.spacing.xl }}>
      <Card padded elevated style={{ gap: theme.spacing.md }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: theme.radii.md,
            backgroundColor: theme.colors.primaryMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="ribbon-outline" size={26} color={theme.colors.primary} />
        </View>
        <Text variant="heading">{t('sell.gateTitle')}</Text>
        <Text variant="body" color="textMuted">
          {t('sell.gateBody')}
        </Text>
      </Card>

      <View style={{ gap: theme.spacing.md }}>
        {benefits.map((b) => (
          <View
            key={b.key}
            style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}
          >
            <Ionicons name={b.icon} size={20} color={theme.colors.primary} />
            <Text variant="body" style={{ flex: 1 }}>
              {t(b.key)}
            </Text>
          </View>
        ))}
      </View>

      <Button title={t('sell.gateCta')} onPress={() => router.push('/seller-onboarding')} />
    </View>
  );
}

function VerifiedView() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View style={{ gap: theme.spacing.xl }}>
      <Card padded elevated style={{ gap: theme.spacing.sm }}>
        <Badge label={t('sell.statusVerified')} tone="verified" icon="shield-checkmark" />
        <Text variant="heading">{t('sell.verifiedTitle')}</Text>
        <Text variant="body" color="textMuted">
          {t('sell.verifiedBody')}
        </Text>
      </Card>
      <Button
        title={t('sell.createListing')}
        icon="add"
        onPress={() => router.push('/create-listing')}
      />
      <Button
        title={t('sell.myListings')}
        variant="secondary"
        icon="list-outline"
        onPress={() => router.push('/(tabs)/profile')}
      />
    </View>
  );
}

function RejectedView() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <View style={{ gap: theme.spacing.xl }}>
      <StatusView
        tone="danger"
        icon="close-circle-outline"
        title={t('sell.rejectedTitle')}
        body={t('sell.rejectedBody')}
        badge={t('sell.statusRejected')}
      />
      <Button title={t('sell.resubmit')} onPress={() => router.push('/seller-onboarding')} />
    </View>
  );
}

function StatusView({
  tone,
  icon,
  title,
  body,
  badge,
}: {
  tone: 'warning' | 'danger';
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  badge: string;
}) {
  const theme = useTheme();
  return (
    <Card padded elevated style={{ gap: theme.spacing.sm }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: theme.radii.md,
          backgroundColor: tone === 'danger' ? theme.colors.dangerMuted : theme.colors.accentMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={icon}
          size={26}
          color={tone === 'danger' ? theme.colors.danger : theme.colors.warning}
        />
      </View>
      <Badge label={badge} tone={tone} />
      <Text variant="heading">{title}</Text>
      <Text variant="body" color="textMuted">
        {body}
      </Text>
    </Card>
  );
}
