# Screen: Login

## Purpose
Sign in with email/password or Google. Clean, minimal form.

## Layout

```
┌─────────────────────────────────────┐
│  ←                                  │  Back arrow (top-left)
│                                     │
│  Welcome back 👋                    │  H1, Dark Green
│  Sign in to your account            │  Body, Medium Gray
│                                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔵 Continue with Google    │    │  Google button (white bg,
│  └─────────────────────────────┘    │  border, Google icon)
│                                     │
│  ──────── or ────────               │  Divider with "or"
│                                     │
│  Email                              │  Label
│  ┌─────────────────────────────┐    │
│  │ you@email.com               │    │  Input field
│  └─────────────────────────────┘    │
│                                     │
│  Password                           │  Label
│  ┌─────────────────────────────┐    │
│  │ ••••••••            👁      │    │  Input + toggle visibility
│  └─────────────────────────────┘    │
│                                     │
│              Forgot password?       │  Right-aligned link, Green
│                                     │
│  ┌─────────────────────────────┐    │
│  │          Sign In            │    │  Primary Button
│  └─────────────────────────────┘    │
│                                     │
│   Don't have an account? Sign up    │  Centered, "Sign up" in Green
│                                     │
└─────────────────────────────────────┘
```

## Specs
- **Back arrow**: Top-left, goes to Onboarding
- **Title**: Left-aligned, H1
- **Google Button**: Full width, white bg, 1px gray border, Google "G" icon
- **Divider**: Horizontal line with "or" text centered
- **Input fields**: 52px height, 16px font, 12px radius
- **Password field**: Eye icon to toggle show/hide
- **Forgot password**: Right-aligned, Green text (UI only for now)
- **Sign In button**: Full width, Green, disabled until both fields filled
- **Bottom link**: "Sign up" text is tappable → Register screen

## Validation
- Email: basic format check (show inline error below field)
- Password: minimum 4 characters
- Error: red text below field, `14px`

## Loading State
```
┌─────────────────────────────────┐
│     Signing in...   ⟳          │  Button shows spinner
└─────────────────────────────────┘
```

## Error State
- API error → show toast/banner at top: "Invalid email or password"
- Red bg `#FEF2F2`, red text `#EF4444`, dismiss after 4s
