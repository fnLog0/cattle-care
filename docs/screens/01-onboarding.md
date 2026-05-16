# Screen: Onboarding

## Purpose
First screen on app launch. Simple branding + two clear actions.

## Layout

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│                                     │
│            🐄                       │
│                                     │
│         CattleCare AI               │  H1, Dark Green
│                                     │
│    Smart health monitoring          │  Body, Medium Gray
│       for your herd                 │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        Sign In              │    │  Primary Button (Green)
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Create Account          │    │  Secondary Button (Outlined)
│  └─────────────────────────────┘    │
│                                     │
│            16px padding             │
└─────────────────────────────────────┘
```

## Specs
- **Background**: White
- **Logo**: Centered, large (80x80px icon)
- **App Name**: H1, centered, Dark Green `#166534`
- **Tagline**: Body, centered, Medium Gray `#78716C`
- **Buttons**: Full width with 16px horizontal padding
  - Sign In → navigates to Login screen (phone OTP / Google)
  - Create Account → also navigates to Login screen (registration is automatic on first OTP verification — no separate signup form)
- **Bottom padding**: 32px from bottom safe area

## States
- **First launch**: Show this screen
- **Logged out**: Show this screen
- **Has valid JWT**: Skip → go to Cattle List

## Notes
- No animations needed, keep it instant
- Logo should be a simple cow/cattle icon (not a photo)
