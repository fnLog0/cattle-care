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
import { SummaryCard } from '@/components/summary-card';
import * as cattleService from '@/services/cattle';
import { Message } from '@/types';
import { StatusBar } from 'expo-status-bar';

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
  const { messages, isTyping, sendMessage, isRegistrationComplete, cattleData, resetChat } =
    useAgent('registration');

  const flatListRef = useRef<FlatList>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    [sendMessage]
  );

  const handleConfirm = useCallback(async () => {
    if (!cattleData) {
      Alert.alert('Incomplete', 'Please complete all required fields.');
      return;
    }

    setIsSaving(true);
    try {
      await cattleService.addCattle({
        name: cattleData.name,
        breed: cattleData.breed as any,
        age: cattleData.age,
        weight: cattleData.weight,
        earTag: cattleData.earTag,
        userId: user?.id ?? 'user-1',
      });
      Alert.alert('Success!', `${cattleData.name} has been added to your herd.`, [
        { text: 'Go to Herd', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save cattle. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [cattleData, user, router]);

  const handleEdit = useCallback(() => {
    resetChat();
  }, [resetChat]);

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
              {isRegistrationComplete && cattleData && !isTyping && (
                <SummaryCard
                  data={cattleData}
                  onConfirm={handleConfirm}
                  onEdit={handleEdit}
                  isLoading={isSaving}
                />
              )}
            </>
          }
        />

        {!isRegistrationComplete && (
          <ChatInput
            onSend={handleSend}
            disabled={isTyping || isSaving}
            placeholder="Type your answer..."
          />
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
