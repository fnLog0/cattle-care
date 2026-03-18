import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useCattleDetail } from '@/hooks/use-cattle';
import { useAgent } from '@/hooks/use-agent';
import { ChatBubble } from '@/components/chat-bubble';
import { ChatInput } from '@/components/chat-input';
import { QuickChips } from '@/components/quick-chips';
import { Message } from '@/types';

const HEALTH_CHIPS = [
  { label: 'Analyze stress', value: 'Analyze stress' },
  { label: 'Health risks?', value: 'What are the health risks?' },
  { label: 'Recommend treatment', value: 'Recommend treatment' },
  { label: 'Check temperature', value: 'Check temperature' },
  { label: 'Feeding advice', value: 'Feeding advice' },
];

function TypingIndicator() {
  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingAvatar}>
        <Text style={styles.typingAvatarText}>AI</Text>
      </View>
      <View style={styles.typingBubble}>
        <ActivityIndicator size="small" color={Colors.gray400} />
        <Text style={styles.typingText}>Analyzing...</Text>
      </View>
    </View>
  );
}

export default function AgentTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cattle } = useCattleDetail(id);
  const { messages, isTyping, sendMessage } = useAgent('health', cattle ?? undefined);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [sendMessage]
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <ChatBubble message={item} />,
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      <QuickChips chips={HEALTH_CHIPS} onSelect={handleSend} disabled={isTyping} />
      <ChatInput
        onSend={handleSend}
        disabled={isTyping}
        placeholder="Ask about health, stress, treatment..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  messageList: { paddingTop: 12, paddingBottom: 16 },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 4,
    gap: 8,
  },
  typingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingAvatarText: { fontSize: 11, fontWeight: '800', color: Colors.white },
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
