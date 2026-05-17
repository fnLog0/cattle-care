import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { useCattleDetail } from '@/hooks/use-cattle';
import { useAgent } from '@/hooks/use-agent';
import { ChatBubble } from '@/components/chat-bubble';
import { ChatInput } from '@/components/chat-input';
import { QuickChips } from '@/components/quick-chips';
import { Message } from '@/types';

function TypingIndicator({ label }: { label: string }) {
  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        <ActivityIndicator size="small" color={Colors.gray400} />
        <Text style={styles.typingText}>{label}</Text>
      </View>
    </View>
  );
}

export default function AgentTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cattle } = useCattleDetail(id);
  const { messages, isTyping, sendMessage } = useAgent('health', cattle ?? undefined);
  const flatListRef = useRef<FlatList>(null);
  const { t } = useTranslation();

  const HEALTH_CHIPS = useMemo(
    () => [
      { label: t('agent.chipAnalyze'), value: t('agent.chipAnalyze') },
      { label: t('agent.chipRisks'), value: t('agent.chipRisks') },
      { label: t('agent.chipTreatment'), value: t('agent.chipTreatment') },
      { label: t('agent.chipTemp'), value: t('agent.chipTemp') },
      { label: t('agent.chipFeeding'), value: t('agent.chipFeeding') },
    ],
    [t],
  );

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [sendMessage],
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <ChatBubble message={item} />,
    [],
  );

  return (
    // react-native-keyboard-controller's KeyboardAvoidingView is a drop-in
    // replacement for RN's, but it tracks the keyboard frame-by-frame using
    // a native module — input bar follows the keyboard exactly, no offset
    // calculations needed.
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        ListFooterComponent={isTyping ? <TypingIndicator label={t('agent.typing')} /> : null}
      />

      <QuickChips chips={HEALTH_CHIPS} onSelect={handleSend} disabled={isTyping} />
      <ChatInput
        onSend={handleSend}
        disabled={isTyping}
        placeholder={t('agent.placeholder')}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  messageList: { paddingTop: 12, paddingBottom: 16 },
  typingContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
    alignItems: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  typingText: { fontSize: 14, color: Colors.gray400 },
});
