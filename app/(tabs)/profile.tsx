import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Header } from '@/components/Header';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore, useIsAuthenticated } from '@/store/authStore';
import { useSellerStore } from '@/store/sellerStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { SellerStatus } from '@/types';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useIsAuthenticated();
  const signOut = useAuthStore((s) => s.signOut);
  const sellerStatus = useSellerStore((s) => s.status);
  const favoritesCount = useFavoritesStore((s) => s.ids.length);
  const languagePreference = useSettingsStore((s) => s.languagePreference);
  const themePreference = useSettingsStore((s) => s.themePreference);

  const logout = async () => {
    await signOut();
    toast.success(t('profile.loggedOut'));
  };

  return (
    <Screen scroll edges={['top']} contentContainerStyle={{ gap: theme.spacing.xl }}>
      <Header title={t('profile.title')} />

      {isAuthenticated && user ? (
        <Card padded elevated>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <Avatar name={user.fullName} size={56} />
            <View style={{ flex: 1 }}>
              <Text variant="subtitle">{user.fullName}</Text>
              <Text variant="caption" color="textMuted">
                {user.email}
              </Text>
            </View>
          </View>
        </Card>
      ) : (
        <Card padded elevated style={{ gap: theme.spacing.md }}>
          <Text variant="subtitle">{t('auth.guestBannerTitle')}</Text>
          <Text variant="body" color="textMuted">
            {t('auth.guestBannerBody')}
          </Text>
          <Button title={t('auth.signIn')} onPress={() => router.push('/(auth)/sign-in')} />
        </Card>
      )}

      <Section title={t('profile.sellingSection')}>
        <ListRow
          icon="ribbon-outline"
          label={t('profile.sellerStatus')}
          right={<SellerStatusBadge status={sellerStatus} />}
          onPress={() => router.push('/(tabs)/sell')}
        />
        <Divider />
        <ListRow
          icon="list-outline"
          label={t('profile.myListings')}
          onPress={() => router.push('/(tabs)/sell')}
        />
      </Section>

      <Section title={t('profile.activitySection')}>
        <ListRow
          icon="receipt-outline"
          label={t('orders.buyerEntry')}
          onPress={() => router.push('/orders')}
        />
        <Divider />
        <ListRow
          icon="heart-outline"
          label={t('profile.savedItems')}
          value={favoritesCount > 0 ? String(favoritesCount) : undefined}
          onPress={() => router.push('/saved')}
        />
      </Section>

      <Section title={t('profile.preferencesSection')}>
        <ListRow
          icon="language-outline"
          label={t('profile.language')}
          value={t(
            `language.${languagePreference === 'ar' ? 'arabic' : languagePreference === 'en' ? 'english' : 'system'}`,
          )}
          onPress={() => router.push('/settings/language')}
        />
        <Divider />
        <ListRow
          icon="contrast-outline"
          label={t('profile.theme')}
          value={t(`theme.${themePreference}`)}
          onPress={() => router.push('/settings/theme')}
        />
      </Section>

      <Section title={t('profile.supportSection')}>
        <ListRow
          icon="document-text-outline"
          label={t('profile.terms')}
          onPress={() => router.push('/legal/terms')}
        />
        <Divider />
        <ListRow
          icon="shield-outline"
          label={t('profile.privacy')}
          onPress={() => router.push('/legal/privacy')}
        />
        <Divider />
        <ListRow
          icon="alert-circle-outline"
          label={t('profile.contentPolicy')}
          onPress={() => router.push('/legal/content-policy')}
        />
        <Divider />
        <ListRow
          icon="help-circle-outline"
          label={t('profile.support')}
          onPress={() => router.push('/legal/support')}
        />
      </Section>

      {isAuthenticated ? (
        <Button
          title={t('profile.logout')}
          variant="ghost"
          icon="log-out-outline"
          onPress={logout}
        />
      ) : null}

      <Text variant="caption" color="textMuted" center>
        {t('common.appName')} · v0.1.0
      </Text>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="label" color="textMuted" style={{ paddingHorizontal: theme.spacing.xs }}>
        {title}
      </Text>
      <Card padded={false}>{children}</Card>
    </View>
  );
}

function SellerStatusBadge({ status }: { status: SellerStatus }) {
  const { t } = useTranslation();
  switch (status) {
    case 'verified':
      return (
        <Badge label={t('sell.statusVerified')} tone="verified" icon="shield-checkmark" small />
      );
    case 'pending':
      return <Badge label={t('sell.statusPending')} tone="warning" small />;
    case 'rejected':
      return <Badge label={t('sell.statusRejected')} tone="danger" small />;
    default:
      return <Badge label={t('sell.statusNotSubmitted')} small />;
  }
}
