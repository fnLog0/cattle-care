import type { VitalsRow } from '../../db/vitals';

export function formatVitals(row: VitalsRow) {
  return {
    id: row.id,
    cattleId: row.cattle_id,
    temperature: row.temperature,
    respiratoryRate: row.respiratory_rate,
    humidity: row.humidity,
    heartRate: row.heart_rate,
    stressIndex: row.stress_index,
    stressLevel: row.stress_level,
    recordedAt: row.recorded_at,
  };
}
