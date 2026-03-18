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

// Stress index thresholds
export const STRESS_THRESHOLDS = { none: 0, mild: 20, moderate: 40, severe: 60, danger: 80 };

export function getStressLevel(index: number): StressLevel {
  if (index >= 80) return 'danger';
  if (index >= 60) return 'severe';
  if (index >= 40) return 'moderate';
  if (index >= 20) return 'mild';
  return 'none';
}

// Vital ranges for progress bars (min, max, optimal)
export const VITAL_RANGES = {
  temperature: { min: 35, max: 42, unit: '°C', label: 'Temperature' },
  respiratoryRate: { min: 10, max: 40, unit: '/min', label: 'Respiratory Rate' },
  humidity: { min: 30, max: 90, unit: '%', label: 'Humidity' },
  heartRate: { min: 40, max: 100, unit: 'bpm', label: 'Heart Rate' },
};
