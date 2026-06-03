import { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OrderCard } from '@/components/orders/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { selectBuyerOrders, useOrdersStore } from '@/store/ordersStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function BuyerOrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const allOrders = useOrdersStore((s) => s.orders);
  const orders = useMemo(() => selectBuyerOrders(allOrders), [allOrders]);

  if (orders.length === 0) {
    return (
      <Screen edges={[]}>
        <EmptyState
          icon="receipt-outline"
          title={t('orders.empty')}
          body={t('orders.emptyBody')}
          actionLabel={t('home.newestListings')}
          onAction={() => router.push('/(tabs)/search')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={[]} contentContainerStyle={{ gap: theme.spacing.md }}>
      <Text variant="body" color="textMuted">
        {t('orders.subtitle')}
      </Text>
      <View style={{ gap: theme.spacing.md }}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            perspective="buyer"
            onPress={() => router.push(`/orders/${order.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
