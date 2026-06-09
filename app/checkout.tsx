import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useListing, usePlaceOrder } from '@/api/hooks';
import { CheckoutAuthError, ListingUnavailableError } from '@/api/ordersApi';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useLocale } from '@/hooks/useLocale';
import { useIsAuthenticated } from '@/store/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import { formatPrice } from '@/utils/format';

const MAX_QUANTITY = 99;

export default function Checkout() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { cityName } = useLocale();
  const { listingId } = useLocalSearchParams<{ listingId: string }>();

  const listing = useListing(listingId);
  const placeOrder = usePlaceOrder();
  const isAuthenticated = useIsAuthenticated();

  const [quantity, setQuantity] = useState(1);

  if (listing.isLoading) {
    return (
      <Screen scroll edges={[]} contentContainerStyle={{ gap: theme.spacing.lg }}>
        <Skeleton width="100%" height={96} />
        <Skeleton width="60%" height={20} />
        <Skeleton width="100%" height={120} />
      </Screen>
    );
  }

  if (listing.isError) {
    return (
      <Screen edges={[]}>
        <EmptyState
          icon="cloud-offline-outline"
          title={t('errors.generic')}
          body={t('errors.genericBody')}
          actionLabel={t('common.retry')}
          onAction={() => void listing.refetch()}
        />
      </Screen>
    );
  }

  const item = listing.data;
  if (!item || item.status !== 'active') {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: t('checkout.title') }} />
        <EmptyState
          icon="cube-outline"
          title={t('checkout.unavailableTitle')}
          body={t('checkout.unavailableBody')}
          actionLabel={t('common.back')}
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const verified = item.seller?.status === 'verified';
  const subtotal = item.price * quantity;
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));
  const increment = () => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1));

  const onPlaceOrder = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/sign-in');
      return;
    }
    placeOrder.mutate(
      { listingId: item.id, quantity },
      {
        onSuccess: (order) => {
          toast.success(t('checkout.orderPlaced'));
          router.replace(`/orders/${order.id}`);
        },
        onError: (error) => {
          if (error instanceof CheckoutAuthError) {
            router.push('/(auth)/sign-in');
            return;
          }
          if (error instanceof ListingUnavailableError) {
            toast.show(t('checkout.unavailableTitle'), 'error');
            return;
          }
          toast.show(t('errors.generic'), 'error');
        },
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: t('checkout.title') }} />
      <Screen scroll edges={[]} contentContainerStyle={{ gap: theme.spacing.lg, paddingBottom: 140 }}>
        {/* Item summary */}
        <Card padded elevated style={{ gap: theme.spacing.md }}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <Image
              source={{ uri: item.images[0] }}
              style={{
                width: 72,
                height: 72,
                borderRadius: theme.radii.md,
                backgroundColor: theme.colors.surfaceAlt,
              }}
              contentFit="cover"
            />
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="label" numberOfLines={2}>
                {item.title}
              </Text>
              <Text variant="subtitle" color="primary">
                {formatPrice(item.price, item.currency)}
              </Text>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                <Badge label={cityName(item.cityId)} icon="location-outline" tone="neutral" />
                {item.delivery ? (
                  <Badge label={t('listing.delivery')} icon="cube-outline" />
                ) : null}
                {item.pickup ? <Badge label={t('listing.pickup')} icon="walk-outline" /> : null}
              </View>
            </View>
          </View>
        </Card>

        {/* Seller (trust) */}
        {item.seller ? (
          <Card padded style={{ gap: theme.spacing.sm }}>
            <Text variant="label" color="textMuted">
              {t('checkout.soldBy')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <Avatar name={item.seller.displayName} size={40} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label">{item.seller.displayName}</Text>
                <Text variant="caption" color="textMuted">
                  {cityName(item.seller.cityId)}
                </Text>
              </View>
              {verified ? <VerifiedBadge small /> : null}
            </View>
          </Card>
        ) : null}

        {/* Quantity */}
        <Card padded style={{ gap: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="label">{t('checkout.quantity')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <IconButton
                icon="remove"
                variant="surface"
                size={18}
                color={quantity <= 1 ? 'textMuted' : 'text'}
                onPress={decrement}
                accessibilityLabel={t('checkout.decreaseQuantity')}
              />
              <Text variant="subtitle" style={{ minWidth: 24, textAlign: 'center' }}>
                {quantity}
              </Text>
              <IconButton
                icon="add"
                variant="surface"
                size={18}
                color={quantity >= MAX_QUANTITY ? 'textMuted' : 'text'}
                onPress={increment}
                accessibilityLabel={t('checkout.increaseQuantity')}
              />
            </View>
          </View>
        </Card>

        {/* Order summary */}
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant="heading">{t('checkout.summary')}</Text>
          <Card padded style={{ gap: theme.spacing.sm }}>
            <SummaryRow
              label={t('checkout.unitPrice')}
              value={formatPrice(item.price, item.currency)}
            />
            <SummaryRow label={t('checkout.quantity')} value={`× ${quantity}`} />
            <Divider />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="label">{t('checkout.total')}</Text>
              <Text variant="subtitle" color="primary">
                {formatPrice(subtotal, item.currency)}
              </Text>
            </View>
          </Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="shield-checkmark-outline" size={14} color={theme.colors.textMuted} />
            <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
              {t('checkout.disclaimer')}
            </Text>
          </View>
        </View>
      </Screen>

      <SafeAreaView
        edges={['bottom']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.surfaceElevated,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="body" color="textMuted">
              {t('checkout.total')}
            </Text>
            <Text variant="subtitle" color="primary">
              {formatPrice(subtotal, item.currency)}
            </Text>
          </View>
          <Button
            title={isAuthenticated ? t('checkout.placeOrder') : t('checkout.signInToBuy')}
            icon={isAuthenticated ? 'bag-check-outline' : 'log-in-outline'}
            loading={placeOrder.isPending}
            onPress={onPlaceOrder}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant="body" color="textMuted">
        {label}
      </Text>
      <Text variant="label">{value}</Text>
    </View>
  );
}
