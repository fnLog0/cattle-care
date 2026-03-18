import { z } from 'zod';
import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';
import { generateToken } from '../../utils/helpers';
import { verifyOtp } from '../../services/msg91';
import { getUserByPhone } from '../../db/users/queries';
import { createUserByPhone } from '../../db/users/mutations';
import { createSession } from '../../db/sessions/mutations';

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  otp: z.string().length(4, 'OTP must be 4 digits'),
});

export async function verifyOtpHandler(c: AppContext) {
  const body = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(c, parsed.error.errors[0]?.message ?? 'Invalid input');

  const { phone, otp } = parsed.data;
  const db = c.env.DB;

  // Dev sandbox: accept 1234 as valid OTP
  const isDev = c.env.DEV_MODE === 'true';
  if (!isDev) {
    const result = await verifyOtp(phone, otp, c.env.MSG91_AUTH_KEY);
    if (!result.valid) return error(c, result.error ?? 'Invalid OTP', 401);
  } else if (otp !== '1234') {
    return error(c, 'Invalid OTP (dev mode: use 1234)', 401);
  }

  let user = await getUserByPhone(db, phone);
  let isNewUser = false;

  if (!user) {
    const id = crypto.randomUUID().replace(/-/g, '');
    await createUserByPhone(db, id, phone);
    user = await getUserByPhone(db, phone);
    isNewUser = true;
  }

  if (!user) return error(c, 'Failed to create user', 500);

  const token = generateToken();
  await createSession(db, user.id, token);

  return success(c, { user, token, isNewUser }, 201);
}
