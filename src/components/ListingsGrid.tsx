import { View } from 'react-native';

import type { Listing } from '@/types';
import { useTheme } from '@/theme/ThemeProvider';
import { ListingCard } from './ListingCard';
import { ListingCardSkeleton } from './ListingCardSkeleton';

export type ListingsGridProps = {
  listings?: Listing[];
  loading?: boolean;
};

/** Two-column responsive grid used by search and category screens. */
export function ListingsGrid({ listings, loading }: ListingsGridProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ width: '47%', flexGrow: 1 }}>
            <ListingCardSkeleton />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
      {listings?.map((listing) => (
        <View key={listing.id} style={{ width: '47%', flexGrow: 1 }}>
          <ListingCard listing={listing} />
        </View>
      ))}
    </View>
  );
}
