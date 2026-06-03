import type { ReactElement } from 'react';
import { ActivityIndicator, FlatList, View, type DimensionValue } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useInfiniteListings } from '@/api/hooks';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/theme/ThemeProvider';
import type { Listing, ListingFilters } from '@/types';
import { ListingCard } from './ListingCard';
import { ListingCardSkeleton } from './ListingCardSkeleton';
import { EmptyState } from './ui/EmptyState';
import { Text } from './ui/Text';

export type ListingsFeedProps = {
  filters: ListingFilters;
  /** Screen-specific controls rendered above the results (search input, etc). */
  header?: ReactElement | null;
  emptyTitle?: string;
  emptyBody?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
};

/**
 * Virtualized, paginated listings feed (FlatList + infinite scroll).
 * Shared by the search and category browse screens. Handles loading,
 * empty, and error/retry states. Respects the responsive column count.
 */
export function ListingsFeed({
  filters,
  header,
  emptyTitle,
  emptyBody,
  emptyActionLabel,
  onEmptyAction,
}: ListingsFeedProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { gridColumns } = useResponsive();

  const query = useInfiniteListings(filters);
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.total;

  const itemWidth = `${100 / gridColumns - 3}%` as DimensionValue;

  const resultsHeader = (
    <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
      {header}
      {typeof total === 'number' && !query.isLoading ? (
        <Text variant="label" color="textMuted">
          {t('search.results', { count: total })}
        </Text>
      ) : null}
    </View>
  );

  // First-load skeletons (keep the header visible so controls stay usable).
  if (query.isLoading) {
    return (
      <View style={{ flex: 1, padding: theme.layout.screenPadding }}>
        {resultsHeader}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
          {Array.from({ length: gridColumns * 3 }, (_, i) => (
            <View key={i} style={{ width: itemWidth, flexGrow: 1 }}>
              <ListingCardSkeleton />
            </View>
          ))}
        </View>
      </View>
    );
  }

  // Error on the first page → show the controls + a retry affordance.
  if (query.isError && items.length === 0) {
    return (
      <View style={{ flex: 1, padding: theme.layout.screenPadding }}>
        {resultsHeader}
        <EmptyState
          icon="cloud-offline-outline"
          title={t('errors.generic')}
          body={t('errors.genericBody')}
          actionLabel={t('common.retry')}
          onAction={() => void query.refetch()}
        />
      </View>
    );
  }

  return (
    <FlatList
      key={`cols-${gridColumns}`}
      data={items}
      keyExtractor={(item: Listing) => item.id}
      numColumns={gridColumns}
      renderItem={({ item }) => (
        <View style={{ flex: 1, maxWidth: `${100 / gridColumns}%` }}>
          <ListingCard listing={item} />
        </View>
      )}
      columnWrapperStyle={{ gap: theme.spacing.md }}
      contentContainerStyle={{
        padding: theme.layout.screenPadding,
        paddingBottom: theme.spacing['4xl'],
        gap: theme.spacing.md,
      }}
      ListHeaderComponent={resultsHeader}
      ListEmptyComponent={
        <EmptyState
          icon="cube-outline"
          title={emptyTitle ?? t('empty.noListings')}
          body={emptyBody ?? t('empty.noListingsBody')}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      }
      ListFooterComponent={
        query.isFetchingNextPage ? (
          <View style={{ paddingVertical: theme.spacing.xl }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null
      }
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}
