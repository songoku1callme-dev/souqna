import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { FilterSheet } from '@/components/FilterSheet';
import { ListingsFeed } from '@/components/ListingsFeed';
import { SortSheet } from '@/components/SortSheet';
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

  const header = (
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
  );

  return (
    <Screen scroll={false} padded={false}>
      <Stack.Screen options={{ title: t(`categories.${slug}`) }} />

      <ListingsFeed filters={filters} header={header} />

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
