# Screen: Register

## Purpose
Create a new account. Simple form with Google option.

## Layout

```
┌─────────────────────────────────────┐
│  ←                                  │  Back arrow
│                                     │
│  Create Account 🐄                  │  H1, Dark Green
│  Join CattleCare AI                 │  Body, Medium Gray
│                                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔵 Sign up with Google     │    │  Google button
│  └─────────────────────────────┘    │
│                                     │
│  ──────── or ────────               │  Divider
│                                     │
│  Full Name                          │
│  ┌─────────────────────────────┐    │
│  │ Your full name              │    │
│  └─────────────────────────────┘    │
│                                     │
│  Email                              │
│  ┌─────────────────────────────┐    │
│  │ you@email.com               │    │
│  └─────────────────────────────┘    │
│                                     │
│  Password                           │
│  ┌─────────────────────────────┐    │
│  │ ••••••••            👁      │    │
│  └─────────────────────────────┘    │
│                                     │
│  Confirm Password                   │
│  ┌─────────────────────────────┐    │
│  │ ••••••••            👁      │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Create Account         │    │  Primary Button
│  └─────────────────────────────┘    │
│                                     │
│   Already have an account? Sign in  │
│                                     │
└─────────────────────────────────────┘
```

## Specs
- **Scrollable**: Content may exceed screen on smaller phones
- **Fields**: Full Name, Email, Password, Confirm Password
- **All inputs**: 52px height, 16px font
- **Create Account button**: Disabled until all fields valid
- **Bottom link**: "Sign in" tappable → Login screen

## Validation Rules
| Field | Rule | Error Message |
|-------|------|--------------|
| Full Name | Required, min 2 chars | "Please enter your name" |
| Email | Valid email format | "Please enter a valid email" |
| Password | Min 4 characters | "Password must be at least 4 characters" |
| Confirm Password | Must match password | "Passwords don't match" |

## Error States
- **Field error**: Red text below the field, red border on field
- **API error** (email taken): Toast banner "Email already registered"
- **Network error**: Toast "Something went wrong, please try again"
