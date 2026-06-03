import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/components/ui/Badge';
import type { OrderStatus } from '@/types';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

const TONE: Record<OrderStatus, Tone> = {
  pending: 'neutral',
  confirmed: 'primary',
  preparing: 'primary',
  shipped: 'primary',
  out_for_delivery: 'warning',
  delivered: 'success',
  cancelled: 'danger',
  issue_reported: 'danger',
};

const ICON: Record<OrderStatus, keyof typeof Ionicons.glyphMap> = {
  pending: 'time-outline',
  confirmed: 'checkmark-circle-outline',
  preparing: 'cube-outline',
  shipped: 'cube-outline',
  out_for_delivery: 'navigate-outline',
  delivered: 'checkmark-done-outline',
  cancelled: 'close-circle-outline',
  issue_reported: 'alert-circle-outline',
};

export function OrderStatusBadge({ status, small }: { status: OrderStatus; small?: boolean }) {
  const { t } = useTranslation();
  return (
    <Badge label={t(`orderStatus.${status}`)} tone={TONE[status]} icon={ICON[status]} small={small} />
  );
}
