import { z } from 'zod';
import type { AppContext } from '../../types';
import { success, error } from '../../utils/responses';
import { sendOtp } from '../../services/msg91';

const schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
});

export async function sendOtpHandler(c: AppContext) {
  const body = await c.req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error(c, parsed.error.errors[0]?.message ?? 'Invalid input');

  const { phone } = parsed.data;

  // Dev sandbox: skip MSG91 entirely and echo the dev OTP so the app can
  // auto-fill it on the OTP screen. NEVER returned in production
  // (DEV_MODE must not be 'true' there).
  if (c.env.DEV_MODE === 'true') {
    return success(c, { requestId: 'dev-request-id', otp: '1234' });
  }

  const result = await sendOtp(phone, c.env.MSG91_AUTH_KEY, c.env.MSG91_TEMPLATE_ID);

  if (!result.success) return error(c, result.error ?? 'Failed to send OTP', 500);

  return success(c, { requestId: result.requestId });
}
