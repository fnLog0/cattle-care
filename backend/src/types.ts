import type { Context } from 'hono';

export type UserRow = {
  id: string;
  phone: string | null;
  google_id: string | null;
  email: string | null;
  full_name: string | null;
  profile_image: string | null;
  status: 'active' | 'notActive' | 'banned';
  phone_verified: number;
  created_at: string;
  updated_at: string;
};

export type CattleRow = {
  id: string;
  user_id: string;
  name: string;
  breed: 'zebu' | 'crossBreed' | 'murrah';
  age: number;
  weight: number;
  ear_tag: string;
  stress_level: 'none' | 'mild' | 'moderate' | 'severe' | 'danger';
  created_at: string;
  updated_at: string;
};

export type VitalsRow = {
  id: string;
  cattle_id: string;
  body_temperature: number;
  respiratory_rate: number;
  heart_rate: number | null;
  ambient_temperature: number;
  humidity: number;
  stress_index: number;
  stress_level: 'none' | 'mild' | 'moderate' | 'severe' | 'danger';
  recorded_at: string;
};

export type SessionRow = {
  id: string;
  user_id: string;
  token: string;
  created_at: string;
  expires_at: string;
};

export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  MSG91_AUTH_KEY: string;
  MSG91_TEMPLATE_ID: string;
  MSG91_SENDER_ID: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  DEV_MODE: string;
  ANTHROPIC_API_KEY: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: {
    user: UserRow;
    session: SessionRow;
  };
};

export type AppContext = Context<AppEnv>;
