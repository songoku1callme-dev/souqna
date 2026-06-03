import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useListings } from '@/api/hooks';
import { FilterSheet } from '@/components/FilterSheet';
import { Header } from '@/components/Header';
import { ListingsGrid } from '@/components/ListingsGrid';
import { SortSheet } from '@/components/SortSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import type { ListingFilters } from '@/types';

function countActiveFilters(filters: ListingFilters): number {
  let count = 0;
  if (filters.categorySlug) count++;
  if (filters.cityId) count++;
  if (filters.postalCode) count++;
  if (filters.minPrice != null) count++;
  if (filters.maxPrice != null) count++;
  if (filters.condition) count++;
  if (filters.verifiedOnly) count++;
  return count;
}

export default function SearchScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [filters, setFilters] = useState<ListingFilters>({ sort: 'newest' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const query = useListings(filters);
  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  return (
    <Screen scroll edges={['top']} contentContainerStyle={{ gap: theme.spacing.lg }}>
      <Header title={t('search.title')} />

      <Input
        placeholder={t('search.placeholder')}
        value={filters.query ?? ''}
        onChangeText={(v) => setFilters((f) => ({ ...f, query: v }))}
        icon="search"
        autoCapitalize="none"
        returnKeyType="search"
      />

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <ControlButton
          icon="options-outline"
          label={t('search.filters')}
          badge={activeCount > 0 ? activeCount : undefined}
          onPress={() => setFilterOpen(true)}
        />
        <ControlButton
          icon="swap-vertical-outline"
          label={t('search.sort')}
          onPress={() => setSortOpen(true)}
        />
      </View>

      {!query.isLoading && query.data ? (
        <Text variant="label" color="textMuted">
          {t('search.results', { count: query.data.length })}
        </Text>
      ) : null}

      {!query.isLoading && query.data && query.data.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={t('search.noResults')}
          actionLabel={t('search.clearFilters')}
          onAction={() => setFilters({ sort: filters.sort, query: filters.query })}
        />
      ) : (
        <ListingsGrid listings={query.data} loading={query.isLoading} />
      )}

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />
      <SortSheet
        visible={sortOpen}
        onClose={() => setSortOpen(false)}
        value={filters.sort ?? 'newest'}
        onChange={(sort) => setFilters((f) => ({ ...f, sort }))}
      />
    </Screen>
  );
}

function ControlButton({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: number;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        height: 44,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Ionicons name={icon} size={18} color={theme.colors.text} />
      <Text variant="label">{label}</Text>
      {badge ? (
        <View
          style={{
            minWidth: 18,
            height: 18,
            paddingHorizontal: 5,
            borderRadius: 9,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="caption" style={{ color: theme.colors.onPrimary, fontSize: 11 }}>
            {badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
