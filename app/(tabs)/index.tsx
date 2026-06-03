import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CategoryChipsRow } from '@/components/CategoryChipsRow';
import { CitySelector } from '@/components/CitySelector';
import { GuestBanner } from '@/components/GuestBanner';
import { ListingCard } from '@/components/ListingCard';
import { ListingCardSkeleton } from '@/components/ListingCardSkeleton';
import { MockBanner } from '@/components/MockBanner';
import { SearchBarButton } from '@/components/SearchBarButton';
import { SectionHeader } from '@/components/SectionHeader';
import { SellerCard } from '@/components/SellerCard';
import { TrustBanner } from '@/components/TrustBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineError } from '@/components/ui/InlineError';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useFeaturedSellers, useNewestListings, usePopularNearby } from '@/api/hooks';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const cityId = useLocationStore((s) => s.cityId);

  const sellers = useFeaturedSellers();
  const newest = useNewestListings();
  const popular = usePopularNearby(cityId);

  return (
    <Screen scroll edges={['top']} contentContainerStyle={{ gap: theme.spacing.xl }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <View>
          <Text variant="body" color="textMuted">
            {t('home.greeting')}
            {user ? `, ${user.fullName.split(' ')[0]}` : ''} 👋
          </Text>
          <Text variant="title">{t('common.appName')}</Text>
        </View>
        <View style={{ marginTop: theme.spacing.sm }}>
          <CitySelector />
        </View>
      </View>

      <SearchBarButton
        placeholder={t('home.searchPlaceholder')}
        onPress={() => router.push('/(tabs)/search')}
      />

      <MockBanner />
      <GuestBanner />

      <View>
        <SectionHeader
          title={t('home.categories')}
          onSeeAll={() => router.push('/(tabs)/search')}
        />
        <CategoryChipsRow />
      </View>

      <TrustBanner />

      <View>
        <SectionHeader title={t('home.featuredSellers')} />
        {sellers.isError ? (
          <InlineError onRetry={() => void sellers.refetch()} />
        ) : sellers.isLoading ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: theme.spacing.md }}
          >
            <ListingCardSkeleton variant="carousel" />
            <ListingCardSkeleton variant="carousel" />
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: theme.spacing.md }}
          >
            {sellers.data?.map((seller) => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </ScrollView>
        )}
      </View>

      <View>
        <SectionHeader
          title={t('home.newestListings')}
          onSeeAll={() => router.push('/(tabs)/search')}
        />
        {newest.isError ? (
          <InlineError onRetry={() => void newest.refetch()} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: theme.spacing.md }}
          >
            {newest.isLoading
              ? [0, 1, 2].map((i) => <ListingCardSkeleton key={i} variant="carousel" />)
              : newest.data?.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} variant="carousel" />
                ))}
          </ScrollView>
        )}
      </View>

      <View>
        <SectionHeader title={t('home.popularNearby')} />
        {popular.isError ? (
          <InlineError onRetry={() => void popular.refetch()} />
        ) : popular.isLoading ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={{ width: '47%', flexGrow: 1 }}>
                <ListingCardSkeleton />
              </View>
            ))}
          </View>
        ) : popular.data && popular.data.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            {popular.data.map((listing) => (
              <View key={listing.id} style={{ width: '47%', flexGrow: 1 }}>
                <ListingCard listing={listing} />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="cube-outline"
            title={t('empty.noListings')}
            body={t('empty.noListingsBody')}
          />
        )}
      </View>
    </Screen>
  );
}
