import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { STRESS_COLORS } from '@/constants/stress';
import type { EnvironmentalStress } from '@/services/environmental';

type Props = {
  data: EnvironmentalStress | null;
  isLoading: boolean;
  hasLocation: boolean;
};

export function EnvironmentalStressCard({ data, isLoading, hasLocation }: Props) {
  const { t } = useTranslation();

  if (!hasLocation) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="sunny-outline" size={20} color={Colors.gray400} />
          <Text style={styles.title}>{t('environmental.title')}</Text>
        </View>
        <Text style={styles.helper}>{t('environmental.locationDenied')}</Text>
      </View>
    );
  }

  if (isLoading || !data) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="sunny-outline" size={20} color={Colors.gray400} />
          <Text style={styles.title}>{t('environmental.title')}</Text>
        </View>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.gray400} />
          <Text style={styles.helper}>{t('environmental.loading')}</Text>
        </View>
      </View>
    );
  }

  const color = STRESS_COLORS[data.stressLevel];
  const levelCap = data.stressLevel.charAt(0).toUpperCase() + data.stressLevel.slice(1);
  const impact = t(`environmental.impact${levelCap}`);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="sunny-outline" size={20} color={color} />
        <Text style={styles.title}>{t('environmental.title')}</Text>
        <View style={[styles.levelPill, { backgroundColor: color + '20' }]}>
          <Text style={[styles.levelText, { color }]}>{t(`stress.${data.stressLevel}`)}</Text>
        </View>
      </View>
      <View style={styles.metricsRow}>
        <Metric icon="speedometer-outline" label={t('environmental.thi')} value={data.thi.toFixed(1)} />
        <Metric icon="thermometer-outline" label={t('environmental.temperature')} value={`${data.temperature}°C`} />
        <Metric icon="water-outline" label={t('environmental.humidity')} value={`${data.humidity}%`} />
      </View>
      <View style={[styles.impactBox, { backgroundColor: color + '12', borderLeftColor: color }]}>
        <Text style={styles.impactLabel}>{t('environmental.impactLabel')}</Text>
        <Text style={[styles.impactText, { color: Colors.gray800 }]}>{impact}</Text>
      </View>
    </View>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={14} color={Colors.gray400} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.gray800 },
  levelPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelText: { fontSize: 12, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  helper: { fontSize: 13, color: Colors.gray400 },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  metric: { flex: 1, alignItems: 'flex-start', gap: 2 },
  metricLabel: { fontSize: 11, color: Colors.gray400 },
  metricValue: { fontSize: 14, fontWeight: '700', color: Colors.gray800 },
  impactBox: {
    borderRadius: 10,
    borderLeftWidth: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  impactLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray600,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  impactText: { fontSize: 14, lineHeight: 20 },
});
