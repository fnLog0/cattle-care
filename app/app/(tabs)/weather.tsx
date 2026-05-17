import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { STRESS_COLORS } from '@/constants/stress';
import { useLocation } from '@/hooks/use-location';
import {
  getEnvironmentalForecast,
  type EnvironmentalStressWithForecast,
} from '@/services/environmental';
import { EnvironmentalStressCard } from '@/components/environmental-stress-card';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function WeatherTab() {
  const { t } = useTranslation();
  const { coords, isLoading: locLoading } = useLocation();
  const [data, setData] = useState<EnvironmentalStressWithForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!coords) return;
    setIsLoading(true);
    try {
      const res = await getEnvironmentalForecast(coords.latitude, coords.longitude, 24);
      setData(res);
    } finally {
      setIsLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    load();
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  const chartPoints = useMemo(() => {
    if (!data) return [];
    return data.hourly.map((h, idx) => ({
      value: h.thi,
      label:
        idx % Math.max(1, Math.ceil(data.hourly.length / 6)) === 0
          ? new Date(h.time).getHours() + 'h'
          : '',
      dataPointColor: STRESS_COLORS[h.stressLevel],
    }));
  }, [data]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('environmental.weatherTitle')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Current */}
        <Text style={styles.sectionLabel}>{t('environmental.now')}</Text>
        <EnvironmentalStressCard
          data={data}
          isLoading={locLoading || (isLoading && !data)}
          hasLocation={!!coords}
        />

        {/* Forecast chart */}
        {data && data.hourly.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>{t('environmental.forecastTitle')}</Text>
            <View style={styles.chartCard}>
              <LineChart
                data={chartPoints}
                width={SCREEN_WIDTH - 80}
                height={180}
                thickness={2.5}
                color={Colors.primary}
                startFillColor={Colors.primary}
                endFillColor={Colors.white}
                startOpacity={0.25}
                endOpacity={0.0}
                areaChart
                curved
                yAxisOffset={Math.floor(Math.min(...data.hourly.map((h) => h.thi)) / 5) * 5}
                noOfSections={4}
                yAxisTextStyle={styles.axisText}
                xAxisLabelTextStyle={styles.axisText}
                rulesColor={Colors.gray100}
                yAxisColor={Colors.gray200}
                xAxisColor={Colors.gray200}
                dataPointsRadius={3}
                dataPointsColor={Colors.primary}
                initialSpacing={8}
                endSpacing={8}
              />
            </View>

            {/* Hourly list */}
            <View style={styles.hourlyList}>
              {data.hourly.map((h) => (
                <HourRow key={h.time} hour={h} />
              ))}
            </View>
          </>
        ) : data && data.hourly.length === 0 ? (
          <Text style={styles.helper}>{t('environmental.noForecast')}</Text>
        ) : !coords && !locLoading ? null : (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={Colors.gray400} />
          </View>
        )}

        {coords ? (
          <Text style={styles.coords}>
            {t('environmental.coords')}: {coords.latitude.toFixed(3)}, {coords.longitude.toFixed(3)}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function HourRow({ hour }: { hour: EnvironmentalStressWithForecast['hourly'][number] }) {
  const { t } = useTranslation();
  const color = STRESS_COLORS[hour.stressLevel];
  const date = new Date(hour.time);
  const label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.hourRow}>
      <Text style={styles.hourTime}>{label}</Text>
      <View style={styles.hourMetrics}>
        <Text style={styles.hourMetric}>
          <Ionicons name="thermometer-outline" size={12} color={Colors.gray400} /> {hour.temperature}°
        </Text>
        <Text style={styles.hourMetric}>
          <Ionicons name="water-outline" size={12} color={Colors.gray400} /> {hour.humidity}%
        </Text>
      </View>
      <View style={[styles.hourPill, { backgroundColor: color + '20' }]}>
        <Text style={[styles.hourPillText, { color }]}>
          {hour.thi.toFixed(0)} · {t(`stress.${hour.stressLevel}`)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: Colors.gray800 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray400,
    letterSpacing: 0.8,
    marginTop: 6,
    marginBottom: 2,
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  axisText: { fontSize: 10, color: Colors.gray400 },
  hourlyList: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: 10,
  },
  hourTime: { width: 60, fontSize: 14, fontWeight: '700', color: Colors.gray800 },
  hourMetrics: { flex: 1, flexDirection: 'row', gap: 14 },
  hourMetric: { fontSize: 13, color: Colors.gray600 },
  hourPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  hourPillText: { fontSize: 12, fontWeight: '700' },
  loadingCard: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  helper: { fontSize: 13, color: Colors.gray400, textAlign: 'center', paddingVertical: 20 },
  coords: {
    fontSize: 11,
    color: Colors.gray400,
    textAlign: 'center',
    marginTop: 12,
  },
});
