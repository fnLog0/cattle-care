import { User } from '@/types';
import { MOCK_USER } from './data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory store for registered users during session
let currentUser: User | null = null;
const registeredUsers: Array<{ user: User; password: string }> = [
  { user: MOCK_USER, password: 'password123' },
];

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string }> {
  await delay(600);

  // Accept any email/password in mock mode — also check registered users
  const found = registeredUsers.find((u) => u.user.email.toLowerCase() === email.toLowerCase());
  if (found) {
    currentUser = found.user;
    return { user: found.user, token: `mock-token-${found.user.id}` };
  }

  // Accept demo credentials always
  currentUser = { ...MOCK_USER, email };
  return { user: currentUser, token: `mock-token-fallback` };
}

export async function register(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: User; token: string }> {
  await delay(700);

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    fullName,
    status: 'active',
  };

  registeredUsers.push({ user: newUser, password });
  currentUser = newUser;
  return { user: newUser, token: `mock-token-${newUser.id}` };
}

export async function getMe(): Promise<User | null> {
  await delay(300);
  return currentUser;
}

export async function updateProfile(userId: string, data: Partial<User>): Promise<User> {
  await delay(400);
  const found = registeredUsers.find((u) => u.user.id === userId);
  if (found) {
    found.user = { ...found.user, ...data };
    currentUser = found.user;
    return found.user;
  }
  throw new Error('User not found');
}
