# Module: Navigation

## Overview
File-based navigation using **expo-router v6** (Expo SDK 54) with **@react-navigation/bottom-tabs**.

## Expo Router File Structure

```
app/
├── _layout.tsx              ← Root layout (auth guard)
├── onboarding.tsx           ← Onboarding screen
├── login.tsx                ← Login screen
├── register.tsx             ← Register screen
├── (tabs)/
│   ├── _layout.tsx          ← Bottom tab navigator
│   ├── index.tsx            ← 🐄 Cattle List (Herd tab)
│   ├── reports.tsx          ← 📊 Reports tab
│   └── settings.tsx         ← ⚙️ Settings tab
├── cattle/
│   ├── create.tsx           ← AI Registration Agent chat
│   └── [id]/
│       ├── _layout.tsx      ← Cattle detail (top tabs)
│       ├── vitals.tsx       ← Vitals tab
│       └── agent.tsx        ← AI Health Agent tab
└── modal.tsx                ← Reusable modal
```

## Navigation Tree

```
Root Stack (app/_layout.tsx)
├── Onboarding Screen
├── Login Screen
├── Register Screen
└── (tabs) — Bottom Tab Navigator
    ├── 🐄 Herd Tab (index.tsx)
    │   → cattle/create.tsx (AI Registration Agent)
    │   → cattle/[id]/vitals.tsx (Cattle Detail - Vitals)
    │   → cattle/[id]/agent.tsx (Cattle Detail - AI Agent)
    ├── 📊 Reports Tab (reports.tsx)
    └── ⚙️ Settings Tab (settings.tsx)
```

## Navigation Flow

```
App Launch
│
├── Has JWT in AsyncStorage?
│   ├── YES → GET /api/auth/me to validate
│   │         ├── 200 OK → Main Navigator (Cattle List)
│   │         └── 401 → Clear token → Onboarding
│   └── NO → Onboarding
│
Onboarding
├── "Sign In" → Login Screen
│   └── Success → Main Navigator
└── "Create Account" → Register Screen
    └── Success → Main Navigator

Main Navigator (Bottom Tabs)
├── Herd Tab
│   ├── Cattle List
│   │   ├── + FAB → Create Cattle Chat
│   │   │            └── Confirm → Back to Cattle List
│   │   └── Tap Card → Cattle Detail
│   │                   ├── Vitals Tab (default)
│   │                   └── AI Agent Tab
│   └── ← Back → Cattle List
├── Reports Tab
│   └── Reports Dashboard
└── Settings Tab
    └── Settings Screen
        └── Logout → Onboarding
```

## Bottom Tab Bar

```
┌─────────────────────────────────────┐
│   🐄 Herd    │  📊 Reports  │  ⚙️   │
│              │              │ Settings│
└─────────────────────────────────────┘
```

## API Base URL
```
Production: https://cattle-care-api.<your-subdomain>.workers.dev
```

## Auth Guard
- All Main Navigator screens require valid JWT
- JWT stored in AsyncStorage, sent as `Authorization: Bearer <token>`
- If API returns 401 → clear token, redirect to Onboarding
- Onboarding/Login/Register screens are NOT accessible when logged in

## Deep Linking (Future)
- `cattlecare://cattle/:id` → Cattle Detail
- `cattlecare://cattle/:id/chat` → Health Agent Chat
