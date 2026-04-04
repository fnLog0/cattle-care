import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { STRESS_COLORS, STRESS_LABELS } from '@/constants/stress';
import { useReports } from '@/hooks/use-reports';
import { StressBadge } from '@/components/stress-badge';
import { EmptyState } from '@/components/empty-state';
import { StressLevel } from '@/types';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

const STRESS_LEVELS: StressLevel[] = ['danger', 'severe', 'moderate', 'mild', 'none'];

export default function ReportsScreen() {
  const router = useRouter();
  const { summary, atRisk, isLoading, refresh } = useReports();
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.statusBarSeparator} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('tabs.reports')}</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('reports.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('reports.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('reports.subtitle')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Herd Overview Card */}
        {summary && (
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View style={styles.overviewIconContainer}>
                <Ionicons name="paw" size={22} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.overviewTitle}>{t('reports.herdOverview')}</Text>
                <Text style={styles.overviewSubtitle}>{t('reports.totalAnimals', { count: summary.totalCattle })}</Text>
              </View>
              <View style={styles.totalBadge}>
                <Text style={styles.totalBadgeText}>{summary.totalCattle}</Text>
                <Text style={styles.totalBadgeLabel}>{t('reports.total')}</Text>
              </View>
            </View>

            {/* Stress distribution */}
            <View style={styles.distributionSection}>
              <Text style={styles.distributionTitle}>{t('reports.stressDistribution')}</Text>
              <View style={styles.distributionBars}>
                {STRESS_LEVELS.map((level) => {
                  const count = summary.stressDistribution[level] ?? 0;
                  const pct = summary.totalCattle > 0 ? (count / summary.totalCattle) * 100 : 0;
                  return (
                    <DistributionRow
                      key={level}
                      level={level}
                      count={count}
                      total={summary.totalCattle}
                      percentage={pct}
                    />
                  );
                })}
              </View>
            </View>

            {/* Summary circles */}
            <View style={styles.summaryCircles}>
              <SummaryCircle
                count={(summary.stressDistribution['none'] ?? 0) + (summary.stressDistribution['mild'] ?? 0)}
                label={t('reports.healthy')}
                color={Colors.primary}
              />
              <SummaryCircle
                count={summary.stressDistribution['moderate'] ?? 0}
                label={t('reports.moderate')}
                color={Colors.warning}
              />
              <SummaryCircle
                count={(summary.stressDistribution['severe'] ?? 0) + (summary.stressDistribution['danger'] ?? 0)}
                label={t('reports.atRisk')}
                color={Colors.danger}
              />
            </View>
          </View>
        )}

        {/* At-Risk Cattle Section */}
        <View style={styles.atRiskSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color={Colors.danger} />
            <Text style={styles.sectionTitle}>{t('reports.needsAttention')}</Text>
            {atRisk.length > 0 && (
              <View style={styles.atRiskBadge}>
                <Text style={styles.atRiskBadgeText}>{atRisk.length}</Text>
              </View>
            )}
          </View>

          {atRisk.length === 0 ? (
            <View style={styles.noAtRisk}>
              <Ionicons name="checkmark-circle" size={40} color={Colors.primary} />
              <Text style={styles.noAtRiskTitle}>{t('reports.allClear')}</Text>
              <Text style={styles.noAtRiskText}>{t('reports.allClearMsg')}</Text>
            </View>
          ) : (
            <View style={styles.atRiskList}>
              {atRisk.map((cattle) => (
                <TouchableOpacity
                  key={cattle.id}
                  style={styles.atRiskCard}
                  onPress={() => router.push(`/cattle/${cattle.id}/vitals` as any)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.atRiskAccent,
                      { backgroundColor: STRESS_COLORS[cattle.stressLevel] },
                    ]}
                  />
                  <View style={styles.atRiskContent}>
                    <View style={styles.atRiskTop}>
                      <View>
                        <Text style={styles.atRiskName}>{cattle.name}</Text>
                        <Text style={styles.atRiskMeta}>
                          {cattle.earTag} · {cattle.breed === 'crossBreed' ? 'Cross Breed' : cattle.breed.charAt(0).toUpperCase() + cattle.breed.slice(1)}
                        </Text>
                      </View>
                      <StressBadge level={cattle.stressLevel} size="sm" />
                    </View>
                    {cattle.latestVitals && (
                      <View style={styles.atRiskVitals}>
                        <SmallVital icon="thermometer-outline" value={`${cattle.latestVitals.bodyTemperature}°C`} />
                        <SmallVital icon="fitness-outline" value={`${cattle.latestVitals.respiratoryRate}/min`} />
                        {cattle.latestVitals.heartRate != null && <SmallVital icon="heart-outline" value={`${cattle.latestVitals.heartRate}bpm`} />}
                        <View style={styles.stressIndexPill}>
                          <Text style={styles.stressIndexText}>
                            SI: {cattle.latestVitals.stressIndex.toFixed(0)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.gray400} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {!summary && (
          <EmptyState
            icon="bar-chart-outline"
            title={t('reports.noDataTitle')}
            message={t('reports.noDataMsg')}
            actionLabel={t('common.addCattle')}
            onAction={() => router.push('/cattle/create' as any)}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DistributionRow({
  level,
  count,
  total,
  percentage,
}: {
  level: StressLevel;
  count: number;
  total: number;
  percentage: number;
}) {
  const { t } = useTranslation();
  const color = STRESS_COLORS[level];
  return (
    <View style={distributionStyles.row}>
      <View style={[distributionStyles.dot, { backgroundColor: color }]} />
      <Text style={distributionStyles.label}>{t(`stress.${level}`)}</Text>
      <View style={distributionStyles.barTrack}>
        <View
          style={[
            distributionStyles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={distributionStyles.count}>{count}</Text>
    </View>
  );
}

const distributionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 28,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { width: 72, fontSize: 14, color: Colors.gray600, fontWeight: '500' },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray100,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4 },
  count: { width: 24, fontSize: 14, fontWeight: '700', color: Colors.gray800, textAlign: 'right' },
});

function SummaryCircle({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <View style={circleStyles.container}>
      <View style={[circleStyles.circle, { borderColor: color, backgroundColor: color + '15' }]}>
        <Text style={[circleStyles.count, { color }]}>{count}</Text>
      </View>
      <Text style={circleStyles.label}>{label}</Text>
    </View>
  );
}

const circleStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: 6 },
  circle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { fontSize: 24, fontWeight: '800' },
  label: { fontSize: 13, color: Colors.gray600, fontWeight: '500' },
});

function SmallVital({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={smallVitalStyles.container}>
      <Ionicons name={icon as any} size={12} color={Colors.gray600} />
      <Text style={smallVitalStyles.value}>{value}</Text>
    </View>
  );
}

const smallVitalStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.gray50,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  value: { fontSize: 12, color: Colors.gray600 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  statusBarSeparator: { height: 1, backgroundColor: Colors.gray200 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.gray800 },
  headerSubtitle: { fontSize: 14, color: Colors.gray400, marginTop: 2 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 16, color: Colors.gray600 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  overviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: 12,
  },
  overviewIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray800 },
  overviewSubtitle: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
  totalBadge: {
    marginLeft: 'auto',
    alignItems: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
  },
  totalBadgeText: { fontSize: 20, fontWeight: '800', color: Colors.white },
  totalBadgeLabel: { fontSize: 10, color: Colors.primaryLight, fontWeight: '600' },
  distributionSection: { padding: 16, gap: 10 },
  distributionTitle: { fontSize: 15, fontWeight: '600', color: Colors.gray600, marginBottom: 4 },
  distributionBars: { gap: 6 },
  summaryCircles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  atRiskSection: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray800, flex: 1 },
  atRiskBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atRiskBadgeText: { fontSize: 13, fontWeight: '800', color: Colors.white },
  noAtRisk: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  noAtRiskTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  noAtRiskText: { fontSize: 15, color: Colors.gray600, textAlign: 'center', lineHeight: 22 },
  atRiskList: { gap: 10 },
  atRiskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    paddingRight: 12,
  },
  atRiskAccent: { width: 5, alignSelf: 'stretch' },
  atRiskContent: { flex: 1, padding: 14, gap: 8 },
  atRiskTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  atRiskName: { fontSize: 17, fontWeight: '700', color: Colors.gray800 },
  atRiskMeta: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
  atRiskVitals: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  stressIndexPill: {
    backgroundColor: Colors.gray800,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  stressIndexText: { fontSize: 12, color: Colors.white, fontWeight: '700' },
});
