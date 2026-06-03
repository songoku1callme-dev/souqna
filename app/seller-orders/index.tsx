import { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OrderCard } from '@/components/orders/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { selectSellerOrders, useOrdersStore } from '@/store/ordersStore';
import { useTheme } from '@/theme/ThemeProvider';

export default function SellerOrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const allOrders = useOrdersStore((s) => s.orders);
  const orders = useMemo(() => selectSellerOrders(allOrders), [allOrders]);

  if (orders.length === 0) {
    return (
      <Screen edges={[]}>
        <EmptyState
          icon="cube-outline"
          title={t('orders.sellerEmpty')}
          body={t('orders.sellerEmptyBody')}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={[]} contentContainerStyle={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.md }}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            perspective="seller"
            onPress={() => router.push(`/seller-orders/${order.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}
