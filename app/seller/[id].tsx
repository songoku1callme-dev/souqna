import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useSeller, useSellerListings } from '@/api/hooks';
import { ListingsGrid } from '@/components/ListingsGrid';
import { ReportSheet } from '@/components/ReportSheet';
import { SectionHeader } from '@/components/SectionHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { InlineError } from '@/components/ui/InlineError';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/theme/ThemeProvider';

export default function SellerProfile() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { cityName } = useLocale();
  const { id } = useLocalSearchParams<{ id: string }>();
  const seller = useSeller(id);
  const listings = useSellerListings(id);
  const [reportOpen, setReportOpen] = useState(false);

  if (seller.isError) {
    return (
      <Screen>
        <EmptyState
          icon="cloud-offline-outline"
          title={t('errors.generic')}
          body={t('errors.genericBody')}
          actionLabel={t('common.retry')}
          onAction={() => void seller.refetch()}
        />
      </Screen>
    );
  }

  if (!seller.isLoading && !seller.data) {
    return (
      <Screen>
        <EmptyState icon="person-outline" title={t('errors.notFound')} />
      </Screen>
    );
  }

  return (
    <Screen scroll contentContainerStyle={{ gap: theme.spacing.xl }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <IconButton
              icon="flag-outline"
              size={18}
              onPress={() => setReportOpen(true)}
              accessibilityLabel={t('trust.reportUser')}
            />
          ),
        }}
      />

      {seller.data ? (
        <Card padded elevated style={{ gap: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <Avatar name={seller.data.displayName} size={60} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="subtitle">{seller.data.displayName}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location-outline" size={13} color={theme.colors.textMuted} />
                <Text variant="caption" color="textMuted">
                  {cityName(seller.data.cityId)}
                </Text>
              </View>
              {seller.data.status === 'verified' ? <VerifiedBadge small /> : null}
            </View>
          </View>
          {seller.data.ratingAvg ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="star" size={15} color={theme.colors.warning} />
              <Text variant="label">{seller.data.ratingAvg.toFixed(1)}</Text>
              <Text variant="caption" color="textMuted">
                ({seller.data.ratingCount})
              </Text>
            </View>
          ) : null}
          <Button
            title={t('listing.contactSeller')}
            icon="chatbubble-ellipses-outline"
            variant="secondary"
          />
        </Card>
      ) : null}

      <View>
        <SectionHeader title={t('seller.listings')} />
        {listings.isError ? (
          <InlineError onRetry={() => void listings.refetch()} />
        ) : !listings.isLoading && listings.data && listings.data.length === 0 ? (
          <EmptyState icon="cube-outline" title={t('empty.noListings')} />
        ) : (
          <ListingsGrid listings={listings.data} loading={listings.isLoading} />
        )}
      </View>

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="user"
        targetId={id}
      />
    </Screen>
  );
}
