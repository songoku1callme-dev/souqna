import { useState } from 'react';
import { Linking, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useOrder, useReportOrderIssue } from '@/api/hooks';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/theme/ThemeProvider';
import { formatFullDate, formatPrice } from '@/utils/format';

export default function OrderDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const reportIssue = useReportOrderIssue(id);

  const [issueOpen, setIssueOpen] = useState(false);
  const [issueText, setIssueText] = useState('');

  if (isLoading) {
    return (
      <Screen scroll edges={[]} contentContainerStyle={{ gap: theme.spacing.lg }}>
        <Stack.Screen options={{ title: '' }} />
        <Skeleton width="100%" height={96} />
        <Skeleton width="100%" height={140} />
        <Skeleton width="100%" height={120} />
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: '' }} />
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

  if (!order) {
    return (
      <Screen edges={[]}>
        <Stack.Screen options={{ title: '' }} />
        <EmptyState icon="receipt-outline" title={t('errors.notFound')} body={t('errors.notFoundBody')} />
      </Screen>
    );
  }

  const shipment = order.shipment;

  const openTracking = () => {
    if (shipment?.trackingUrl) Linking.openURL(shipment.trackingUrl).catch(() => undefined);
  };

  const submitIssue = () => {
    reportIssue.mutate(issueText.trim() || t('orders.reportIssue'), {
      onSuccess: () => {
        setIssueOpen(false);
        setIssueText('');
        toast.success(t('orders.issueReported'));
      },
      onError: () => toast.show(t('errors.generic'), 'error'),
    });
  };

  return (
    <Screen scroll edges={[]} contentContainerStyle={{ gap: theme.spacing.lg }}>
      <Stack.Screen options={{ title: t('orders.orderRef', { ref: order.reference }) }} />

      {/* Status header */}
      <Card padded elevated style={{ gap: theme.spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.sm }}>
          <OrderStatusBadge status={order.status} />
          <Text variant="caption" color="textMuted">
            {t('orders.placedOn', { date: formatFullDate(order.placedAt) })}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="storefront-outline" size={14} color={theme.colors.textMuted} />
          <Text variant="body" color="textMuted">
            {t('orders.soldBy')}: {order.sellerName}
          </Text>
        </View>
        {order.status === 'delivered' && order.deliveredAt ? (
          <Text variant="label" color="success">
            {t('orders.deliveredOn', { date: formatFullDate(order.deliveredAt) })}
          </Text>
        ) : order.estimatedDeliveryAt ? (
          <Text variant="label" color="primary">
            {t('orders.estimatedDelivery')}: {formatFullDate(order.estimatedDeliveryAt)}
          </Text>
        ) : null}
      </Card>

      {/* Reported issue (moderation-friendly state) */}
      {order.status === 'issue_reported' && order.issueNote ? (
        <Card padded style={{ gap: 4, borderColor: theme.colors.danger }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
            <Text variant="label" color="danger">
              {t('orders.issueNote')}
            </Text>
          </View>
          <Text variant="body" color="textMuted">
            {order.issueNote}
          </Text>
        </Card>
      ) : null}

      {/* Items */}
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="heading">{t('orders.itemsTitle')}</Text>
        <Card padded style={{ gap: theme.spacing.md }}>
          {order.items.map((item, i) => (
            <View key={item.id}>
              {i > 0 ? <Divider /> : null}
              <View style={{ flexDirection: 'row', gap: theme.spacing.md, paddingTop: i > 0 ? theme.spacing.md : 0 }}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={{ width: 56, height: 56, borderRadius: theme.radii.md, backgroundColor: theme.colors.surfaceAlt }}
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
          <Divider />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="label" color="textMuted">
              {t('orders.total')}
            </Text>
            <Text variant="subtitle" color="primary">
              {formatPrice(order.subtotal, order.currency)}
            </Text>
          </View>
        </Card>
      </View>

      {/* Tracking */}
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="heading">{t('orders.trackingTitle')}</Text>
        <Card padded style={{ gap: theme.spacing.md }}>
          {shipment ? (
            <>
              <TrackingRow icon="navigate-outline" label={t('shipmentStatus.' + shipment.status)} strong />
              {shipment.courierName ? (
                <TrackingRow icon="car-outline" label={t('orders.courier')} value={shipment.courierName} />
              ) : null}
              {shipment.provider ? (
                <TrackingRow icon="business-outline" label={t('orders.provider')} value={shipment.provider} />
              ) : null}
              {shipment.trackingNumber ? (
                <TrackingRow icon="barcode-outline" label={t('orders.trackingNumber')} value={shipment.trackingNumber} />
              ) : null}
              {shipment.estimatedDeliveryAt ? (
                <TrackingRow
                  icon="time-outline"
                  label={t('orders.estimatedDelivery')}
                  value={formatFullDate(shipment.estimatedDeliveryAt)}
                />
              ) : null}
              {shipment.noteToBuyer ? (
                <View style={{ gap: 2 }}>
                  <Text variant="caption" color="textMuted">
                    {t('orders.noteToBuyer')}
                  </Text>
                  <Text variant="body">{shipment.noteToBuyer}</Text>
                </View>
              ) : null}
              {shipment.trackingUrl ? (
                <Button title={t('orders.openTracking')} icon="open-outline" onPress={openTracking} />
              ) : null}
            </>
          ) : (
            <Text variant="body" color="textMuted">
              {t('orders.noTracking')}
            </Text>
          )}
        </Card>
      </View>

      {/* Timeline */}
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="heading">{t('orders.timeline')}</Text>
        <Card padded>
          <OrderTimeline order={order} />
        </Card>
      </View>

      {/* Support / moderation */}
      <View style={{ gap: theme.spacing.sm }}>
        <Text variant="heading">{t('orders.supportTitle')}</Text>
        <Button
          title={t('orders.contactSeller')}
          variant="secondary"
          icon="chatbubble-ellipses-outline"
          onPress={() => router.push('/(tabs)/inbox')}
        />
        {order.status !== 'issue_reported' ? (
          <Button
            title={t('orders.reportIssue')}
            variant="ghost"
            icon="flag-outline"
            onPress={() => setIssueOpen(true)}
          />
        ) : null}
      </View>

      <Sheet visible={issueOpen} onClose={() => setIssueOpen(false)} title={t('orders.reportIssue')}>
        <View style={{ gap: theme.spacing.md, paddingTop: theme.spacing.sm }}>
          <Text variant="body" color="textMuted">
            {t('orders.reportIssuePrompt')}
          </Text>
          <Input
            multiline
            value={issueText}
            onChangeText={setIssueText}
            placeholder={t('orders.reportIssuePlaceholder')}
          />
          <Button
            title={t('trust.submitReport')}
            icon="flag-outline"
            loading={reportIssue.isPending}
            onPress={submitIssue}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

function TrackingRow({
  icon,
  label,
  value,
  strong,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  strong?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <Ionicons name={icon} size={16} color={strong ? theme.colors.primary : theme.colors.textMuted} />
      {value ? (
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm }}>
          <Text variant="body" color="textMuted">
            {label}
          </Text>
          <Text variant="label" style={{ flexShrink: 1 }}>
            {value}
          </Text>
        </View>
      ) : (
        <Text variant="label" color={strong ? 'primary' : 'text'}>
          {label}
        </Text>
      )}
    </View>
  );
}
