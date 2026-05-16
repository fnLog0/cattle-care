import { StressLevel } from '@/types';

export const STRESS_COLORS: Record<StressLevel, string> = {
  none: '#16A34A',
  mild: '#65A30D',
  moderate: '#D97706',
  severe: '#EA580C',
  danger: '#DC2626',
};

export const STRESS_LABELS: Record<StressLevel, string> = {
  none: 'Normal',
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
  danger: 'Danger',
};

// Strain Index thresholds (matches backend services/cattle-stress.ts)
export const STRAIN_INDEX_MAX = 10; // SI ≥ 8 is "danger"; pad headroom

export function getStressLevel(strainIndex: number): StressLevel {
  if (strainIndex >= 8) return 'danger';
  if (strainIndex >= 6) return 'severe';
  if (strainIndex >= 4) return 'moderate';
  if (strainIndex >= 2) return 'mild';
  return 'none';
}

// Vital ranges for progress bars (min, max, optimal)
export const VITAL_RANGES = {
  rectalTemperature: { min: 35, max: 42, unit: '°C', label: 'Rectal Temperature' },
  respirationRate: { min: 10, max: 150, unit: '/min', label: 'Respiration Rate' },
};
