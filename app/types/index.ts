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
  rectalTemperature: number;
  respirationRate: number;
  strainIndex: number;
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
  imageUrl?: string | null;
  stressLevel: StressLevel;
  latestVitals?: Vitals | null;
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
