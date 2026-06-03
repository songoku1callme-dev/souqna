import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useConversations } from '@/api/hooks';
import { Header } from '@/components/Header';
import { LoginRequired } from '@/components/LoginRequired';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useIsAuthenticated } from '@/store/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { Conversation } from '@/types';
import { formatTime } from '@/utils/format';

export default function InboxScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isAuthenticated = useIsAuthenticated();
  const conversations = useConversations();

  return (
    <Screen scroll edges={['top']} contentContainerStyle={{ gap: theme.spacing.md }}>
      <Header title={t('inbox.title')} />
      {!isAuthenticated ? (
        <LoginRequired />
      ) : conversations.isLoading ? (
        [0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              gap: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
            }}
          >
            <Skeleton width={48} height={48} radius={24} />
            <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
              <Skeleton width="50%" height={12} />
              <Skeleton width="80%" height={10} />
            </View>
          </View>
        ))
      ) : conversations.data && conversations.data.length > 0 ? (
        conversations.data.map((conversation) => (
          <ConversationRow key={conversation.id} conversation={conversation} />
        ))
      ) : (
        <EmptyState
          icon="chatbubbles-outline"
          title={t('inbox.empty')}
          body={t('inbox.emptyBody')}
        />
      )}
    </Screen>
  );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/chat/${conversation.id}`)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: theme.spacing.md,
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Avatar name={conversation.participantName} size={48} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <Text variant="label" numberOfLines={1} style={{ flexShrink: 1 }}>
            {conversation.participantName}
          </Text>
          {conversation.verified ? <VerifiedBadge small /> : null}
        </View>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {conversation.lastMessage}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text variant="caption" color="textMuted">
          {formatTime(conversation.lastMessageAt)}
        </Text>
        {conversation.unreadCount > 0 ? (
          <View
            style={{
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              paddingHorizontal: 6,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="caption" style={{ color: theme.colors.onPrimary, fontSize: 11 }}>
              {conversation.unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
