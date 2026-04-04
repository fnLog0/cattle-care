import type { VitalsRow } from '../../db/vitals';

export function formatVitals(row: VitalsRow) {
  return {
    id: row.id,
    cattleId: row.cattle_id,
    bodyTemperature: row.body_temperature,
    respiratoryRate: row.respiratory_rate,
    heartRate: row.heart_rate,
    ambientTemperature: row.ambient_temperature,
    humidity: row.humidity,
    stressIndex: row.stress_index,
    stressLevel: row.stress_level,
    recordedAt: row.recorded_at,
  };
}
