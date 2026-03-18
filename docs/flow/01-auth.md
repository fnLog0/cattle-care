# Module: Authentication

## Overview
Handles user registration, login, and session management via Cloudflare Workers + D1. Two auth methods designed for farmers: **Phone OTP** (primary, via MSG91) and **Google Sign-In** (secondary).

## Auth Methods
1. **Phone + OTP** — primary login for farmers (no email/password needed)
2. **Google Sign-In** — one-tap Gmail login for tech-savvy users

## Why Phone OTP (not Email/Password)
- Farmers may not have email accounts
- Phone number is universal — every farmer has one
- No password to remember or forget
- OTP is familiar from UPI/banking apps
- Works on basic smartphones with just SMS

---

## D1 Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  phone TEXT UNIQUE NOT NULL,
  google_id TEXT UNIQUE,
  email TEXT UNIQUE COLLATE NOCASE,
  full_name TEXT,
  profile_image TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'notActive', 'banned')),
  phone_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
```

---

## REST API Endpoints

### Queries
| Method | Path | Input | Output | Auth |
|--------|------|-------|--------|------|
| `GET` | `/api/auth/me` | — | `User` | ✅ Yes |

### Mutations
| Method | Path | Input (JSON Body) | Output | Auth |
|--------|------|-------------------|--------|------|
| `POST` | `/api/auth/send-otp` | `{ phone }` | `{ success, requestId }` | ❌ No |
| `POST` | `/api/auth/verify-otp` | `{ phone, otp, requestId }` | `{ user, token, isNewUser }` | ❌ No |
| `POST` | `/api/auth/google` | `{ googleIdToken }` | `{ user, token, isNewUser }` | ❌ No |
| `PUT` | `/api/auth/profile` | `{ fullName, image }` | `User` | ✅ Yes |

---

## MSG91 Integration

### Setup
- **Service**: [MSG91](https://msg91.com) SendOTP API
- **Cost**: ~₹0.20–0.25 per OTP SMS
- **Free tier**: 5,000 SMS to start
- **DLT Registration**: Required by TRAI (MSG91 guides through this)

### Environment Variables
```toml
# wrangler.toml
[vars]
MSG91_SENDER_ID = "CATTLE"        # 6-char DLT-approved sender ID
MSG91_TEMPLATE_ID = "..."         # DLT-approved OTP template

# Workers Secrets (via wrangler secret put)
# MSG91_AUTH_KEY = "..."
# JWT_SECRET = "..."
```

### OTP Template (DLT Registered)
```
Your CattleCare verification code is {OTP}. Valid for 5 minutes. Do not share.
आपका CattleCare सत्यापन कोड {OTP} है। 5 मिनट तक वैध।
```

---

## Flows

### Phone OTP Login/Register Flow
```
┌─────────────────────────────┐
│  🐄 CattleCare AI            │
│                              │
│  Enter your mobile number    │
│                              │
│  🇮🇳 +91  [ 9876543210  ]    │  ← number pad auto-opens
│                              │
│  [ Send OTP ]                │  ← big green button
│                              │
│  ── or ──                    │
│                              │
│  [ 🔵 Continue with Google ] │
└─────────────────────────────┘

         ↓ OTP sent

┌─────────────────────────────┐
│  Enter OTP                   │
│  Sent to +91 98765 43210     │
│                              │
│  [ 1 ] [ 2 ] [ 3 ] [ 4 ]    │  ← 4-digit OTP boxes, auto-focus
│                              │
│  [ Verify ]                  │
│                              │
│  Didn't get OTP? Resend (30s)│  ← countdown timer
└─────────────────────────────┘

         ↓ OTP verified

┌─────────────────────────────┐  ← Only shown for NEW users
│  Welcome! What's your name?  │
│                              │
│  Name: [               ]     │
│                              │
│  [ Get Started 🐄 ]          │
└─────────────────────────────┘
```

### Step-by-Step
```
1. User enters phone number (+91 XXXXXXXXXX)
2. POST /api/auth/send-otp → Worker calls MSG91 SendOTP API
3. MSG91 sends 4-digit OTP via SMS
4. User enters OTP
5. POST /api/auth/verify-otp → Worker calls MSG91 VerifyOTP API
6. If valid:
   a. SELECT user by phone from D1
   b. If exists → generate JWT, return { user, token, isNewUser: false }
   c. If new → INSERT user (phone only), return { user, token, isNewUser: true }
7. If new user → show name input screen → PUT /api/auth/profile
8. Navigate → Cattle List
```

### Google Sign-In Flow
```
1. User taps "Continue with Google"
2. Google SDK returns idToken
3. POST /api/auth/google
4. Worker verifies idToken with Google's public keys
5. Extract email + name from token
6. SELECT or INSERT user by google_id/email in D1
7. Generate JWT token
8. Return { user, token, isNewUser }
9. If new user and no name → show name input
10. Navigate → Cattle List
```

---

## Worker Implementation

### Send OTP

```typescript
app.post('/api/auth/send-otp', async (c) => {
  const { phone } = await c.req.json();

  // Validate Indian phone number
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return c.json({ error: 'Invalid phone number' }, 400);
  }

  // Call MSG91 SendOTP API
  const res = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: {
      'authkey': c.env.MSG91_AUTH_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template_id: c.env.MSG91_TEMPLATE_ID,
      mobile: `91${phone}`,
      otp_length: 4,
      otp_expiry: 5  // minutes
    })
  });

  const data = await res.json();

  if (data.type === 'success') {
    return c.json({ success: true, requestId: data.request_id });
  }
  return c.json({ error: 'Failed to send OTP' }, 500);
});
```

### Verify OTP

```typescript
app.post('/api/auth/verify-otp', async (c) => {
  const { phone, otp } = await c.req.json();

  // Call MSG91 VerifyOTP API
  const res = await fetch(
    `https://control.msg91.com/api/v5/otp/verify?mobile=91${phone}&otp=${otp}`,
    { headers: { 'authkey': c.env.MSG91_AUTH_KEY } }
  );

  const data = await res.json();

  if (data.type !== 'success') {
    return c.json({ error: 'Invalid OTP' }, 401);
  }

  // Check if user exists
  let user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE phone = ?'
  ).bind(phone).first();

  let isNewUser = false;

  if (!user) {
    // Auto-register on first OTP verification
    const id = crypto.randomUUID().replace(/-/g, '');
    await c.env.DB.prepare(
      'INSERT INTO users (id, phone, phone_verified) VALUES (?, ?, 1)'
    ).bind(id, phone).run();
    user = { id, phone, phone_verified: 1, status: 'active' };
    isNewUser = true;
  }

  // Generate JWT
  const token = await generateJWT(user.id, c.env.JWT_SECRET);

  return c.json({ user, token, isNewUser });
});
```

### Google Auth

```typescript
app.post('/api/auth/google', async (c) => {
  const { googleIdToken } = await c.req.json();

  // Verify token with Google
  const payload = await verifyGoogleToken(googleIdToken);
  const { sub: googleId, email, name, picture } = payload;

  // Check if user exists by google_id or email
  let user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE google_id = ? OR email = ?'
  ).bind(googleId, email).first();

  let isNewUser = false;

  if (!user) {
    const id = crypto.randomUUID().replace(/-/g, '');
    await c.env.DB.prepare(
      `INSERT INTO users (id, google_id, email, full_name, profile_image)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(id, googleId, email, name, picture).run();
    user = { id, google_id: googleId, email, full_name: name, profile_image: picture };
    isNewUser = true;
  } else if (!user.google_id) {
    // Link Google account to existing phone user
    await c.env.DB.prepare(
      'UPDATE users SET google_id = ?, email = ?, profile_image = COALESCE(profile_image, ?) WHERE id = ?'
    ).bind(googleId, email, picture, user.id).run();
  }

  const token = await generateJWT(user.id, c.env.JWT_SECRET);
  return c.json({ user, token, isNewUser });
});
```

---

## JWT Token
- **Library**: `jose` (works in Workers runtime)
- **Payload**: `{ sub: userId, phone }`
- **Secret**: stored in Workers Secrets (`JWT_SECRET`)
- **Header**: `Authorization: Bearer <token>`
- **Expiry**: 30 days

---

## Account Linking

A user might login via phone first, then later via Google (or vice versa). The system handles this:

| Scenario | Behavior |
|----------|----------|
| Phone login → first time | Create user with phone only |
| Phone login → existing user | Return existing user |
| Google login → first time | Create user with google_id + email |
| Google login → phone user with same email | Link google_id to existing user |
| Phone user → later adds Google | Link via PUT /api/auth/profile |

---

## OTP Rate Limiting

| Rule | Limit |
|------|-------|
| OTP per phone number | Max 3 per 10 minutes |
| OTP per IP | Max 10 per 10 minutes |
| Resend cooldown | 30 seconds |
| OTP expiry | 5 minutes |

Enforced via Cloudflare KV or D1 rate limit table.

---

## Mock Implementation

For the mock-first approach (no MSG91 needed):

```typescript
// mock/auth.mock.ts
const MOCK_OTP = '1234';  // Always accept this OTP in mock mode

export async function sendOtp(phone: string) {
  await delay(500);
  return { success: true, requestId: 'mock-req-id' };
}

export async function verifyOtp(phone: string, otp: string) {
  await delay(500);
  if (otp !== MOCK_OTP) {
    throw new Error('Invalid OTP');
  }
  return {
    user: { id: '1', phone, full_name: null, status: 'active' },
    token: 'mock-jwt-token',
    isNewUser: !mockUsers.find(u => u.phone === phone)
  };
}
```

---

## Dependencies

### Mobile App
```bash
cd app
npx expo install expo-auth-session expo-web-browser  # Google Sign-In
npx expo install @react-native-async-storage/async-storage  # Token storage
```

### Worker
```bash
npm install jose  # JWT in Workers
# MSG91 uses plain fetch — no SDK needed
```

---

## Migration Notes (from old backend)
- **MongoDB → D1**: Document model → relational SQL tables
- **Apollo/GraphQL → Hono REST**: All endpoints are now REST
- **Removed**: Email/password registration and login
- **Removed**: `password_hash`, `email_verified` columns
- **Added**: `phone` as primary login identifier
- **Added**: MSG91 OTP integration (replaces old `telephoneOtp` via Twilio)
- **Kept**: Google OAuth (updated to expo-auth-session)
- **Changed**: JWT payload from `{ sub, email }` → `{ sub, phone }`
- **Changed**: JWT library from `jsonwebtoken` → `jose` (Workers compatible)
