import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/theme/ThemeProvider';
import type { SellerSummary } from '@/types';
import { Avatar } from './ui/Avatar';
import { Card } from './ui/Card';
import { Text } from './ui/Text';
import { VerifiedBadge } from './VerifiedBadge';

export function SellerCard({ seller }: { seller: SellerSummary }) {
  const theme = useTheme();
  const { cityName } = useLocale();

  return (
    <Card padded style={{ width: 200, gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Avatar name={seller.displayName} size={40} />
        <View style={{ flex: 1 }}>
          <Text variant="label" numberOfLines={1}>
            {seller.displayName}
          </Text>
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {cityName(seller.cityId)}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {seller.status === 'verified' ? <VerifiedBadge small /> : <View />}
        {seller.ratingAvg ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Ionicons name="star" size={13} color={theme.colors.warning} />
            <Text variant="caption" color="textMuted">
              {seller.ratingAvg.toFixed(1)} ({seller.ratingCount})
            </Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
