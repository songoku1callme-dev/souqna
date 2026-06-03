import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { ORDER_FLOW, type Order, type OrderStatus } from '@/types';
import { formatDateTime } from '@/utils/format';

type Row = {
  status: OrderStatus;
  at?: string;
  note?: string;
  state: 'done' | 'current' | 'upcoming';
};

function buildRows(order: Order): Row[] {
  const events = [...order.statusHistory].sort(
    (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
  );
  const rows: Row[] = events.map((e, i) => ({
    status: e.status,
    at: e.createdAt,
    note: e.note,
    state: i === events.length - 1 ? 'current' : 'done',
  }));

  // Append remaining lifecycle steps as upcoming (only on the happy path).
  const flowIndex = ORDER_FLOW.indexOf(order.status);
  const terminal = order.status === 'cancelled' || order.status === 'issue_reported';
  if (!terminal && flowIndex >= 0 && order.status !== 'delivered') {
    for (const status of ORDER_FLOW.slice(flowIndex + 1)) {
      rows.push({ status, state: 'upcoming' });
    }
  }
  return rows;
}

export function OrderTimeline({ order }: { order: Order }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const rows = buildRows(order);

  return (
    <View>
      {rows.map((row, i) => {
        const isLast = i === rows.length - 1;
        const danger = row.status === 'cancelled' || row.status === 'issue_reported';
        const dotColor =
          row.state === 'upcoming'
            ? theme.colors.border
            : danger
              ? theme.colors.danger
              : row.state === 'current'
                ? theme.colors.primary
                : theme.colors.success;
        const muted = row.state === 'upcoming';

        return (
          <View key={`${row.status}-${i}`} style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            {/* Rail: dot + connecting line */}
            <View style={{ alignItems: 'center', width: 22 }}>
              <View
                style={{
                  width: row.state === 'current' ? 16 : 12,
                  height: row.state === 'current' ? 16 : 12,
                  borderRadius: 8,
                  backgroundColor: row.state === 'upcoming' ? theme.colors.surface : dotColor,
                  borderWidth: 2,
                  borderColor: dotColor,
                }}
              />
              {!isLast ? (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    minHeight: 26,
                    backgroundColor: theme.colors.border,
                    marginVertical: 2,
                  }}
                />
              ) : null}
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingBottom: isLast ? 0 : theme.spacing.lg }}>
              <Text variant="label" color={muted ? 'textMuted' : 'text'}>
                {t(`orderStatus.${row.status}`)}
              </Text>
              {row.at ? (
                <Text variant="caption" color="textMuted">
                  {formatDateTime(row.at)}
                </Text>
              ) : null}
              {row.note ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 2,
                  }}
                >
                  <Ionicons name="chatbox-ellipses-outline" size={12} color={theme.colors.textMuted} />
                  <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
                    {row.note}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
