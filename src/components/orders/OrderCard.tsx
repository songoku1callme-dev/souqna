import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import type { Order } from '@/types';
import { formatFullDate, formatPrice } from '@/utils/format';
import { OrderStatusBadge } from './OrderStatusBadge';

export type OrderCardProps = {
  order: Order;
  perspective: 'buyer' | 'seller';
  onPress: () => void;
};

export function OrderCard({ order, perspective, onPress }: OrderCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const cover = order.items[0]?.imageUrl;
  const counterparty = perspective === 'buyer' ? order.sellerName : order.buyerName;
  const counterpartyLabel = perspective === 'buyer' ? t('orders.soldBy') : t('orders.buyer');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        padding: theme.spacing.md,
        gap: theme.spacing.md,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }}>
        <Text variant="label" color="textMuted">
          {t('orders.orderRef', { ref: order.reference })}
        </Text>
        <OrderStatusBadge status={order.status} small />
      </View>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <Image
          source={{ uri: cover }}
          style={{
            width: 64,
            height: 64,
            borderRadius: theme.radii.md,
            backgroundColor: theme.colors.surfaceAlt,
          }}
          contentFit="cover"
          transition={150}
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="subtitle" numberOfLines={1}>
            {order.items[0]?.title}
          </Text>
          {order.items.length > 1 ? (
            <Text variant="caption" color="textMuted">
              {t('orders.itemCount', { count: order.items.length })}
            </Text>
          ) : null}
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {counterpartyLabel}: {counterparty}
          </Text>
          <Text variant="label" color="primary">
            {formatPrice(order.subtotal, order.currency)}
          </Text>
        </View>
      </View>

      {order.status === 'delivered' && order.deliveredAt ? (
        <MetaRow icon="checkmark-done-outline" text={t('orders.deliveredOn', { date: formatFullDate(order.deliveredAt) })} />
      ) : order.estimatedDeliveryAt ? (
        <MetaRow
          icon="time-outline"
          text={`${t('orders.estimatedDelivery')}: ${formatFullDate(order.estimatedDeliveryAt)}`}
        />
      ) : null}
    </Pressable>
  );
}

function MetaRow({ icon, text }: { icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap; text: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Ionicons name={icon} size={13} color={theme.colors.textMuted} />
      <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
