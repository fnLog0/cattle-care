export type User = {
  id: string;
  phone?: string | null;
  email?: string | null;
  fullName: string | null;
  profileImage?: string | null;
  status: 'active' | 'notActive' | 'banned';
};

export type Breed = 'zebu' | 'crossBreed' | 'murrah';

export type StressLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'danger';

export type Vitals = {
  id: string;
  cattleId: string;
  temperature: number;
  respiratoryRate: number;
  humidity: number;
  heartRate: number;
  stressIndex: number;
  stressLevel: StressLevel;
  recordedAt: string;
};

export type Cattle = {
  id: string;
  name: string;
  breed: Breed;
  age: number;
  weight: number;
  earTag: string;
  stressLevel: StressLevel;
  latestVitals?: Vitals;
  userId: string;
  createdAt: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type HerdSummary = {
  totalCattle: number;
  stressDistribution: Record<StressLevel, number>;
};
