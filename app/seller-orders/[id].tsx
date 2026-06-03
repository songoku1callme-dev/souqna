import { useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useOrdersStore } from '@/store/ordersStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { OrderStatus } from '@/types';
import { formatFullDate, formatPrice } from '@/utils/format';

export default function SellerOrderManageScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === id));
  const updateStatus = useOrdersStore((s) => s.updateStatus);
  const saveShipment = useOrdersStore((s) => s.saveShipment);

  const [formOpen, setFormOpen] = useState(false);
  const [courierName, setCourierName] = useState(order?.shipment?.courierName ?? '');
  const [provider, setProvider] = useState(order?.shipment?.provider ?? '');
  const [trackingNumber, setTrackingNumber] = useState(order?.shipment?.trackingNumber ?? '');
  const [trackingUrl, setTrackingUrl] = useState(order?.shipment?.trackingUrl ?? '');
  const [eta, setEta] = useState(
    order?.shipment?.estimatedDeliveryAt ? order.shipment.estimatedDeliveryAt.slice(0, 10) : '',
  );
  const [note, setNote] = useState(order?.shipment?.noteToBuyer ?? '');

  if (!order) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: '' }} />
        <EmptyState icon="cube-outline" title={t('errors.notFound')} body={t('errors.notFoundBody')} />
      </Screen>
    );
  }

  const setStatus = (status: OrderStatus, msg = t('orders.statusUpdated')) => {
    updateStatus(order.id, status);
    toast.success(msg);
  };

  const saveShipping = () => {
    const parsed = eta ? new Date(eta) : null;
    saveShipment(order.id, {
      courierName: courierName.trim() || undefined,
      provider: provider.trim() || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
      trackingUrl: trackingUrl.trim() || undefined,
      estimatedDeliveryAt: parsed && !Number.isNaN(+parsed) ? parsed.toISOString() : undefined,
      noteToBuyer: note.trim() || undefined,
    });
    setFormOpen(false);
    toast.success(t('orders.shippingSaved'));
  };

  const hasShipment = !!order.shipment;

  return (
    <Screen scroll edges={[]} contentContainerStyle={{ gap: theme.spacing.lg }}>
      <Stack.Screen options={{ title: t('orders.orderRef', { ref: order.reference }) }} />

      <Card padded elevated style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.sm }}>
          <OrderStatusBadge status={order.status} />
          <Text variant="caption" color="textMuted">
            {t('orders.placedOn', { date: formatFullDate(order.placedAt) })}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="person-outline" size={14} color={theme.colors.textMuted} />
          <Text variant="body" color="textMuted">
            {t('orders.buyer')}: {order.buyerName}
          </Text>
        </View>
      </Card>

      {/* Items */}
      <Card padded style={{ gap: theme.spacing.md }}>
        {order.items.map((item, i) => (
          <View key={item.id}>
            {i > 0 ? <Divider /> : null}
            <View style={{ flexDirection: 'row', gap: theme.spacing.md, paddingTop: i > 0 ? theme.spacing.md : 0 }}>
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 48, height: 48, borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceAlt }}
                contentFit="cover"
              />
              <View style={{ flex: 1 }}>
                <Text variant="label" numberOfLines={2}>
                  {item.title}
                </Text>
                <Text variant="caption" color="textMuted">
                  × {item.quantity}
                </Text>
              </View>
              <Text variant="label">{formatPrice(item.unitPrice * item.quantity, item.currency)}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Status actions */}
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="heading">{t('orders.updateStatus')}</Text>
        <StatusActions
          status={order.status}
          onConfirm={() => setStatus('confirmed')}
          onPreparing={() => setStatus('preparing')}
          onShip={() => setFormOpen(true)}
          onOutForDelivery={() => setStatus('out_for_delivery')}
          onDelivered={() => setStatus('delivered')}
          onCancel={() => setStatus('cancelled')}
        />
      </View>

      {/* Shipping & tracking */}
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="heading">{t('orders.shippingFormTitle')}</Text>
        <Card padded style={{ gap: theme.spacing.sm }}>
          {hasShipment ? (
            <>
              {order.shipment?.courierName ? (
                <Text variant="body">
                  {t('orders.courier')}: <Text variant="label">{order.shipment.courierName}</Text>
                </Text>
              ) : null}
              {order.shipment?.trackingNumber ? (
                <Text variant="body" color="textMuted">
                  {t('orders.trackingNumber')}: {order.shipment.trackingNumber}
                </Text>
              ) : null}
              {order.shipment?.estimatedDeliveryAt ? (
                <Text variant="body" color="textMuted">
                  {t('orders.estimatedDelivery')}: {formatFullDate(order.shipment.estimatedDeliveryAt)}
                </Text>
              ) : null}
            </>
          ) : (
            <Text variant="body" color="textMuted">
              {t('orders.manualCourierHint')}
            </Text>
          )}
          <Button
            title={hasShipment ? t('orders.editTracking') : t('orders.addTracking')}
            variant={hasShipment ? 'secondary' : 'primary'}
            icon="cube-outline"
            onPress={() => setFormOpen(true)}
          />
        </Card>
      </View>

      {/* Timeline */}
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="heading">{t('orders.timeline')}</Text>
        <Card padded>
          <OrderTimeline order={order} />
        </Card>
      </View>

      <Sheet visible={formOpen} onClose={() => setFormOpen(false)} title={t('orders.shippingFormTitle')}>
        <View style={{ gap: theme.spacing.md, paddingTop: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.textMuted} />
            <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
              {t('orders.manualCourierHint')}
            </Text>
          </View>
          <Input
            label={t('orders.courierLabel')}
            value={courierName}
            onChangeText={setCourierName}
            placeholder={t('orders.courierPlaceholder')}
          />
          <Input
            label={t('orders.providerLabel')}
            value={provider}
            onChangeText={setProvider}
            placeholder={t('orders.providerPlaceholder')}
          />
          <Input
            label={t('orders.trackingNumberLabel')}
            value={trackingNumber}
            onChangeText={setTrackingNumber}
            placeholder={t('orders.trackingNumberPlaceholder')}
          />
          <Input
            label={t('orders.trackingUrlLabel')}
            value={trackingUrl}
            onChangeText={setTrackingUrl}
            placeholder={t('orders.trackingUrlPlaceholder')}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Input
            label={t('orders.etaLabel')}
            value={eta}
            onChangeText={setEta}
            placeholder={t('orders.etaPlaceholder')}
            autoCapitalize="none"
          />
          <Input
            label={t('orders.noteLabel')}
            value={note}
            onChangeText={setNote}
            placeholder={t('orders.notePlaceholder')}
            multiline
          />
          <Button title={t('orders.saveShipping')} icon="checkmark" onPress={saveShipping} />
        </View>
      </Sheet>
    </Screen>
  );
}

function StatusActions({
  status,
  onConfirm,
  onPreparing,
  onShip,
  onOutForDelivery,
  onDelivered,
  onCancel,
}: {
  status: OrderStatus;
  onConfirm: () => void;
  onPreparing: () => void;
  onShip: () => void;
  onOutForDelivery: () => void;
  onDelivered: () => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  const primary: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[] = [];
  if (status === 'pending') primary.push({ label: t('orders.markConfirmed'), icon: 'checkmark-circle-outline', onPress: onConfirm });
  if (status === 'confirmed') primary.push({ label: t('orders.markPreparing'), icon: 'cube-outline', onPress: onPreparing });
  if (status === 'preparing') primary.push({ label: t('orders.markShipped'), icon: 'car-outline', onPress: onShip });
  if (status === 'shipped') primary.push({ label: t('orders.markOutForDelivery'), icon: 'navigate-outline', onPress: onOutForDelivery });
  if (status === 'out_for_delivery') primary.push({ label: t('orders.markDelivered'), icon: 'checkmark-done-outline', onPress: onDelivered });

  const canCancel = status !== 'delivered' && status !== 'cancelled' && status !== 'issue_reported';

  return (
    <View style={{ gap: theme.spacing.sm }}>
      {primary.map((action) => (
        <Button key={action.label} title={action.label} icon={action.icon} onPress={action.onPress} />
      ))}
      {canCancel ? (
        <Button title={t('orders.cancelOrder')} variant="ghost" icon="close-circle-outline" onPress={onCancel} />
      ) : null}
    </View>
  );
}
