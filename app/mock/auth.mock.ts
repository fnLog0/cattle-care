import { User } from '@/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    phone: '9876543210',
    email: 'farmer@cattlecare.in',
    fullName: 'Rajesh Kumar',
    profileImage: null,
    status: 'active',
  },
];

let currentUser: User | null = null;

export async function sendOtp(phone: string): Promise<{ requestId: string }> {
  await delay(500);
  void phone;
  return { requestId: 'mock-req-id' };
}

export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<{ user: User; token: string; isNewUser: boolean }> {
  await delay(600);
  if (otp !== '1234') throw new Error('Invalid OTP (mock: use 1234)');

  let user = MOCK_USERS.find((u) => u.phone === phone) ?? null;
  let isNewUser = false;

  if (!user) {
    user = { id: `user-${Date.now()}`, phone, email: null, fullName: null, profileImage: null, status: 'active' };
    MOCK_USERS.push(user);
    isNewUser = true;
  }

  currentUser = user;
  return { user, token: `mock-token-${user.id}`, isNewUser };
}

export async function googleLogin(
  _idToken: string,
): Promise<{ user: User; token: string; isNewUser: boolean }> {
  await delay(600);
  const user = MOCK_USERS[0]!;
  currentUser = user;
  return { user, token: `mock-token-${user.id}`, isNewUser: false };
}

export async function getMe(): Promise<User | null> {
  await delay(300);
  return currentUser;
}

export async function updateProfile(data: { fullName?: string; image?: string }): Promise<User> {
  await delay(400);
  if (!currentUser) throw new Error('Not logged in');
  currentUser = {
    ...currentUser,
    fullName: data.fullName ?? currentUser.fullName,
    profileImage: data.image ?? currentUser.profileImage,
  };
  const idx = MOCK_USERS.findIndex((u) => u.id === currentUser!.id);
  if (idx !== -1) MOCK_USERS[idx] = currentUser;
  return currentUser;
}
