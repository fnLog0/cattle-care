import { z } from 'zod';
import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';
import { generateToken } from '../../utils/helpers';
import { verifyPassword } from '../../utils/password';
import { getUserByEmail } from '../../db/users/queries';
import { createSession } from '../../db/sessions/mutations';
import { publicUser } from './serialize';

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

export async function loginHandler(c: AppContext) {
  const body = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(c, parsed.error.errors[0]?.message ?? 'Invalid input');

  const email = parsed.data.email.trim().toLowerCase();
  const db = c.env.DB;

  const user = await getUserByEmail(db, email);
  if (!user || !user.password_hash) {
    return error(c, 'Invalid email or password', 401);
  }
  if (user.status === 'banned') {
    return error(c, 'Account is banned', 403);
  }

  const ok = await verifyPassword(parsed.data.password, user.password_hash);
  if (!ok) return error(c, 'Invalid email or password', 401);

  const token = generateToken();
  await createSession(db, user.id, token);

  return success(c, { user: publicUser(user), token, isNewUser: false });
}
