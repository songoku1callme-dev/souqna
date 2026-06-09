import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useMyOrders } from '@/api/hooks';
import { OrderCard } from '@/components/orders/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export default function BuyerOrdersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: orders, isLoading, isError, refetch } = useMyOrders();

  if (isLoading) {
    return (
      <Screen scroll edges={[]} contentContainerStyle={{ gap: theme.spacing.md }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} width="100%" height={96} />
        ))}
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen edges={[]}>
        <EmptyState
          icon="cloud-offline-outline"
          title={t('errors.generic')}
          body={t('errors.genericBody')}
          actionLabel={t('common.retry')}
          onAction={() => void refetch()}
        />
      </Screen>
    );
  }

  if (!orders || orders.length === 0) {
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
