import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StressLevel } from '@/types';
import { STRESS_COLORS, STRESS_LABELS } from '@/constants/stress';

type Props = {
  level: StressLevel;
  size?: 'sm' | 'md';
};

export function StressBadge({ level, size = 'md' }: Props) {
  const color = STRESS_COLORS[level];
  const label = STRESS_LABELS[level];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color + '20', borderColor: color },
        size === 'sm' && styles.badgeSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }, size === 'sm' && styles.labelSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 12,
  },
});
