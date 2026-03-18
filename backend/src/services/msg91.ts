import { MSG91_SEND_OTP_URL, MSG91_VERIFY_OTP_URL, OTP_LENGTH, OTP_EXPIRY_MINUTES } from '../config';

export async function sendOtp(
  phone: string,
  authKey: string,
  templateId: string,
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  const res = await fetch(MSG91_SEND_OTP_URL, {
    method: 'POST',
    headers: {
      authkey: authKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: templateId,
      mobile: `91${phone}`,
      otp_length: OTP_LENGTH,
      otp_expiry: OTP_EXPIRY_MINUTES,
    }),
  });

  const data = await res.json<{ type: string; request_id?: string; message?: string }>();

  if (data.type === 'success') {
    return { success: true, requestId: data.request_id };
  }
  return { success: false, error: data.message ?? 'Failed to send OTP' };
}

export async function verifyOtp(
  phone: string,
  otp: string,
  authKey: string,
): Promise<{ valid: boolean; error?: string }> {
  const url = `${MSG91_VERIFY_OTP_URL}?mobile=91${phone}&otp=${otp}`;
  const res = await fetch(url, {
    headers: { authkey: authKey },
  });

  const data = await res.json<{ type: string; message?: string }>();

  if (data.type === 'success') {
    return { valid: true };
  }
  return { valid: false, error: data.message ?? 'Invalid OTP' };
}
