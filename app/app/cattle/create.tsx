import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAgent } from '@/hooks/use-agent';
import { useAuth } from '@/hooks/use-auth';
import { ChatBubble } from '@/components/chat-bubble';
import { ChatInput } from '@/components/chat-input';
import { QuickChips } from '@/components/quick-chips';
import { SummaryCard } from '@/components/summary-card';
import * as cattleService from '@/services/cattle';
import { Message } from '@/types';
import { StatusBar } from 'expo-status-bar';

const BREED_CHIPS = [
  { label: 'Zebu', value: 'Zebu' },
  { label: 'Cross Breed', value: 'Cross Breed' },
  { label: 'Murrah', value: 'Murrah' },
];

function TypingIndicator() {
  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingAvatar}>
        <Text style={styles.typingAvatarText}>AI</Text>
      </View>
      <View style={styles.typingBubble}>
        <ActivityIndicator size="small" color={Colors.gray400} />
        <Text style={styles.typingText}>Typing...</Text>
      </View>
    </View>
  );
}

export default function CreateCattleScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { messages, isTyping, sendMessage, registrationState, isRegistrationComplete, resetChat } =
    useAgent('registration');

  const flatListRef = useRef<FlatList>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Show summary card when confirm step reached
  React.useEffect(() => {
    if (registrationState.step === 'confirm') {
      setShowSummary(true);
    }
  }, [registrationState.step]);

  const handleSend = useCallback(
    (text: string) => {
      setShowSummary(false);
      sendMessage(text);
      // Scroll to bottom after a short delay
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [sendMessage]
  );

  const handleConfirm = useCallback(async () => {
    const { collected } = registrationState;
    if (
      !collected.name ||
      !collected.breed ||
      collected.age === undefined ||
      collected.weight === undefined ||
      !collected.earTag
    ) {
      Alert.alert('Incomplete', 'Please complete all required fields.');
      return;
    }

    setIsSaving(true);
    try {
      await cattleService.addCattle({
        name: collected.name,
        breed: collected.breed as any,
        age: collected.age,
        weight: collected.weight,
        earTag: collected.earTag,
        userId: user?.id ?? 'user-1',
      });
      Alert.alert('Success!', `${collected.name} has been added to your herd.`, [
        { text: 'Go to Herd', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save cattle. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [registrationState, user, router]);

  const handleEdit = useCallback(() => {
    setShowSummary(false);
    resetChat();
  }, [resetChat]);

  // Determine chips to show based on step
  const chips =
    registrationState.step === 'breed' && !isTyping ? BREED_CHIPS : [];

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <ChatBubble message={item} />,
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.statusBarSeparator} />
      <View style={styles.headerBar}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>AI</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Cattle Registration</Text>
          <Text style={styles.headerSubtitle}>AI-assisted registration</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <>
              {isTyping && <TypingIndicator />}
              {showSummary && !isTyping && (
                <SummaryCard
                  data={registrationState.collected}
                  onConfirm={handleConfirm}
                  onEdit={handleEdit}
                  isLoading={isSaving}
                />
              )}
            </>
          }
        />

        {!showSummary && (
          <>
            {chips.length > 0 && (
              <QuickChips chips={chips} onSelect={handleSend} disabled={isTyping} />
            )}
            <ChatInput
              onSend={handleSend}
              disabled={isTyping || isSaving || isRegistrationComplete}
              placeholder={
                registrationState.step === 'name'
                  ? 'Enter cattle name...'
                  : registrationState.step === 'breed'
                  ? 'Enter breed or tap a chip...'
                  : registrationState.step === 'age'
                  ? 'Enter age in years...'
                  : registrationState.step === 'weight'
                  ? 'Enter weight in kg...'
                  : registrationState.step === 'earTag'
                  ? 'Enter ear tag (e.g. ET-011)...'
                  : 'Type a message...'
              }
            />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  statusBarSeparator: { height: 1, backgroundColor: Colors.gray200 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: { fontSize: 14, fontWeight: '800', color: Colors.white },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray800 },
  headerSubtitle: { fontSize: 13, color: Colors.gray400 },
  keyboardView: { flex: 1 },
  messageList: {
    paddingTop: 12,
    paddingBottom: 16,
  },
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
