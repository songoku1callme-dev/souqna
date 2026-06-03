import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useListing, useRelatedListings } from '@/api/hooks';
import { ImageGallery } from '@/components/ImageGallery';
import { ListingCard } from '@/components/ListingCard';
import { ReportSheet } from '@/components/ReportSheet';
import { SectionHeader } from '@/components/SectionHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useLocale } from '@/hooks/useLocale';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useIsAuthenticated } from '@/store/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import { formatPrice } from '@/utils/format';

export default function ListingDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { cityName } = useLocale();
  const { id } = useLocalSearchParams<{ id: string }>();

  const listing = useListing(id);
  const related = useRelatedListings(id);
  const isFavorite = useFavoritesStore((s) => s.ids.includes(id));
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isAuthenticated = useIsAuthenticated();
  const [reportOpen, setReportOpen] = useState(false);

  if (listing.isLoading) {
    return (
      <ScrollView>
        <Skeleton width="100%" height={360} radius={0} />
        <View style={{ padding: theme.spacing.xl, gap: theme.spacing.md }}>
          <Skeleton width="70%" height={20} />
          <Skeleton width="40%" height={24} />
          <Skeleton width="100%" height={80} />
        </View>
      </ScrollView>
    );
  }

  if (listing.isError) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title={t('errors.generic')}
        body={t('errors.genericBody')}
        actionLabel={t('common.retry')}
        onAction={() => void listing.refetch()}
      />
    );
  }

  if (!listing.data) {
    return (
      <EmptyState
        icon="cube-outline"
        title={t('errors.notFound')}
        body={t('errors.notFoundBody')}
      />
    );
  }

  const item = listing.data;
  const verified = item.seller?.status === 'verified';

  const conditionKey = item.condition === 'like_new' ? 'likeNew' : item.condition;

  const contact = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/sign-in');
      return;
    }
    toast.success(t('listing.contactStarted'));
    router.push('/(tabs)/inbox');
  };

  const onFavorite = () => {
    const added = toggleFavorite(item.id);
    toast.show(added ? t('listing.savedToFavorites') : t('listing.removedFromFavorites'), 'info');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerRight: () => (
            <IconButton
              icon="flag-outline"
              variant="surface"
              size={18}
              onPress={() => setReportOpen(true)}
              accessibilityLabel={t('listing.report')}
            />
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <ImageGallery images={item.images} />

        <View style={{ padding: theme.spacing.xl, gap: theme.spacing.lg }}>
          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="heading">{item.title}</Text>
            <Text variant="title" color="primary">
              {formatPrice(item.price, item.currency)}
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
              <Badge label={t(`condition.${conditionKey}`)} />
              <Badge label={cityName(item.cityId)} icon="location-outline" tone="neutral" />
              {item.delivery ? <Badge label={t('listing.delivery')} icon="cube-outline" /> : null}
              {item.pickup ? <Badge label={t('listing.pickup')} icon="walk-outline" /> : null}
            </View>
          </View>

          <Divider />

          <View style={{ gap: theme.spacing.sm }}>
            <Text variant="label" color="textMuted">
              {t('listing.description')}
            </Text>
            <Text variant="body">{item.description}</Text>
          </View>

          <Divider />

          {item.seller ? (
            <Pressable
              onPress={() => router.push(`/seller/${item.seller!.id}`)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}
            >
              <Avatar name={item.seller.displayName} size={48} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label">{item.seller.displayName}</Text>
                <Text variant="caption" color="textMuted">
                  {cityName(item.seller.cityId)}
                </Text>
              </View>
              {verified ? <VerifiedBadge small /> : null}
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </Pressable>
          ) : null}

          {related.data && related.data.length > 0 ? (
            <View style={{ marginTop: theme.spacing.md }}>
              <SectionHeader title={t('listing.relatedListings')} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: theme.spacing.md }}
              >
                {related.data.map((rel) => (
                  <ListingCard key={rel.id} listing={rel} variant="carousel" />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <SafeAreaView
        edges={['bottom']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.surfaceElevated,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: theme.spacing.md,
            padding: theme.spacing.lg,
            alignItems: 'center',
          }}
        >
          <IconButton
            icon={isFavorite ? 'heart' : 'heart-outline'}
            color={isFavorite ? 'danger' : 'text'}
            variant="surface"
            onPress={onFavorite}
            accessibilityLabel={t('listing.save')}
          />
          <View style={{ flex: 1 }}>
            <Button
              title={t('listing.contactSeller')}
              icon="chatbubble-ellipses-outline"
              onPress={contact}
            />
          </View>
        </View>
      </SafeAreaView>

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="listing"
        targetId={item.id}
      />
    </View>
  );
}
