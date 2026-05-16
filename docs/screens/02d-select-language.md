# Screen: Select Language

## Purpose
Very first screen on cold launch (before Onboarding) — lets the user pick their preferred app language. Saved to AsyncStorage and applied via i18next.

## Route
`app/select-language.tsx` — root of the unauthenticated flow.

## Layout

```
┌─────────────────────────────────────┐
│                                     │
│          ┌────────┐                 │
│          │   🌿   │                 │  Leaf logo, primary bg
│          └────────┘                 │
│                                     │
│        CattleCare AI                │  H1, white-on-green hero
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Choose your language               │  H2
│                                     │
│  ┌─────────────────────────────┐    │
│  │  English             ●      │    │  Radio row, selected
│  ├─────────────────────────────┤    │
│  │  हिन्दी (Hindi)              │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │          Continue           │    │  Primary green button
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

## Behaviour
| Action | Effect |
|--------|--------|
| Tap a row | Select that language (visual only) |
| Tap Continue | `changeLanguage(selected)` (writes to AsyncStorage + reconfigures i18next) → `router.replace('/onboarding')` |

## Available Languages
Defined in `app/i18n/index.ts` as `LANGUAGES`. Currently:
- `en` — English
- `hi` — हिन्दी (Hindi)

## Notes
- Default selection: `en`
- Language can be changed later from **Settings → Language** (see `screens/08-settings.md`)
- This screen is **not** shown again after first launch; the stored preference is loaded by `i18n/index.ts` on app boot
