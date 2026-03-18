import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type Props = {
  label: string;
  value: number;
  unit: string;
  icon: string;
  min: number;
  max: number;
  accentColor?: string;
};

export function VitalCard({ label, value, unit, icon, min, max, accentColor = Colors.primary }: Props) {
  const clampedValue = Math.min(max, Math.max(min, value));
  const progress = (clampedValue - min) / (max - min);

  // Determine status color
  const midpoint = (max - min) / 2 + min;
  const deviation = Math.abs(value - midpoint) / ((max - min) / 2);
  const barColor =
    deviation < 0.4 ? Colors.primary : deviation < 0.7 ? Colors.warning : Colors.danger;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
          <Ionicons name={icon as any} size={20} color={accentColor} />
        </View>
        <View style={styles.labelGroup}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.range}>
            {min} – {max} {unit}
          </Text>
        </View>
        <View style={styles.valueGroup}>
          <Text style={[styles.value, { color: barColor }]}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      <View style={styles.scaleRow}>
        <Text style={styles.scaleMin}>{min}</Text>
        <Text style={styles.scaleMax}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelGroup: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.gray800 },
  range: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
  valueGroup: { alignItems: 'flex-end' },
  value: { fontSize: 22, fontWeight: '800' },
  unit: { fontSize: 12, color: Colors.gray400, marginTop: 1 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray100,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  scaleMin: { fontSize: 11, color: Colors.gray400 },
  scaleMax: { fontSize: 11, color: Colors.gray400 },
});
