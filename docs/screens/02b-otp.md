# Screen: OTP Verification

## Purpose
Enter the 4-digit code sent to the user's phone. Confirms the user's identity and either logs them in (existing) or kicks off onboarding (new).

## Route
`app/otp.tsx` — entered with query param `?phone={10-digit}`.

## Layout

```
┌─────────────────────────────────────┐
│  ←                                  │  Back arrow → Login
│                                     │
│         ┌──────────┐                │
│         │   💬     │                │  Icon circle, primary light bg
│         └──────────┘                │
│                                     │
│         Enter OTP                   │  H1, centered
│   Sent to +91 98765 43210           │  Body, centered, phone bold
│                                     │
│   ┌──┐  ┌──┐  ┌──┐  ┌──┐           │
│   │ 1│  │ 2│  │ 3│  │ 4│           │  4 boxes, 64x72, primary border
│   └──┘  └──┘  └──┘  └──┘           │  when filled
│                                     │
│  ┌─────────────────────────────┐    │
│  │          Verify             │    │  Primary green button
│  └─────────────────────────────┘    │
│                                     │
│   Didn't get OTP? Resend in 30s     │  Countdown → tappable "Resend"
│                                     │
└─────────────────────────────────────┘
```

## Specs
- 4 separate `TextInput`s, `maxLength=1`, numeric keypad, auto-focus first box
- Typing advances focus; **Backspace on empty box** moves focus back and clears the previous digit
- **Auto-verify** when all 4 digits are entered (no need to tap Verify)
- **Resend cooldown**: 30 seconds. Countdown text shows seconds remaining; switches to a tappable "Resend" link at 0.

## Behaviour
| Action | Effect |
|--------|--------|
| All 4 digits entered | Auto-call `POST /api/auth/verify-otp` |
| Tap Verify | Same as above |
| Verify success — `isNewUser=true` | `router.replace('/onboard-name')` |
| Verify success — `isNewUser=false` | `router.replace('/(tabs)')` |
| Verify failure | Alert "Invalid OTP", clear boxes, refocus box 1 |
| Tap Resend | `POST /api/auth/send-otp` → reset countdown, clear boxes |

## Loading
- **Verifying**: spinner inside Verify button
- **Resending**: spinner replaces "Resend" link

## Dev Mode
With backend `DEV_MODE=true`, only OTP `1234` is accepted.
