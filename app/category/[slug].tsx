import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useListings } from '@/api/hooks';
import { FilterSheet } from '@/components/FilterSheet';
import { ListingsGrid } from '@/components/ListingsGrid';
import { SortSheet } from '@/components/SortSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import type { CategorySlug, ListingFilters } from '@/types';

export default function CategoryScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [filters, setFilters] = useState<ListingFilters>({
    categorySlug: slug as CategorySlug,
    sort: 'newest',
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const query = useListings(filters);

  return (
    <Screen scroll contentContainerStyle={{ gap: theme.spacing.lg }}>
      <Stack.Screen options={{ title: t(`categories.${slug}`) }} />

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Control
          icon="options-outline"
          label={t('search.filters')}
          onPress={() => setFilterOpen(true)}
        />
        <Control
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
          icon="cube-outline"
          title={t('empty.noListings')}
          body={t('empty.noListingsBody')}
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

function Control({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
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
    </Pressable>
  );
}
