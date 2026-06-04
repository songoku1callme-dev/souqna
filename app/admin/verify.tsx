import { useState } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import {
  useApproveVerification,
  usePendingVerifications,
  useRejectVerification,
} from '@/api/hooks';
import { signedVerificationDocUrls } from '@/api/storageApi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineError } from '@/components/ui/InlineError';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useLocale } from '@/hooks/useLocale';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { PendingVerification } from '@/types';
import { formatDate } from '@/utils/format';

export default function AdminVerifyScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const toast = useToast();
  const isAdmin = !!useAuthStore((s) => s.user)?.roles.includes('admin');

  const queue = usePendingVerifications(isAdmin);
  const approve = useApproveVerification();
  const reject = useRejectVerification();

  const [rejecting, setRejecting] = useState<PendingVerification | null>(null);
  const [reason, setReason] = useState('');

  if (!isAdmin) {
    return (
      <Screen edges={[]}>
        <EmptyState
          icon="lock-closed-outline"
          title={t('admin.notAuthorizedTitle')}
          body={t('admin.notAuthorizedBody')}
        />
      </Screen>
    );
  }

  const onApprove = async (item: PendingVerification) => {
    try {
      await approve.mutateAsync({
        requestId: item.id,
        sellerProfileId: item.sellerProfileId,
        userId: item.userId,
      });
      toast.success(t('admin.approved'));
    } catch {
      toast.error(t('admin.actionFailed'));
    }
  };

  const submitReject = async () => {
    if (!rejecting) return;
    try {
      await reject.mutateAsync({
        requestId: rejecting.id,
        sellerProfileId: rejecting.sellerProfileId,
        userId: rejecting.userId,
        reason: reason.trim(),
      });
      toast.success(t('admin.rejected'));
      setRejecting(null);
      setReason('');
    } catch {
      toast.error(t('admin.actionFailed'));
    }
  };

  return (
    <Screen scroll edges={[]} contentContainerStyle={{ gap: theme.spacing.lg }}>
      <Text variant="body" color="textMuted">
        {t('admin.queueIntro')}
      </Text>

      {queue.isLoading ? (
        <View style={{ paddingVertical: theme.spacing['2xl'] }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : queue.isError ? (
        <InlineError onRetry={() => void queue.refetch()} />
      ) : !queue.data || queue.data.length === 0 ? (
        <EmptyState
          icon="checkmark-done-outline"
          title={t('admin.emptyTitle')}
          body={t('admin.emptyBody')}
        />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          {queue.data.map((item) => (
            <VerificationCard
              key={item.id}
              item={item}
              busy={approve.isPending || reject.isPending}
              onApprove={() => void onApprove(item)}
              onReject={() => {
                setReason('');
                setRejecting(item);
              }}
            />
          ))}
        </View>
      )}

      <Sheet
        visible={!!rejecting}
        onClose={() => setRejecting(null)}
        title={t('admin.rejectTitle')}
        footer={
          <Button
            title={t('admin.confirmReject')}
            onPress={() => void submitReject()}
            loading={reject.isPending}
            disabled={reject.isPending}
          />
        }
      >
        <View style={{ gap: theme.spacing.md, paddingVertical: theme.spacing.sm }}>
          <Text variant="body" color="textMuted">
            {t('admin.rejectBody', { name: rejecting?.displayName ?? '' })}
          </Text>
          <Input
            label={t('admin.reasonLabel')}
            hint={t('admin.reasonHint')}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
          />
        </View>
      </Sheet>
    </Screen>
  );
}

function VerificationCard({
  item,
  busy,
  onApprove,
  onReject,
}: {
  item: PendingVerification;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { cityName } = useLocale();
  const toast = useToast();
  const [docUrls, setDocUrls] = useState<string[] | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const viewDocs = async () => {
    if (item.documentPaths.length === 0) return;
    setLoadingDocs(true);
    try {
      const urls = await signedVerificationDocUrls(item.documentPaths);
      setDocUrls(urls);
      if (urls.length === 0) toast.error(t('admin.docsUnavailable'));
    } catch {
      toast.error(t('admin.docsUnavailable'));
    } finally {
      setLoadingDocs(false);
    }
  };

  return (
    <Card padded elevated style={{ gap: theme.spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.spacing.sm,
        }}
      >
        <Text variant="subtitle" style={{ flex: 1 }}>
          {item.displayName}
        </Text>
        <Badge label={t('sell.statusPending')} tone="warning" small />
      </View>

      {item.legalName ? (
        <DetailRow icon="document-text-outline" text={item.legalName} />
      ) : null}
      {item.cityId ? <DetailRow icon="location-outline" text={cityName(item.cityId)} /> : null}
      <DetailRow icon="time-outline" text={t('admin.pendingSince', { date: formatDate(item.createdAt) })} />

      {item.documentPaths.length > 0 ? (
        <Button
          title={t('admin.viewDocuments', { count: item.documentPaths.length })}
          variant="ghost"
          icon="folder-open-outline"
          fullWidth={false}
          loading={loadingDocs}
          onPress={() => void viewDocs()}
        />
      ) : (
        <Text variant="caption" color="textMuted">
          {t('admin.noDocuments')}
        </Text>
      )}

      {docUrls && docUrls.length > 0 ? (
        <View style={{ gap: theme.spacing.xs }}>
          {docUrls.map((url, i) => (
            <Button
              key={url}
              title={t('admin.openDocument', { index: i + 1 })}
              variant="secondary"
              icon="open-outline"
              fullWidth={false}
              onPress={() => void Linking.openURL(url)}
            />
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
        <Button
          title={t('admin.reject')}
          variant="secondary"
          onPress={onReject}
          disabled={busy}
          style={{ flex: 1 }}
        />
        <Button
          title={t('admin.approve')}
          onPress={onApprove}
          disabled={busy}
          style={{ flex: 1 }}
        />
      </View>
    </Card>
  );
}

function DetailRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <Ionicons name={icon} size={16} color={theme.colors.textMuted} />
      <Text variant="caption" color="textMuted" style={{ flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}
