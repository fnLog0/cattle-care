import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { VITAL_RANGES, STRESS_LABELS, STRESS_COLORS } from '@/constants/stress';
import { useCattleDetail } from '@/hooks/use-cattle';
import { StressGauge } from '@/components/stress-gauge';
import { VitalCard } from '@/components/vital-card';
import { useDetailTab } from './_layout';

export default function VitalsTab() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cattle, isLoading } = useCattleDetail(id);
  const { switchToAgent } = useDetailTab();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const vitals = cattle?.latestVitals;
  const stressColor = vitals ? STRESS_COLORS[vitals.stressLevel] : Colors.gray400;

  return (
    <View style={styles.wrapper}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Stress gauge section */}
      <View style={styles.gaugeCard}>
        <Text style={styles.sectionTitle}>Stress Index</Text>
        {vitals ? (
          <>
            <View style={styles.gaugeContainer}>
              <StressGauge
                stressIndex={vitals.stressIndex}
                stressLevel={vitals.stressLevel}
                size={180}
              />
            </View>
            <View style={[styles.stressAlert, { backgroundColor: stressColor + '15', borderColor: stressColor + '40' }]}>
              <Ionicons
                name={
                  vitals.stressLevel === 'none' || vitals.stressLevel === 'mild'
                    ? 'checkmark-circle'
                    : vitals.stressLevel === 'moderate'
                    ? 'warning'
                    : 'alert-circle'
                }
                size={20}
                color={stressColor}
              />
              <Text style={[styles.stressAlertText, { color: stressColor }]}>
                {vitals.stressLevel === 'none'
                  ? `${cattle?.name} is healthy and stress-free.`
                  : vitals.stressLevel === 'mild'
                  ? `${cattle?.name} shows mild stress. Monitor closely.`
                  : vitals.stressLevel === 'moderate'
                  ? `${cattle?.name} is under moderate stress. Take action.`
                  : vitals.stressLevel === 'severe'
                  ? `${cattle?.name} is severely stressed! Immediate attention needed.`
                  : `DANGER: ${cattle?.name} is in critical condition! Contact a vet now.`}
              </Text>
            </View>
            <Text style={styles.lastUpdated}>
              <Ionicons name="time-outline" size={13} color={Colors.gray400} />{' '}
              Last updated: {new Date(vitals.recordedAt).toLocaleString()}
            </Text>
          </>
        ) : (
          <View style={styles.noVitals}>
            <Ionicons name="pulse-outline" size={40} color={Colors.gray400} />
            <Text style={styles.noVitalsText}>No vitals recorded yet</Text>
          </View>
        )}
      </View>

      {/* Vital cards */}
      {vitals && (
        <View style={styles.vitalsSection}>
          <Text style={styles.sectionTitle}>Current Readings</Text>
          <View style={styles.vitalsGrid}>
            <VitalCard
              label={VITAL_RANGES.temperature.label}
              value={vitals.bodyTemperature}
              unit={VITAL_RANGES.temperature.unit}
              icon="thermometer-outline"
              min={VITAL_RANGES.temperature.min}
              max={VITAL_RANGES.temperature.max}
              accentColor="#EF4444"
            />
            <VitalCard
              label={VITAL_RANGES.respiratoryRate.label}
              value={vitals.respiratoryRate}
              unit={VITAL_RANGES.respiratoryRate.unit}
              icon="fitness-outline"
              min={VITAL_RANGES.respiratoryRate.min}
              max={VITAL_RANGES.respiratoryRate.max}
              accentColor={Colors.info}
            />
            {vitals.heartRate != null && (
              <VitalCard
                label={VITAL_RANGES.heartRate.label}
                value={vitals.heartRate}
                unit={VITAL_RANGES.heartRate.unit}
                icon="heart-outline"
                min={VITAL_RANGES.heartRate.min}
                max={VITAL_RANGES.heartRate.max}
                accentColor="#E11D48"
              />
            )}
            <VitalCard
              label={VITAL_RANGES.humidity.label}
              value={vitals.humidity}
              unit={VITAL_RANGES.humidity.unit}
              icon="water-outline"
              min={VITAL_RANGES.humidity.min}
              max={VITAL_RANGES.humidity.max}
              accentColor={Colors.info}
            />
          </View>
        </View>
      )}

      {/* Ask AI CTA */}
      <TouchableOpacity
        style={styles.askAiButton}
        onPress={switchToAgent}
        activeOpacity={0.85}
      >
        <View style={styles.askAiLeft}>
          <Ionicons name="chatbubbles" size={22} color={Colors.primary} />
          <View>
            <Text style={styles.askAiTitle}>Ask AI Health Assistant</Text>
            <Text style={styles.askAiSubtitle}>Get personalized health advice</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </ScrollView>

    {/* Record Vitals FAB */}
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push(`/cattle/${id}/record-vitals` as any)}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={22} color={Colors.white} />
      <Text style={styles.fabText}>Record Vitals</Text>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.gray50 },
  content: { padding: 16, gap: 16, paddingBottom: 100 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gaugeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray800,
    alignSelf: 'flex-start',
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  stressAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    width: '100%',
  },
  stressAlertText: { flex: 1, fontSize: 15, fontWeight: '500', lineHeight: 21 },
  lastUpdated: { fontSize: 13, color: Colors.gray400, alignSelf: 'flex-start' },
  noVitals: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  noVitalsText: { fontSize: 16, color: Colors.gray400 },
  vitalsSection: { gap: 12 },
  vitalsGrid: { gap: 10 },
  askAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
  },
  askAiLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  askAiTitle: { fontSize: 16, fontWeight: '700', color: Colors.primaryDark },
  askAiSubtitle: { fontSize: 13, color: Colors.gray600, marginTop: 2 },
});
