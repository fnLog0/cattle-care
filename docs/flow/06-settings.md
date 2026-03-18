# Module: Settings

## Overview
User profile management and app preferences, accessible from bottom navigation "Settings" tab.

## Features

### Profile Section
- View/edit full name
- View/edit profile image
- View email (read-only)
- Change password

### App Preferences
- Notification preferences (future)
- Temperature unit (°C / °F) (future)
- Language selection (future)

### Account Actions
- Logout (clear JWT, navigate to Onboarding)
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
| `PUT` | `/api/auth/password` | `{ currentPassword, newPassword }` | `{ user, token }` | ✅ Yes |

## Flow
```
1. User taps Settings in bottom nav
2. GET /api/auth/me → display profile info
3. Edit fields → PUT /api/auth/profile
4. Change password → PUT /api/auth/password
5. Logout → clear AsyncStorage JWT, navigate to Onboarding
```

## Migration Notes
- Reuses auth module endpoints
- **Removed**: `telephone` field from profile
- **Changed**: `firstName + lastName` → `fullName`
- All data in D1 `users` table
