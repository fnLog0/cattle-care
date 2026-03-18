import { createRemoteJWKSet, jwtVerify } from 'jose';
import { GOOGLE_JWKS_URL, GOOGLE_ISSUERS } from '../config';

// ── Token ──────────────────────────────────────────────────────────────────

export function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

// ── Google ─────────────────────────────────────────────────────────────────

const googleJWKS = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

export type GooglePayload = {
  sub: string;
  email: string;
  name: string | null;
  picture: string | null;
};

export async function verifyGoogleToken(
  idToken: string,
  clientId: string,
): Promise<GooglePayload> {
  const { payload } = await jwtVerify(idToken, googleJWKS, {
    issuer: [...GOOGLE_ISSUERS],
    audience: clientId,
  });

  return {
    sub: payload.sub as string,
    email: payload['email'] as string,
    name: (payload['name'] as string | undefined) ?? null,
    picture: (payload['picture'] as string | undefined) ?? null,
  };
}
