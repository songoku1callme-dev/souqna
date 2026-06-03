import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useLocale } from '@/hooks/useLocale';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { Listing } from '@/types';
import { formatPrice } from '@/utils/format';
import { Badge } from './ui/Badge';
import { Text } from './ui/Text';

export type ListingCardProps = {
  listing: Listing;
  variant?: 'grid' | 'carousel';
};

export function ListingCard({ listing, variant = 'grid' }: ListingCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { cityName } = useLocale();
  const isFavorite = useFavoritesStore((s) => s.ids.includes(listing.id));
  const toggle = useFavoritesStore((s) => s.toggle);

  const width = variant === 'carousel' ? 168 : undefined;
  const verified = listing.seller?.status === 'verified';

  return (
    <Pressable
      onPress={() => router.push(`/listing/${listing.id}`)}
      style={({ pressed }) => ({
        width,
        flex: variant === 'grid' ? 1 : undefined,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          borderWidth: 1,
          borderColor: theme.colors.border,
          overflow: 'hidden',
        }}
      >
        <View>
          <Image
            source={{ uri: listing.images[0] }}
            style={{ width: '100%', aspectRatio: 1, backgroundColor: theme.colors.surfaceAlt }}
            contentFit="cover"
            transition={200}
          />
          <Pressable
            onPress={() => toggle(listing.id)}
            hitSlop={theme.layout.hitSlop}
            style={{
              position: 'absolute',
              top: theme.spacing.sm,
              insetInlineEnd: theme.spacing.sm,
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: theme.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel={t('listing.save')}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? theme.colors.danger : theme.colors.textMuted}
            />
          </Pressable>
        </View>

        <View style={{ padding: theme.spacing.md, gap: 4 }}>
          <Text variant="label" numberOfLines={1}>
            {listing.title}
          </Text>
          <Text variant="subtitle" color="primary">
            {formatPrice(listing.price, listing.currency)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Ionicons name="location-outline" size={12} color={theme.colors.textMuted} />
            <Text variant="caption" color="textMuted" numberOfLines={1} style={{ flex: 1 }}>
              {cityName(listing.cityId)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <Badge label={t(`condition.${conditionKey(listing.condition)}`)} small />
            {verified ? (
              <Badge
                label={t('home.verifiedBadge')}
                tone="verified"
                icon="shield-checkmark"
                small
              />
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function conditionKey(condition: Listing['condition']): string {
  return condition === 'like_new' ? 'likeNew' : condition;
}
