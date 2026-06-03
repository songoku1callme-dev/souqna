import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/theme/ThemeProvider';
import type { ReportReason, ReportTargetType } from '@/types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Sheet } from './ui/Sheet';
import { Text } from './ui/Text';
import { useToast } from './ui/Toast';

const REASONS: { value: ReportReason; key: string }[] = [
  { value: 'spam', key: 'trust.reasonSpam' },
  { value: 'prohibited', key: 'trust.reasonProhibited' },
  { value: 'scam', key: 'trust.reasonScam' },
  { value: 'offensive', key: 'trust.reasonOffensive' },
  { value: 'other', key: 'trust.reasonOther' },
];

export type ReportSheetProps = {
  visible: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
};

export function ReportSheet({ visible, onClose }: ReportSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');

  const submit = () => {
    // In a Supabase build this inserts into `reports`. Here we acknowledge.
    onClose();
    setReason(null);
    setDetails('');
    toast.success(t('trust.reportThanks'));
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('trust.reportReasonTitle')}
      footer={
        <View style={{ paddingBottom: theme.spacing.sm }}>
          <Button title={t('trust.submitReport')} disabled={!reason} onPress={submit} />
        </View>
      }
    >
      <View style={{ gap: theme.spacing.sm }}>
        {REASONS.map((item) => {
          const active = reason === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => setReason(item.value)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: theme.spacing.md,
                borderRadius: theme.radii.md,
                borderWidth: 1,
                borderColor: active ? theme.colors.primary : theme.colors.border,
                backgroundColor: active ? theme.colors.primaryMuted : theme.colors.surface,
              }}
            >
              <Text variant="body">{t(item.key)}</Text>
              <Ionicons
                name={active ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={active ? theme.colors.primary : theme.colors.textMuted}
              />
            </Pressable>
          );
        })}
        <Input
          label={t('trust.reportDetails')}
          value={details}
          onChangeText={setDetails}
          multiline
          containerStyle={{ marginTop: theme.spacing.sm }}
        />
      </View>
    </Sheet>
  );
}
