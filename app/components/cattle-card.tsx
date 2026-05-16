import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cattle } from '@/types';
import { Colors } from '@/constants/theme';
import { STRESS_COLORS } from '@/constants/stress';
import { StressBadge } from './stress-badge';

const BREED_LABELS: Record<string, string> = {
  zebu: 'Zebu',
  crossBreed: 'Cross Breed',
  murrah: 'Murrah',
};

type Props = {
  cattle: Cattle;
  onPress: () => void;
};

export function CattleCard({ cattle, onPress }: Props) {
  const accentColor = STRESS_COLORS[cattle.stressLevel];
  const vitals = cattle.latestVitals;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: accentColor + '20' }]}>
              <Ionicons name="paw" size={22} color={accentColor} />
            </View>
          </View>

          <View style={styles.info}>
            <Text style={styles.name}>{cattle.name}</Text>
            <Text style={styles.meta}>
              {BREED_LABELS[cattle.breed] ?? cattle.breed} · {cattle.age}y · {cattle.weight}kg
            </Text>
            <Text style={styles.tag}>
              <Ionicons name="pricetag-outline" size={12} color={Colors.gray400} /> {cattle.earTag}
            </Text>
          </View>

          <View style={styles.badgeContainer}>
            <StressBadge level={cattle.stressLevel} />
          </View>
        </View>

        {vitals && (
          <View style={styles.vitalsRow}>
            <VitalChip icon="thermometer-outline" value={`${vitals.rectalTemperature}°C`} />
            <VitalChip icon="fitness-outline" value={`${vitals.respirationRate}/min`} />
            <VitalChip icon="pulse-outline" value={`SI ${vitals.strainIndex.toFixed(1)}`} />
          </View>
        )}
      </View>

      <View style={styles.chevronContainer}>
        <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
      </View>
    </TouchableOpacity>
  );
}

function VitalChip({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={styles.vitalChip}>
      <Ionicons name={icon as any} size={13} color={Colors.gray600} />
      <Text style={styles.vitalValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  accentBar: {
    width: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  content: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarContainer: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 17, fontWeight: '700', color: Colors.gray800 },
  meta: { fontSize: 14, color: Colors.gray600 },
  tag: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
  badgeContainer: { alignItems: 'flex-end' },
  vitalsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  vitalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  vitalValue: { fontSize: 12, color: Colors.gray600, fontWeight: '500' },
  chevronContainer: {
    justifyContent: 'center',
    paddingRight: 12,
  },
});
