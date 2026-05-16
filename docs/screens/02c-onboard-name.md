# Screen: Onboarding — Name Capture

## Purpose
First-time users land here after OTP verification (or Google sign-in with no name). Collects the user's full name to personalize the experience.

## Route
`app/onboard-name.tsx` — reached via `router.replace('/onboard-name')` when `verifyOtp`/`googleLogin` returns `isNewUser: true`.

## Layout

```
┌─────────────────────────────────────┐
│                                     │
│  Welcome! 👋                        │  H1, Dark Green
│  What's your name?                  │  Body, Medium Gray
│                                     │
│  Full Name                          │  Label
│  ┌─────────────────────────────┐    │
│  │ Enter your full name        │    │  Input, 52px height
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Get Started 🐄         │    │  Primary button
│  └─────────────────────────────┘    │  Disabled until name has 2+ chars
│                                     │
└─────────────────────────────────────┘
```

## Specs
- **No back button** — user must complete onboarding
- **KeyboardAvoidingView** so the input lifts above the keyboard
- Inline red validation text under the field

## Behaviour
| Action | Effect |
|--------|--------|
| Tap Get Started | `PUT /api/auth/profile` with `{ fullName }` → updates auth context → `router.replace('/(tabs)')` |

## Validation
- Minimum 2 characters
- Trimmed before send
