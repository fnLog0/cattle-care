# Module: Authentication

## Overview
Handles user registration, login, and session management via Cloudflare Workers + D1.

## Auth Methods
1. **Email + Password** — traditional sign-up/login
2. **Google OAuth** — one-tap Gmail sign-in/sign-up

## D1 Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  full_name TEXT,
  profile_image TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'notActive', 'banned')),
  email_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
```

## REST API Endpoints

### Queries
| Method | Path | Input | Output | Auth |
|--------|------|-------|--------|------|
| `GET` | `/api/auth/me` | — | `User` | ✅ Yes |

### Mutations
| Method | Path | Input (JSON Body) | Output | Auth |
|--------|------|-------------------|--------|------|
| `POST` | `/api/auth/register` | `{ email, password, fullName }` | `{ user, token }` | ❌ No |
| `POST` | `/api/auth/login` | `{ email, password }` | `{ user, token }` | ❌ No |
| `POST` | `/api/auth/google` | `{ googleIdToken }` | `{ user, token }` | ❌ No |
| `PUT` | `/api/auth/password` | `{ currentPassword, newPassword }` | `{ user, token }` | ✅ Yes |
| `PUT` | `/api/auth/profile` | `{ fullName, image }` | `User` | ✅ Yes |

## Flows

### Registration Flow
```
1. User enters Full Name, Email, Password, Confirm Password
2. Worker validates: email not taken, passwords match, min length
3. Hash password (bcrypt or use Web Crypto API with PBKDF2)
4. INSERT into users table
5. Generate JWT token (using jose library)
6. Return { user, token }
7. Navigate → Cattle List
```

### Login Flow
```
1. User enters Email, Password
2. SELECT user by email from D1
3. Verify password hash
4. If valid → generate JWT, return { user, token }
5. If invalid → 401 "Invalid username or password"
6. Navigate → Cattle List
```

### Google OAuth Flow
```
1. User taps "Sign in with Google"
2. Google SDK returns idToken
3. Worker verifies idToken with Google's public keys
4. SELECT or INSERT user by google_id/email in D1
5. Generate JWT token
6. Return { user, token }
7. Navigate → Cattle List
```

## JWT Token
- **Library**: `jose` (works in Workers runtime)
- **Payload**: `{ sub: userId, email }`
- **Secret**: stored in Workers Secrets (`JWT_SECRET`)
- **Header**: `Authorization: Bearer <token>`
- **Expiry**: 30 days

## Password Hashing
- Use Web Crypto API (`PBKDF2`) since bcrypt is not natively available in Workers
- Alternative: use `bcryptjs` (pure JS, works in Workers)

## Migration Notes (from old backend)
- **MongoDB → D1**: Document model → relational SQL tables
- **Apollo/GraphQL → Hono REST**: All endpoints are now REST
- **Mongoose → D1 prepared statements**: Raw SQL with bindings
- **Removed**: `telephone`, `telephoneOtp`, `sendTelephoneOtp`, `telephoneLogin`
- **Added**: `google_id`, Google OAuth endpoint
- **Changed**: `firstName + lastName` → `full_name`
- **Changed**: JWT library from `jsonwebtoken` → `jose` (Workers compatible)
