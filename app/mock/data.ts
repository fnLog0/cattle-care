import { Cattle, User, Vitals } from '@/types';
import { getStressLevel } from '@/constants/stress';

function calcStressIndex(temp: number, respRate: number, heartRate: number): number {
  const raw = (temp - 38.5) * 10 + (respRate - 20) * 2 + (heartRate - 65) * 1.5;
  return Math.min(100, Math.max(0, raw));
}

function makeVitals(
  id: string,
  cattleId: string,
  bodyTemp: number,
  respRate: number,
  humidity: number,
  heartRate: number,
  recordedAt: string
): Vitals {
  const stressIndex = calcStressIndex(bodyTemp, respRate, heartRate);
  return {
    id,
    cattleId,
    bodyTemperature: bodyTemp,
    respiratoryRate: respRate,
    heartRate,
    ambientTemperature: 32,
    humidity,
    stressIndex,
    stressLevel: getStressLevel(stressIndex),
    recordedAt,
  };
}

export const MOCK_USER: User = {
  id: 'user-1',
  email: 'farmer@cattlecare.in',
  fullName: 'Rajesh Kumar',
  status: 'active',
};

// Latest vitals for each cattle
export const MOCK_VITALS: Vitals[] = [
  makeVitals('v-1', 'c-1', 38.5, 20, 60, 65, '2026-03-18T08:00:00Z'),   // Lakshmi - none
  makeVitals('v-2', 'c-2', 39.2, 24, 65, 72, '2026-03-18T08:05:00Z'),   // Ganga - mild
  makeVitals('v-3', 'c-3', 40.1, 28, 70, 78, '2026-03-18T08:10:00Z'),   // Sundari - moderate
  makeVitals('v-4', 'c-4', 40.8, 32, 72, 84, '2026-03-18T08:15:00Z'),   // Champa - severe
  makeVitals('v-5', 'c-5', 41.5, 36, 75, 92, '2026-03-18T08:20:00Z'),   // Radha - danger
  makeVitals('v-6', 'c-6', 38.8, 22, 58, 68, '2026-03-18T08:25:00Z'),   // Nandi - none
  makeVitals('v-7', 'c-7', 39.5, 26, 68, 75, '2026-03-18T08:30:00Z'),   // Kalyani - mild
  makeVitals('v-8', 'c-8', 40.5, 30, 71, 82, '2026-03-18T08:35:00Z'),   // Meera - moderate
  makeVitals('v-9', 'c-9', 41.2, 35, 74, 90, '2026-03-18T08:40:00Z'),   // Durga - danger
  makeVitals('v-10', 'c-10', 40.3, 29, 69, 80, '2026-03-18T08:45:00Z'), // Bhola - severe
];

export const MOCK_CATTLE: Cattle[] = [
  {
    id: 'c-1',
    name: 'Lakshmi',
    breed: 'zebu',
    age: 4,
    weight: 320,
    earTag: 'ET-001',
    stressLevel: MOCK_VITALS[0].stressLevel,
    latestVitals: MOCK_VITALS[0],
    userId: 'user-1',
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'c-2',
    name: 'Ganga',
    breed: 'crossBreed',
    age: 3,
    weight: 295,
    earTag: 'ET-002',
    stressLevel: MOCK_VITALS[1].stressLevel,
    latestVitals: MOCK_VITALS[1],
    userId: 'user-1',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'c-3',
    name: 'Sundari',
    breed: 'murrah',
    age: 5,
    weight: 410,
    earTag: 'ET-003',
    stressLevel: MOCK_VITALS[2].stressLevel,
    latestVitals: MOCK_VITALS[2],
    userId: 'user-1',
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'c-4',
    name: 'Champa',
    breed: 'zebu',
    age: 2,
    weight: 250,
    earTag: 'ET-004',
    stressLevel: MOCK_VITALS[3].stressLevel,
    latestVitals: MOCK_VITALS[3],
    userId: 'user-1',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'c-5',
    name: 'Radha',
    breed: 'crossBreed',
    age: 6,
    weight: 375,
    earTag: 'ET-005',
    stressLevel: MOCK_VITALS[4].stressLevel,
    latestVitals: MOCK_VITALS[4],
    userId: 'user-1',
    createdAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'c-6',
    name: 'Nandi',
    breed: 'zebu',
    age: 7,
    weight: 450,
    earTag: 'ET-006',
    stressLevel: MOCK_VITALS[5].stressLevel,
    latestVitals: MOCK_VITALS[5],
    userId: 'user-1',
    createdAt: '2026-02-10T00:00:00Z',
  },
  {
    id: 'c-7',
    name: 'Kalyani',
    breed: 'murrah',
    age: 3,
    weight: 380,
    earTag: 'ET-007',
    stressLevel: MOCK_VITALS[6].stressLevel,
    latestVitals: MOCK_VITALS[6],
    userId: 'user-1',
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'c-8',
    name: 'Meera',
    breed: 'crossBreed',
    age: 4,
    weight: 310,
    earTag: 'ET-008',
    stressLevel: MOCK_VITALS[7].stressLevel,
    latestVitals: MOCK_VITALS[7],
    userId: 'user-1',
    createdAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'c-9',
    name: 'Durga',
    breed: 'zebu',
    age: 5,
    weight: 340,
    earTag: 'ET-009',
    stressLevel: MOCK_VITALS[8].stressLevel,
    latestVitals: MOCK_VITALS[8],
    userId: 'user-1',
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'c-10',
    name: 'Bhola',
    breed: 'murrah',
    age: 8,
    weight: 490,
    earTag: 'ET-010',
    stressLevel: MOCK_VITALS[9].stressLevel,
    latestVitals: MOCK_VITALS[9],
    userId: 'user-1',
    createdAt: '2026-03-05T00:00:00Z',
  },
];

// Vitals history per cattle (last 10 readings)
export const MOCK_VITALS_HISTORY: Record<string, Vitals[]> = {
  'c-1': [
    makeVitals('vh-1-1', 'c-1', 38.3, 19, 58, 63, '2026-03-17T08:00:00Z'),
    makeVitals('vh-1-2', 'c-1', 38.4, 20, 59, 64, '2026-03-17T14:00:00Z'),
    makeVitals('vh-1-3', 'c-1', 38.5, 20, 60, 65, '2026-03-18T08:00:00Z'),
  ],
  'c-2': [
    makeVitals('vh-2-1', 'c-2', 38.8, 21, 62, 68, '2026-03-17T08:00:00Z'),
    makeVitals('vh-2-2', 'c-2', 39.0, 22, 63, 70, '2026-03-17T14:00:00Z'),
    makeVitals('vh-2-3', 'c-2', 39.2, 24, 65, 72, '2026-03-18T08:05:00Z'),
  ],
  'c-3': [
    makeVitals('vh-3-1', 'c-3', 39.5, 25, 67, 74, '2026-03-17T08:00:00Z'),
    makeVitals('vh-3-2', 'c-3', 39.8, 27, 69, 76, '2026-03-17T14:00:00Z'),
    makeVitals('vh-3-3', 'c-3', 40.1, 28, 70, 78, '2026-03-18T08:10:00Z'),
  ],
  'c-4': [
    makeVitals('vh-4-1', 'c-4', 40.2, 29, 70, 80, '2026-03-17T08:00:00Z'),
    makeVitals('vh-4-2', 'c-4', 40.5, 31, 71, 82, '2026-03-17T14:00:00Z'),
    makeVitals('vh-4-3', 'c-4', 40.8, 32, 72, 84, '2026-03-18T08:15:00Z'),
  ],
  'c-5': [
    makeVitals('vh-5-1', 'c-5', 41.0, 33, 73, 88, '2026-03-17T08:00:00Z'),
    makeVitals('vh-5-2', 'c-5', 41.2, 35, 74, 90, '2026-03-17T14:00:00Z'),
    makeVitals('vh-5-3', 'c-5', 41.5, 36, 75, 92, '2026-03-18T08:20:00Z'),
  ],
  'c-6': [
    makeVitals('vh-6-1', 'c-6', 38.4, 19, 56, 66, '2026-03-17T08:00:00Z'),
    makeVitals('vh-6-2', 'c-6', 38.6, 21, 57, 67, '2026-03-17T14:00:00Z'),
    makeVitals('vh-6-3', 'c-6', 38.8, 22, 58, 68, '2026-03-18T08:25:00Z'),
  ],
  'c-7': [
    makeVitals('vh-7-1', 'c-7', 39.0, 23, 65, 72, '2026-03-17T08:00:00Z'),
    makeVitals('vh-7-2', 'c-7', 39.3, 25, 67, 74, '2026-03-17T14:00:00Z'),
    makeVitals('vh-7-3', 'c-7', 39.5, 26, 68, 75, '2026-03-18T08:30:00Z'),
  ],
  'c-8': [
    makeVitals('vh-8-1', 'c-8', 40.0, 27, 69, 79, '2026-03-17T08:00:00Z'),
    makeVitals('vh-8-2', 'c-8', 40.3, 29, 70, 81, '2026-03-17T14:00:00Z'),
    makeVitals('vh-8-3', 'c-8', 40.5, 30, 71, 82, '2026-03-18T08:35:00Z'),
  ],
  'c-9': [
    makeVitals('vh-9-1', 'c-9', 40.8, 32, 72, 87, '2026-03-17T08:00:00Z'),
    makeVitals('vh-9-2', 'c-9', 41.0, 34, 73, 89, '2026-03-17T14:00:00Z'),
    makeVitals('vh-9-3', 'c-9', 41.2, 35, 74, 90, '2026-03-18T08:40:00Z'),
  ],
  'c-10': [
    makeVitals('vh-10-1', 'c-10', 39.8, 27, 68, 78, '2026-03-17T08:00:00Z'),
    makeVitals('vh-10-2', 'c-10', 40.0, 28, 69, 79, '2026-03-17T14:00:00Z'),
    makeVitals('vh-10-3', 'c-10', 40.3, 29, 69, 80, '2026-03-18T08:45:00Z'),
  ],
};
