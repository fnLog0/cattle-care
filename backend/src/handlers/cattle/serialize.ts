import type { CattleRow } from '../../db/cattle';
import type { CattleWithVitalsRow } from '../../db/cattle/queries';

export function serializeCattle(row: CattleRow) {
  return {
    id: row.id,
    name: row.name,
    breed: row.breed,
    age: row.age,
    weight: row.weight,
    earTag: row.ear_tag,
    imageUrl: row.image_url,
    stressLevel: row.stress_level,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export function serializeCattleWithVitals(row: CattleWithVitalsRow) {
  const base = serializeCattle(row);
  const hasVitals =
    row.latest_strain_index !== null &&
    row.latest_rectal_temperature !== null &&
    row.latest_respiration_rate !== null &&
    row.latest_recorded_at !== null;

  return {
    ...base,
    latestVitals: hasVitals
      ? {
          rectalTemperature: row.latest_rectal_temperature as number,
          respirationRate: row.latest_respiration_rate as number,
          strainIndex: row.latest_strain_index as number,
          stressLevel: row.stress_level,
          recordedAt: row.latest_recorded_at as string,
        }
      : null,
  };
}
