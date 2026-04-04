import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '@/context/network-context';
import { Colors } from '@/constants/theme';

export function OfflineBanner() {
  const { isOnline, pendingCount, syncNow } = useNetwork();

  if (isOnline && pendingCount === 0) return null;

  const label = !isOnline
    ? pendingCount > 0
      ? `Offline — ${pendingCount} recording${pendingCount !== 1 ? 's' : ''} queued`
      : "You're offline"
    : `${pendingCount} recording${pendingCount !== 1 ? 's' : ''} waiting to sync`;

  return (
    <View style={[styles.banner, !isOnline ? styles.offline : styles.pending]}>
      <Ionicons
        name={!isOnline ? 'cloud-offline-outline' : 'sync-outline'}
        size={14}
        color={Colors.white}
      />
      <Text style={styles.text}>{label}</Text>
      {isOnline && pendingCount > 0 && (
        <TouchableOpacity onPress={syncNow} style={styles.syncBtn} activeOpacity={0.8}>
          <Text style={styles.syncBtnText}>Sync now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 8,
  },
  offline: { backgroundColor: Colors.gray600 },
  pending: { backgroundColor: Colors.warning },
  text: { flex: 1, color: Colors.white, fontSize: 12, fontWeight: '500' },
  syncBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  syncBtnText: { color: Colors.white, fontSize: 12, fontWeight: '700' },
});
