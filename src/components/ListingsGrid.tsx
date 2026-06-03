import { View, type DimensionValue } from 'react-native';

import { useResponsive } from '@/hooks/useResponsive';
import type { Listing } from '@/types';
import { useTheme } from '@/theme/ThemeProvider';
import { ListingCard } from './ListingCard';
import { ListingCardSkeleton } from './ListingCardSkeleton';

export type ListingsGridProps = {
  listings?: Listing[];
  loading?: boolean;
};

/** Adaptive grid: 2 columns on phones, 3 on tablets. */
export function ListingsGrid({ listings, loading }: ListingsGridProps) {
  const theme = useTheme();
  const { gridColumns } = useResponsive();

  // Leave a little slack so flex `gap` between items always fits the row.
  const itemWidth = `${100 / gridColumns - 3}%` as DimensionValue;

  if (loading) {
    const placeholders = Array.from({ length: gridColumns * 2 }, (_, i) => i);
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        {placeholders.map((i) => (
          <View key={i} style={{ width: itemWidth, flexGrow: 1 }}>
            <ListingCardSkeleton />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
      {listings?.map((listing) => (
        <View key={listing.id} style={{ width: itemWidth, flexGrow: 1 }}>
          <ListingCard listing={listing} />
        </View>
      ))}
    </View>
  );
}
