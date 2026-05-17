import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Message } from '@/types';
import { Colors } from '@/constants/theme';

type Props = {
  message: Message;
};

export function ChatBubble({ message }: Props) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <View style={[styles.row, styles.rowUser]}>
        <View style={[styles.bubble, styles.bubbleUser]}>
          <Text style={[styles.content, styles.contentUser]}>{message.content}</Text>
          <Text style={[styles.timestamp, styles.timestampUser]}>{timestamp}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, styles.rowAssistant]}>
      <View style={[styles.bubble, styles.bubbleAssistant]}>
        <View style={styles.assistantHeader}>
          <View style={styles.assistantIcon}>
            <Ionicons name="sparkles" size={12} color={Colors.white} />
          </View>
          <Text style={styles.assistantLabel}>{t('agent.assistantLabel')}</Text>
        </View>
        <Markdown style={markdownStyles}>{message.content}</Markdown>
        <Text style={[styles.timestamp, styles.timestampAssistant]}>{timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  rowUser: { alignItems: 'flex-end' },
  rowAssistant: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '88%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  assistantIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  contentUser: { color: Colors.white },
  timestamp: { fontSize: 11, alignSelf: 'flex-end', marginTop: 2 },
  timestampUser: { color: 'rgba(255,255,255,0.65)' },
  timestampAssistant: { color: Colors.gray400 },
});

const markdownStyles = StyleSheet.create({
  body: { color: Colors.gray800, fontSize: 16, lineHeight: 22 },
  paragraph: { marginTop: 0, marginBottom: 6, color: Colors.gray800, fontSize: 16, lineHeight: 22 },
  heading1: { fontSize: 18, fontWeight: '700', color: Colors.gray800, marginTop: 6, marginBottom: 4 },
  heading2: { fontSize: 17, fontWeight: '700', color: Colors.gray800, marginTop: 6, marginBottom: 4 },
  heading3: { fontSize: 16, fontWeight: '700', color: Colors.gray800, marginTop: 4, marginBottom: 4 },
  strong: { fontWeight: '700', color: Colors.gray800 },
  em: { fontStyle: 'italic' },
  link: { color: Colors.primary, textDecorationLine: 'underline' },
  bullet_list: { marginVertical: 4 },
  ordered_list: { marginVertical: 4 },
  list_item: { color: Colors.gray800, fontSize: 16, lineHeight: 22 },
  bullet_list_icon: { color: Colors.gray600, marginRight: 6 },
  ordered_list_icon: { color: Colors.gray600, marginRight: 6 },
  code_inline: {
    fontFamily: 'Menlo',
    fontSize: 14,
    color: Colors.gray800,
    backgroundColor: Colors.gray100,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  code_block: {
    fontFamily: 'Menlo',
    fontSize: 14,
    color: Colors.gray800,
    backgroundColor: Colors.gray100,
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  fence: {
    fontFamily: 'Menlo',
    fontSize: 14,
    color: Colors.gray800,
    backgroundColor: Colors.gray100,
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  blockquote: {
    backgroundColor: Colors.gray50,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gray200,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 4,
  },
  hr: { backgroundColor: Colors.gray200, height: 1, marginVertical: 8 },
  table: { borderColor: Colors.gray200, borderWidth: 1, borderRadius: 6, marginVertical: 6 },
  th: { padding: 6, backgroundColor: Colors.gray100 },
  td: { padding: 6 },
});
