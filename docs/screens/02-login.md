# Screen: Login

## Purpose
Sign in with **phone + OTP** (primary) or **Google** (one-tap). No email/password — see `flow/01-auth.md` for the rationale.

## Layout

```
┌─────────────────────────────────────┐
│  ←                                  │  Back arrow → Onboarding
│                                     │
│  Welcome back 👋                    │  H1, Dark Green
│  Sign in to your account            │  Body, Medium Gray
│                                     │
│  Mobile number                      │  Label
│  ┌───────┬─────────────────────┐    │
│  │ 🇮🇳+91 │ 98765 43210         │    │  Country prefix + 10-digit input
│  └───────┴─────────────────────┘    │  Numeric keypad auto-opens
│                                     │
│  ┌─────────────────────────────┐    │
│  │          Send OTP           │    │  Primary green button
│  └─────────────────────────────┘    │  Disabled until 10 digits entered
│                                     │
│  ──────── or ────────               │  Divider
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔵 Continue with Google    │    │  expo-auth-session/google
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

## Specs
- **Phone input**: 10 digits only, `keyboardType="number-pad"`, validated against `/^[6-9]\d{9}$/`
- **Country code**: Fixed `+91` (India). No picker yet.
- **Send OTP button**: 52px height, green, disabled until valid number
- **Google button**: white bg, 1px gray border, full width
- **No "Sign up" link**: registration is automatic on first OTP verification

## Behaviour
| Action | Effect |
|--------|--------|
| Send OTP | `POST /api/auth/send-otp` → on success navigate to `/otp?phone={phone}` |
| Continue with Google | Google SDK returns idToken → `POST /api/auth/google` → if `isNewUser` navigate to `/onboard-name`, else `/(tabs)` |

## Validation
- Phone must start with 6, 7, 8, or 9 and have exactly 10 digits
- Inline red text below field on invalid format

## Loading / Error States
- **Send OTP loading**: spinner inside button, button disabled
- **API error**: alert with the server message (or "Failed to send OTP")
- **Network error**: alert "Something went wrong, please try again"

## Dev Mode
When backend `DEV_MODE=true`, `send-otp` returns `{ requestId: 'dev-request-id' }` without calling MSG91. The OTP screen accepts `1234` as a valid code.
