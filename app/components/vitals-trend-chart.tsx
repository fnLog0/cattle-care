import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Colors } from '@/constants/theme';
import { STRESS_COLORS } from '@/constants/stress';
import type { VitalsReading } from '@/services/vitals';

type Props = {
  readings: VitalsReading[];
  rangeLabel?: string; // e.g. "Last 7 days"
};

const SCREEN_WIDTH = Dimensions.get('window').width;

function formatShortDate(iso: string): string {
  const d = new Date(iso.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function VitalsTrendChart({ readings, rangeLabel }: Props) {
  const points = useMemo(
    () =>
      readings.map((r, idx) => ({
        value: r.strainIndex,
        label: idx % Math.max(1, Math.ceil(readings.length / 6)) === 0 ? formatShortDate(r.recordedAt) : '',
        dataPointColor: STRESS_COLORS[r.stressLevel],
      })),
    [readings],
  );

  if (readings.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No readings yet — record vitals to see the trend.</Text>
      </View>
    );
  }

  const maxStrain = Math.max(8, ...readings.map((r) => r.strainIndex));
  const chartWidth = SCREEN_WIDTH - 80;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Strain Index Trend</Text>
        {rangeLabel ? <Text style={styles.subtitle}>{rangeLabel}</Text> : null}
      </View>
      <LineChart
        data={points}
        width={chartWidth}
        height={180}
        thickness={2.5}
        color={Colors.primary}
        startFillColor={Colors.primary}
        endFillColor={Colors.white}
        startOpacity={0.25}
        endOpacity={0.0}
        areaChart
        curved
        yAxisOffset={0}
        maxValue={Math.ceil(maxStrain)}
        noOfSections={4}
        yAxisTextStyle={styles.axisText}
        xAxisLabelTextStyle={styles.axisText}
        rulesColor={Colors.gray100}
        yAxisColor={Colors.gray200}
        xAxisColor={Colors.gray200}
        dataPointsRadius={4}
        dataPointsColor={Colors.primary}
        initialSpacing={8}
        endSpacing={8}
      />
      <View style={styles.legend}>
        <LegendDot color={STRESS_COLORS.none} label="none" />
        <LegendDot color={STRESS_COLORS.mild} label="mild" />
        <LegendDot color={STRESS_COLORS.moderate} label="moderate" />
        <LegendDot color={STRESS_COLORS.severe} label="severe" />
        <LegendDot color={STRESS_COLORS.danger} label="danger" />
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  header: { gap: 2 },
  title: { fontSize: 16, fontWeight: '700', color: Colors.gray800 },
  subtitle: { fontSize: 13, color: Colors.gray400 },
  axisText: { fontSize: 11, color: Colors.gray400 },
  empty: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: Colors.gray400, textAlign: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: Colors.gray600 },
});
