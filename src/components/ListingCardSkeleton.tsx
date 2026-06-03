import { View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { Skeleton } from './ui/Skeleton';

export function ListingCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'carousel' }) {
  const theme = useTheme();
  const width = variant === 'carousel' ? 168 : undefined;
  return (
    <View
      style={{
        width,
        flex: variant === 'grid' ? 1 : undefined,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
      }}
    >
      <Skeleton width="100%" height={variant === 'carousel' ? 168 : 160} radius={0} />
      <View style={{ padding: theme.spacing.md, gap: theme.spacing.sm }}>
        <Skeleton width="80%" height={12} />
        <Skeleton width="45%" height={16} />
        <Skeleton width="60%" height={10} />
      </View>
    </View>
  );
}
