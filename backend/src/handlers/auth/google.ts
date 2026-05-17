import { z } from 'zod';
import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';
import { verifyGoogleToken, generateToken } from '../../utils/helpers';
import { getUserByGoogleIdOrEmail } from '../../db/users/queries';
import { createUserByGoogle, linkGoogleToUser } from '../../db/users/mutations';
import { createSession } from '../../db/sessions/mutations';
import { getUserById } from '../../db/users/queries';
import { publicUser } from './serialize';

const schema = z.object({
  googleIdToken: z.string().min(1),
});

export async function googleAuthHandler(c: AppContext) {
  const body = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(c, 'Missing googleIdToken');

  const { googleIdToken } = parsed.data;
  const db = c.env.DB;

  let payload;
  try {
    payload = await verifyGoogleToken(googleIdToken, c.env.GOOGLE_CLIENT_ID);
  } catch {
    return error(c, 'Invalid Google token', 401);
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await getUserByGoogleIdOrEmail(db, googleId, email);
  let isNewUser = false;

  if (!user) {
    const id = crypto.randomUUID().replace(/-/g, '');
    await createUserByGoogle(db, id, googleId, email, name, picture);
    user = await getUserById(db, id);
    isNewUser = true;
  } else if (!user.google_id) {
    await linkGoogleToUser(db, user.id, googleId, email, picture);
    user = await getUserById(db, user.id);
  }

  if (!user) return error(c, 'Failed to create user', 500);

  const token = generateToken();
  await createSession(db, user.id, token);

  return success(c, { user: publicUser(user), token, isNewUser }, 201);
}
