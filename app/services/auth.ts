import { User } from '@/types';
import { apiRequest, getStoredToken } from './api-client';

type AuthResult = { user: User; token: string; isNewUser: boolean };

function mapUser(raw: Record<string, unknown>): User {
  return {
    id: raw.id as string,
    phone: (raw.phone as string | null) ?? null,
    email: (raw.email as string | null) ?? null,
    fullName: (raw.full_name as string | null) ?? null,
    profileImage: (raw.profile_image as string | null) ?? null,
    status: raw.status as User['status'],
  };
}

export async function sendOtp(phone: string): Promise<{ requestId: string; otp?: string }> {
  return apiRequest('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(phone: string, otp: string): Promise<AuthResult> {
  const res = await apiRequest<{ user: Record<string, unknown>; token: string; isNewUser: boolean }>(
    '/api/auth/verify-otp',
    { method: 'POST', body: JSON.stringify({ phone, otp }) },
  );
  return { user: mapUser(res.user), token: res.token, isNewUser: res.isNewUser };
}

export async function googleLogin(googleIdToken: string): Promise<AuthResult> {
  const res = await apiRequest<{ user: Record<string, unknown>; token: string; isNewUser: boolean }>(
    '/api/auth/google',
    { method: 'POST', body: JSON.stringify({ googleIdToken }) },
  );
  return { user: mapUser(res.user), token: res.token, isNewUser: res.isNewUser };
}

export async function registerWithEmail(
  email: string,
  password: string,
  fullName?: string,
): Promise<AuthResult> {
  const res = await apiRequest<{
    user: Record<string, unknown>;
    token: string;
    isNewUser: boolean;
  }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, ...(fullName ? { fullName } : {}) }),
  });
  return { user: mapUser(res.user), token: res.token, isNewUser: res.isNewUser };
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const res = await apiRequest<{
    user: Record<string, unknown>;
    token: string;
    isNewUser: boolean;
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return { user: mapUser(res.user), token: res.token, isNewUser: res.isNewUser };
}

export async function getMe(): Promise<User | null> {
  const token = await getStoredToken();
  if (!token) return null;
  try {
    const raw = await apiRequest<Record<string, unknown>>('/api/auth/me', { token });
    return mapUser(raw);
  } catch {
    return null;
  }
}

export async function updateProfile(
  data: { fullName?: string; image?: string },
): Promise<User> {
  const token = await getStoredToken();
  const raw = await apiRequest<Record<string, unknown>>('/api/auth/profile', {
    method: 'PUT',
    token: token ?? undefined,
    body: JSON.stringify({ fullName: data.fullName, image: data.image }),
  });
  return mapUser(raw);
}
