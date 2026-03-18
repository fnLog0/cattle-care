import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type Props = {
  icon: string;
  iconColor?: string;
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
};

export function MenuRow({
  icon,
  iconColor = Colors.gray600,
  label,
  value,
  onPress,
  destructive = false,
  showChevron = true,
}: Props) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon as any} size={20} color={destructive ? Colors.danger : iconColor} />
      </View>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, destructive && styles.labelDestructive]}>{label}</Text>
        {value && <Text style={styles.value}>{value}</Text>}
      </View>
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={destructive ? Colors.danger : Colors.gray400}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 58,
    backgroundColor: Colors.white,
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: { flex: 1 },
  label: { fontSize: 16, fontWeight: '500', color: Colors.gray800 },
  labelDestructive: { color: Colors.danger },
  value: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
});
