import React, { useRef, useState, useCallback, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useCattleDetail } from '@/hooks/use-cattle';
import { useVitals } from '@/hooks/use-vitals';
import { ChatBubble } from '@/components/chat-bubble';
import { ChatInput } from '@/components/chat-input';
import { Message } from '@/types';
import { StatusBar } from 'expo-status-bar';
import * as agentService from '@/services/agent';
import { getEnvironmentalData, WeatherData } from '@/services/weather';

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

function WeatherBanner({ weather }: { weather: WeatherData }) {
  return (
    <View style={styles.weatherBanner}>
      <Ionicons name="location" size={14} color={Colors.primary} />
      <Text style={styles.weatherText}>
        {weather.location ? `${weather.location} · ` : ''}
        {weather.temperature}°C ambient · {weather.humidity}% humidity
      </Text>
    </View>
  );
}

export default function RecordVitalsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cattle } = useCattleDetail(id);
  const { addVitals } = useVitals(id);

  const flatListRef = useRef<FlatList>(null);
  const historyRef = useRef<agentService.VitalsHistory>([]);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Fetch weather on mount, then seed the welcome message
  useEffect(() => {
    async function fetchWeather() {
      setWeatherLoading(true);
      const data = await getEnvironmentalData();
      setWeatherLoading(false);

      if (!data) {
        Alert.alert(
          'Location unavailable',
          'Could not fetch weather data. Please allow location access and try again.',
          [{ text: 'Go back', onPress: () => router.back() }],
        );
        return;
      }

      setWeather(data);
      const welcome = agentService.getVitalsWelcome(
        cattle?.name ?? 'your cattle',
        data.temperature,
        data.humidity,
        data.location,
      );
      setMessages([
        { id: 'welcome', role: 'assistant', content: welcome, timestamp: new Date().toISOString() },
      ]);
    }

    if (cattle) fetchWeather();
  }, [cattle]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!weather || isDone) return;

      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const result = await agentService.chatVitals(
          id,
          content,
          historyRef.current,
          {
            ambientTemperature: weather.temperature,
            humidity: weather.humidity,
            location: weather.location,
          },
        );

        historyRef.current = [
          ...historyRef.current,
          { role: 'user' as const, content },
          { role: 'assistant' as const, content: result.response },
        ].slice(-20);

        const assistantMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: result.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (result.isComplete && result.vitalsData) {
          setIsDone(true);
          setIsSaving(true);
          try {
            await addVitals(result.vitalsData);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            setTimeout(() => {
              Alert.alert('Vitals Saved!', 'Stress index has been updated.', [
                { text: 'Done', onPress: () => router.back() },
              ]);
            }, 500);
          } catch {
            Alert.alert('Error', 'Failed to save vitals. Please try again.');
            setIsDone(false);
          } finally {
            setIsSaving(false);
          }
        }
      } catch {
        Alert.alert('Error', 'AI service unavailable. Please try again.');
      } finally {
        setIsTyping(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [weather, isDone, id, addVitals, router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <ChatBubble message={item} />,
    [],
  );

  if (weatherLoading || !cattle) {
    return (
      <SafeAreaView style={styles.centered}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching local conditions...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.statusBarSeparator} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>AI</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Record Vitals</Text>
          <Text style={styles.headerSubtitle}>{cattle.name} · {cattle.earTag}</Text>
        </View>
      </View>

      {weather && <WeatherBanner weather={weather} />}

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
            isTyping || isSaving ? (
              <TypingIndicator />
            ) : null
          }
        />

        {!isDone && (
          <ChatInput
            onSend={handleSend}
            disabled={isTyping || isSaving || weatherLoading}
            placeholder="Type your answer..."
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.gray50 },
  loadingText: { fontSize: 16, color: Colors.gray600 },
  statusBarSeparator: { height: 1, backgroundColor: Colors.gray200 },
  header: {
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
  weatherBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + '20',
  },
  weatherText: { fontSize: 13, color: Colors.primaryDark, fontWeight: '500' },
  keyboardView: { flex: 1 },
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
