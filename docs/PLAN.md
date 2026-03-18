# CattleCare AI — Implementation Plan (Mock-First)

## Goal
Build the complete app UI with **mock data and fake services** so every screen is functional and navigable. All mock logic lives in a single `services/` layer — when real APIs are ready, swap the imports, zero UI changes needed.

---

## Architecture: The Swap Pattern

```
UI Components → hooks/ → services/ (mock) → later: services/ (real API)
                              │
                         mock-data.ts (static JSON)
```

### Key Rule
> **No screen or component ever calls mock data directly.**
> Everything goes through `services/*.ts` which export async functions.
> To swap to real API later: only change files inside `services/`.

### Folder Structure (new/modified files)

```
app/
├── services/                    ← THE SWAP LAYER
│   ├── api-client.ts            ← Axios/fetch wrapper (returns mock now, API later)
│   ├── auth.ts                  ← login(), register(), googleAuth(), getMe()
│   ├── cattle.ts                ← getAllCattle(), getCattle(), addCattle(), etc.
│   ├── vitals.ts                ← addVitals(), getVitalsHistory()
│   ├── reports.ts               ← getHerdSummary(), getAtRiskCattle()
│   └── agent.ts                 ← chatRegistration(), chatHealth()
│
├── mock/                        ← MOCK DATA + FAKE LOGIC (delete later)
│   ├── data.ts                  ← All mock cattle, users, vitals
│   ├── auth.mock.ts             ← Fake auth with delay
│   ├── cattle.mock.ts           ← Fake CRUD with delay
│   ├── vitals.mock.ts           ← Fake vitals + stress calc
│   ├── reports.mock.ts          ← Fake aggregation
│   └── agent.mock.ts            ← Fake AI responses
│
├── context/
│   └── auth-context.tsx         ← Auth state (user, token, login/logout)
│
├── hooks/
│   ├── use-auth.ts              ← useAuth() hook from context
│   ├── use-cattle.ts            ← useCattle(), useCattleDetail()
│   ├── use-vitals.ts            ← useVitals()
│   ├── use-reports.ts           ← useReports()
│   └── use-agent.ts             ← useAgent() for chat
│
├── types/
│   └── index.ts                 ← User, Cattle, Vitals, Message, etc.
│
├── constants/
│   ├── theme.ts                 ← UPDATE: CattleCare colors + typography
│   └── stress.ts                ← Stress levels, colors, thresholds
│
├── i18n/
│   ├── index.ts                 ← i18next setup
│   ├── en.json                  ← English translations
│   └── hi.json                  ← Hindi translations
│
├── components/
│   ├── cattle-card.tsx          ← Cattle list card
│   ├── stress-badge.tsx         ← Color-coded stress pill
│   ├── stress-gauge.tsx         ← Circular gauge for detail screen
│   ├── vital-card.tsx           ← Single vital with progress bar
│   ├── chat-bubble.tsx          ← Agent/user message bubble
│   ├── chat-input.tsx           ← Message input bar
│   ├── quick-chips.tsx          ← Quick prompt pills
│   ├── summary-card.tsx         ← Registration confirmation card
│   ├── menu-row.tsx             ← Settings menu item
│   └── empty-state.tsx          ← Reusable empty state
│
├── app/
│   ├── _layout.tsx              ← UPDATE: Add AuthProvider + auth guard
│   ├── onboarding.tsx           ← NEW
│   ├── login.tsx                ← NEW
│   ├── register.tsx             ← NEW
│   ├── (tabs)/
│   │   ├── _layout.tsx          ← UPDATE: Herd, Reports, Settings tabs
│   │   ├── index.tsx            ← UPDATE: Cattle List
│   │   ├── reports.tsx          ← NEW (replace explore.tsx)
│   │   └── settings.tsx         ← NEW
│   └── cattle/
│       ├── create.tsx           ← NEW: AI Registration chat
│       └── [id]/
│           ├── _layout.tsx      ← NEW: Top tab layout
│           ├── vitals.tsx       ← NEW: Vitals tab
│           └── agent.tsx        ← NEW: AI Health Agent tab
```

---

## Implementation Phases

### Phase 1: Foundation
> Types, theme, mock data, services layer, auth context

**Step 1.1 — Types**
```
Create: types/index.ts
```
```typescript
export type User = {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  status: 'active' | 'notActive' | 'banned';
};

export type Breed = 'zebu' | 'crossBreed' | 'murrah';

export type StressLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'danger';

export type Vitals = {
  id: string;
  cattleId: string;
  temperature: number;
  respiratoryRate: number;
  humidity: number;
  heartRate: number;
  stressIndex: number;
  stressLevel: StressLevel;
  recordedAt: string;
};

export type Cattle = {
  id: string;
  name: string;
  breed: Breed;
  age: number;
  weight: number;
  earTag: string;
  stressLevel: StressLevel;
  latestVitals?: Vitals;
  userId: string;
  createdAt: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type HerdSummary = {
  totalCattle: number;
  stressDistribution: Record<StressLevel, number>;
};
```

**Step 1.2 — Theme**
```
Update: constants/theme.ts
Create: constants/stress.ts
```
- Replace default Expo colors with CattleCare green palette
- Add stress level colors, thresholds, labels

**Step 1.3 — Mock Data**
```
Create: mock/data.ts
```
- 8–10 mock cattle with variety of breeds and stress levels
- 1 mock user
- Vitals history (5–10 readings per cattle)
- Use realistic Indian cattle names: Lakshmi, Ganga, Sundari, Champa, Radha, Nandi, etc.

**Step 1.4 — Mock Services**
```
Create: mock/auth.mock.ts
Create: mock/cattle.mock.ts
Create: mock/vitals.mock.ts
Create: mock/reports.mock.ts
Create: mock/agent.mock.ts
```
- Each function adds `await delay(500)` to simulate network
- Cattle mock: stores in-memory array, supports add/update/delete/search
- Auth mock: accepts any email/password, returns mock user + fake JWT
- Agent mock: returns canned responses based on keywords
- Vitals mock: calculates real stress index using the formula

**Step 1.5 — Services Layer (The Swap Layer)**
```
Create: services/auth.ts
Create: services/cattle.ts
Create: services/vitals.ts
Create: services/reports.ts
Create: services/agent.ts
```
Each file pattern:
```typescript
// services/cattle.ts
// MOCK MODE — swap this import to real API client later
import * as mock from '@/mock/cattle.mock';

export const getAllCattle = mock.getAllCattle;
export const getCattle = mock.getCattle;
export const addCattle = mock.addCattle;
export const updateCattle = mock.updateCattle;
export const deleteCattle = mock.deleteCattle;
export const searchCattle = mock.searchCattle;
```
When API is ready, change to:
```typescript
// services/cattle.ts — REAL MODE
import { apiClient } from './api-client';

export const getAllCattle = () => apiClient.get('/api/cattle');
// ...
```

**Step 1.6 — Auth Context**
```
Create: context/auth-context.tsx
Create: hooks/use-auth.ts
```
- AuthProvider wraps app, stores user + token in state
- Persists token to AsyncStorage
- Exposes: `user, isLoggedIn, login(), register(), logout()`

---

### Phase 2: Auth Screens
> Onboarding, Login, Register + auth guard in root layout

**Step 2.1 — Onboarding Screen**
```
Create: app/onboarding.tsx
```
- Logo + tagline + 2 buttons (Sign In / Create Account)
- If already logged in → redirect to (tabs)

**Step 2.2 — Login Screen**
```
Create: app/login.tsx
```
- Google button (UI only in mock — shows toast "Google login coming soon")
- Email + Password fields
- Calls `services/auth.login()`
- On success → `router.replace('/(tabs)')`

**Step 2.3 — Register Screen**
```
Create: app/register.tsx
```
- Full Name, Email, Password, Confirm Password
- Client-side validation
- Calls `services/auth.register()`
- On success → `router.replace('/(tabs)')`

**Step 2.4 — Root Layout Update**
```
Update: app/_layout.tsx
```
- Wrap with `<AuthProvider>`
- Auth guard: if no token → redirect to `/onboarding`
- Add stack screens for onboarding, login, register

---

### Phase 3: Cattle List (Home)
> Main screen with cattle cards, search, FAB

**Step 3.1 — Components**
```
Create: components/stress-badge.tsx
Create: components/cattle-card.tsx
Create: components/empty-state.tsx
```

**Step 3.2 — Cattle List Screen**
```
Update: app/(tabs)/index.tsx
```
- Fetch cattle via `services/cattle.getAllCattle()`
- Render cattle cards sorted by stress (danger first)
- Search bar (toggle on 🔍 tap)
- FAB (+) → `router.push('/cattle/create')`
- Tap card → `router.push(`/cattle/${id}/vitals`)`
- Pull to refresh
- Empty state when no cattle
- Skeleton loading

**Step 3.3 — Tab Layout Update**
```
Update: app/(tabs)/_layout.tsx
```
- 3 tabs: Herd (cow icon), Reports (chart icon), Settings (gear icon)
- Remove `explore.tsx`, add `reports.tsx` + `settings.tsx`
- Green active tint color

---

### Phase 4: Create Cattle (AI Chat)
> Conversational registration with mock AI

**Step 4.1 — Components**
```
Create: components/chat-bubble.tsx
Create: components/chat-input.tsx
Create: components/quick-chips.tsx
Create: components/summary-card.tsx
```

**Step 4.2 — Create Cattle Screen**
```
Create: app/cattle/create.tsx
```
- Chat UI with message list + input bar
- Mock agent asks for name → breed (with chips) → age → weight → ear tag
- Shows summary card when complete
- Confirm → `services/cattle.addCattle()` → navigate back
- Agent mock logic: state machine tracking which fields are collected

---

### Phase 5: Cattle Detail
> Top tabs: Vitals + AI Agent

**Step 5.1 — Components**
```
Create: components/stress-gauge.tsx
Create: components/vital-card.tsx
```

**Step 5.2 — Detail Layout**
```
Create: app/cattle/[id]/_layout.tsx
```
- Header: cattle name, breed, tag, age, weight + delete icon
- Top tab bar: Vitals | AI Agent
- Uses `@react-navigation/material-top-tabs` or custom

**Step 5.3 — Vitals Tab**
```
Create: app/cattle/[id]/vitals.tsx
```
- Fetch cattle + latest vitals via `services/cattle.getCattle(id)`
- Stress gauge (circular, color-coded)
- 4 vital cards with progress bars (temp, resp, humidity, heart rate)
- "Ask AI" CTA button → switches to agent tab
- Last updated timestamp

**Step 5.4 — AI Agent Tab**
```
Create: app/cattle/[id]/agent.tsx
```
- Same chat UI as create screen
- Pre-loaded intro message with cattle vitals summary
- Quick prompt chips: "Analyze stress", "Health risks?", "Recommend treatment"
- Mock responses reference actual cattle vitals data
- Calls `services/agent.chatHealth()`

---

### Phase 6: Reports
> Herd overview dashboard

**Step 6.1 — Reports Screen**
```
Create: app/(tabs)/reports.tsx
```
- Herd overview card (total + stress distribution circles)
- "Needs Attention" section with at-risk cattle cards
- Tap card → cattle detail
- Empty state if no cattle
- Calls `services/reports.getHerdSummary()` + `getAtRiskCattle()`

---

### Phase 7: Settings
> Profile, password, language, logout

**Step 7.1 — Components**
```
Create: components/menu-row.tsx
```

**Step 7.2 — Settings Screen**
```
Create: app/(tabs)/settings.tsx
```
- Profile card (avatar, name, email)
- Menu rows: Edit Profile, Change Password, Language, Help, Contact
- Edit Profile → bottom sheet with name input
- Change Password → bottom sheet with 3 password fields
- Language → bottom sheet with English / Hindi picker
- Log Out → confirmation alert → clear auth → redirect to onboarding

---

### Phase 8: i18n
> Hindi + English support

**Step 8.1 — Setup**
```
Create: i18n/index.ts
Create: i18n/en.json
Create: i18n/hi.json
```
- Configure i18next with expo-localization
- Wrap app with I18nextProvider

**Step 8.2 — Replace all hardcoded strings**
- Every screen uses `useTranslation()` hook
- `t('cattle.myHerd')` instead of `"My Herd"`

---

## How to Swap Mock → Real API

### Step 1: Create API client
```typescript
// services/api-client.ts
const BASE_URL = 'https://cattle-care-api.workers.dev';

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await AsyncStorage.getItem('@cattlecare_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

### Step 2: Swap each service file
```typescript
// services/cattle.ts — BEFORE (mock)
import * as mock from '@/mock/cattle.mock';
export const getAllCattle = mock.getAllCattle;

// services/cattle.ts — AFTER (real)
import { apiClient } from './api-client';
export const getAllCattle = () => apiClient<Cattle[]>('/api/cattle');
```

### Step 3: Delete `mock/` folder

### What DOESN'T change
- ✅ All screens — zero changes
- ✅ All components — zero changes
- ✅ All hooks — zero changes
- ✅ All types — zero changes
- ✅ Context — zero changes

---

## Dependencies to Install

```bash
cd app

# Required
npx expo install @react-native-async-storage/async-storage
npx expo install expo-localization

# i18n
npm install i18next react-i18next

# UI helpers (optional but recommended)
npm install lucide-react-native react-native-svg
```

---

## Build Order & Checklist

```
Phase 1: Foundation
  □ types/index.ts
  □ constants/theme.ts (update colors)
  □ constants/stress.ts
  □ mock/data.ts
  □ mock/auth.mock.ts
  □ mock/cattle.mock.ts
  □ mock/vitals.mock.ts
  □ mock/reports.mock.ts
  □ mock/agent.mock.ts
  □ services/auth.ts
  □ services/cattle.ts
  □ services/vitals.ts
  □ services/reports.ts
  □ services/agent.ts
  □ context/auth-context.tsx
  □ hooks/use-auth.ts

Phase 2: Auth Screens
  □ app/_layout.tsx (update)
  □ app/onboarding.tsx
  □ app/login.tsx
  □ app/register.tsx
  □ Verify: can register → lands on tabs
  □ Verify: can login → lands on tabs
  □ Verify: logout → goes to onboarding

Phase 3: Cattle List
  □ components/stress-badge.tsx
  □ components/cattle-card.tsx
  □ components/empty-state.tsx
  □ app/(tabs)/_layout.tsx (update)
  □ app/(tabs)/index.tsx (update)
  □ Delete: app/(tabs)/explore.tsx
  □ Verify: cattle cards render with stress badges
  □ Verify: search works
  □ Verify: FAB navigates to create

Phase 4: Create Cattle Chat
  □ components/chat-bubble.tsx
  □ components/chat-input.tsx
  □ components/quick-chips.tsx
  □ components/summary-card.tsx
  □ app/cattle/create.tsx
  □ Verify: full chat flow → confirm → cattle appears in list

Phase 5: Cattle Detail
  □ components/stress-gauge.tsx
  □ components/vital-card.tsx
  □ app/cattle/[id]/_layout.tsx
  □ app/cattle/[id]/vitals.tsx
  □ app/cattle/[id]/agent.tsx
  □ Verify: vitals display correctly
  □ Verify: AI chat responds with cattle context
  □ Verify: delete cattle works

Phase 6: Reports
  □ app/(tabs)/reports.tsx
  □ Verify: herd summary shows correct counts
  □ Verify: at-risk list links to detail

Phase 7: Settings
  □ components/menu-row.tsx
  □ app/(tabs)/settings.tsx
  □ Verify: edit profile works
  □ Verify: change password works
  □ Verify: logout works

Phase 8: i18n
  □ i18n/index.ts
  □ i18n/en.json
  □ i18n/hi.json
  □ Replace all hardcoded strings
  □ Verify: switch to Hindi → all text changes
  □ Verify: switch back to English
```

---

## Notes for Agent

1. **Always use `@/` path alias** — project has it configured in tsconfig
2. **Follow existing patterns** — project uses `use-color-scheme.ts` (kebab-case files)
3. **No external UI library** — use plain React Native components + StyleSheet
4. **Expo SDK 54** — check compatibility before installing packages
5. **TypeScript strict** — all files `.tsx`/`.ts`, no `any` types
6. **Minimum font 16px** — farmer-friendly, works in sunlight
7. **Touch targets 48px+** — big buttons, generous padding
8. **Colors from design system** — Green primary `#16A34A`, Dark Green `#166534`
9. **Mock delays 300–800ms** — simulate real network feel
10. **Test each phase** — run `npx expo start` and verify on device/simulator before next phase
