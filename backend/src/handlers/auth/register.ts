import { z } from 'zod';
import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';
import { generateToken } from '../../utils/helpers';
import { hashPassword } from '../../utils/password';
import { getUserByEmail } from '../../db/users/queries';
import { createUserByEmailPassword } from '../../db/users/mutations';
import { createSession } from '../../db/sessions/mutations';
import { publicUser } from './serialize';

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
  fullName: z.string().min(2).max(100).optional(),
});

export async function registerHandler(c: AppContext) {
  const body = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(c, parsed.error.errors[0]?.message ?? 'Invalid input');

  const email = parsed.data.email.trim().toLowerCase();
  const db = c.env.DB;

  const existing = await getUserByEmail(db, email);
  if (existing) return error(c, 'Email already registered', 400);

  const id = crypto.randomUUID().replace(/-/g, '');
  const passwordHash = await hashPassword(parsed.data.password);
  await createUserByEmailPassword(db, id, email, passwordHash, parsed.data.fullName ?? null);

  const user = await getUserByEmail(db, email);
  if (!user) return error(c, 'Failed to create user', 500);

  const token = generateToken();
  await createSession(db, user.id, token);

  return success(c, { user: publicUser(user), token, isNewUser: true }, 201);
}
