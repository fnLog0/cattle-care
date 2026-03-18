export const SESSION_EXPIRES_DAYS = 30;

export const OTP_LENGTH = 4;
export const OTP_EXPIRY_MINUTES = 5;

export const MSG91_SEND_OTP_URL = 'https://control.msg91.com/api/v5/otp';
export const MSG91_VERIFY_OTP_URL = 'https://control.msg91.com/api/v5/otp/verify';

export const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
export const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'] as const;
