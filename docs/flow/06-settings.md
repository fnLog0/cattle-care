# Module: Settings

## Overview
User profile management and app preferences, accessible from bottom navigation "Settings" tab.

## Features

### Profile Section
- View/edit full name
- View/edit profile image
- View phone (read-only — identity is the phone number)

> No password — authentication is OTP / Google only (see `flow/01-auth.md`).

### App Preferences
- Language selection (English / Hindi)
- Notification preferences (future)
- Temperature unit (°C / °F) (future)

### Account Actions
- Logout — `POST /api/auth/logout`
- Logout from all sessions — `POST /api/auth/logout-all`
- Delete account (future)

## REST API Endpoints

### Queries
| Method | Path | Input | Output | Auth |
|--------|------|-------|--------|------|
| `GET` | `/api/auth/me` | — | `User` | ✅ Yes |

### Mutations
| Method | Path | Input (JSON Body) | Output | Auth |
|--------|------|-------------------|--------|------|
| `PUT` | `/api/auth/profile` | `{ fullName, image }` | `User` | ✅ Yes |
| `POST` | `/api/auth/logout` | — | `{ message }` | ✅ Yes |
| `POST` | `/api/auth/logout-all` | — | `{ message }` | ✅ Yes |

## Flow
```
1. User taps Settings in bottom nav
2. GET /api/auth/me → display profile info
3. Edit fields → PUT /api/auth/profile
4. Switch language → updates i18next + AsyncStorage; no API call
5. Logout → POST /api/auth/logout, clear AsyncStorage JWT, navigate to Onboarding
```

## Migration Notes
- Reuses auth module endpoints
- **Removed**: `telephone` field from profile
- **Changed**: `firstName + lastName` → `fullName`
- All data in D1 `users` table
