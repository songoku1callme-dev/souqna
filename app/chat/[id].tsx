import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useMessages, useSendMessage } from '@/api/hooks';
import { ReportSheet } from '@/components/ReportSheet';
import { IconButton } from '@/components/ui/IconButton';
import { Sheet } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { CONVERSATIONS } from '@/data/conversations';
import { useTheme } from '@/theme/ThemeProvider';
import type { Message } from '@/types';
import { formatTime } from '@/utils/format';

export default function ChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversation = CONVERSATIONS.find((c) => c.id === id);

  const messages = useMessages(id);
  const sendMessage = useSendMessage(id);
  const [draft, setDraft] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    sendMessage.mutate(text);
  };

  const block = () => {
    setMenuOpen(false);
    toast.success(t('inbox.blocked'));
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          title: conversation?.participantName ?? t('inbox.title'),
          headerRight: () => (
            <IconButton
              icon="ellipsis-horizontal"
              size={20}
              onPress={() => setMenuOpen(true)}
              accessibilityLabel={t('inbox.options')}
            />
          ),
        }}
      />

      <FlatList
        data={messages.data ?? []}
        inverted
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}
        renderItem={({ item }) => <MessageBubble message={item} />}
      />

      <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.colors.surfaceElevated }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            padding: theme.spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.pill,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.spacing.lg,
            }}
          >
            <ChatInput
              value={draft}
              onChangeText={setDraft}
              placeholder={t('inbox.messagePlaceholder')}
            />
          </View>
          <IconButton
            icon="send"
            color="onPrimary"
            onPress={send}
            style={{ backgroundColor: theme.colors.primary }}
            accessibilityLabel={t('inbox.send')}
          />
        </View>
      </SafeAreaView>

      <Sheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={conversation?.participantName}
      >
        <View style={{ gap: theme.spacing.sm, paddingBottom: theme.spacing.lg }}>
          <MenuRow
            icon="flag-outline"
            label={t('inbox.report')}
            onPress={() => {
              setMenuOpen(false);
              setReportOpen(true);
            }}
          />
          <MenuRow icon="ban-outline" label={t('inbox.block')} danger onPress={block} />
        </View>
      </Sheet>

      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="conversation"
        targetId={id}
      />
    </KeyboardAvoidingView>
  );
}

function ChatInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  const theme = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textMuted}
      multiline
      style={{
        color: theme.colors.text,
        fontSize: theme.fontSize.md,
        paddingVertical: theme.spacing.md,
        maxHeight: 120,
        textAlign: 'auto',
        writingDirection: 'auto',
      }}
    />
  );
}

function MessageBubble({ message }: { message: Message }) {
  const theme = useTheme();
  const mine = message.senderId === 'me';
  return (
    <View
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        backgroundColor: mine ? theme.colors.primary : theme.colors.surface,
        borderWidth: mine ? 0 : 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: 2,
      }}
    >
      <Text variant="body" style={{ color: mine ? theme.colors.onPrimary : theme.colors.text }}>
        {message.body}
      </Text>
      <Text
        variant="caption"
        style={{
          color: mine ? theme.colors.onPrimary : theme.colors.textMuted,
          opacity: 0.8,
          alignSelf: 'flex-end',
          fontSize: 10,
        }}
      >
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  danger,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const tint = danger ? theme.colors.danger : theme.colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.radii.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Ionicons name={icon} size={20} color={tint} />
      <Text variant="body" style={{ color: tint }}>
        {label}
      </Text>
    </Pressable>
  );
}
