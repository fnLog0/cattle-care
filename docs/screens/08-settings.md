# Screen: Settings

## Purpose
Simple profile management and app settings. Clean and minimal.

## Layout

```
┌─────────────────────────────────────┐
│                                     │
│  Settings                           │  H1
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │     ┌─────┐                 │    │
│  │     │ 👤  │                 │    │  Profile avatar (64x64)
│  │     └─────┘                 │    │  Tap to change photo
│  │                             │    │
│  │   Nasim Akhtar              │    │  H2, centered
│  │   nasim@email.com           │    │  Caption, gray, centered
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Account                            │  Section header, gray
│  ┌─────────────────────────────┐    │
│  │  👤  Edit Profile         ▸ │    │  Menu row
│  ├─────────────────────────────┤    │
│  │  🌐  Language / भाषा     ▸ │    │  Menu row → language picker
│  └─────────────────────────────┘    │
│                                     │
│  Support                            │  Section header, gray
│  ┌─────────────────────────────┐    │
│  │  ❓  Help & FAQ           ▸ │    │  Menu row (future)
│  ├─────────────────────────────┤    │
│  │  📧  Contact Us           ▸ │    │  Menu row (future)
│  └─────────────────────────────┘    │
│                                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        Log Out              │    │  Red text button
│  └─────────────────────────────┘    │
│                                     │
│  Version 1.0.0                      │  Small, centered, gray
│                                     │
│ ─────────────────────────────────── │
│  🐄 Herd     📊 Reports   ⚙️ Settings│
└─────────────────────────────────────┘
```

## Menu Row Specs
```
┌─────────────────────────────────────┐
│  🌐  Language / भाषा            ▸  │
└─────────────────────────────────────┘
- Height: 52px
- Icon: 24px, left
- Label: 16px, body text
- Chevron ▸: right, gray
- Separator: 1px line between rows
- Background: white
- Tap → opens respective screen/modal
```

## Edit Profile (Bottom Sheet)
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │  Edit Profile               │    │  H2
│  │                             │    │
│  │  Full Name                  │    │
│  │  ┌───────────────────────┐  │    │
│  │  │ Nasim Akhtar          │  │    │
│  │  └───────────────────────┘  │    │
│  │                             │    │
│  │  ┌───────────────────────┐  │    │
│  │  │     Save Changes      │  │    │  Primary button
│  │  └───────────────────────┘  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Logout Confirmation
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │  Log out?                   │    │  Alert dialog
│  │                             │    │
│  │  ┌──────────┐ ┌──────────┐  │    │
│  │  │  Cancel  │ │  Log Out │  │    │  Cancel (gray), Logout (red)
│  │  └──────────┘ └──────────┘  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

- Log Out → clear AsyncStorage → navigate to Onboarding

## Language Picker (Bottom Sheet)
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │  Select Language / भाषा चुनें│    │  H2
│  │                             │    │
│  │  ┌───────────────────────┐  │    │
│  │  │  English          ✅  │  │    │  Green check = selected
│  │  ├───────────────────────┤  │    │
│  │  │  हिन्दी (Hindi)      │  │    │
│  │  └───────────────────────┘  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```
- Tap a language → save to AsyncStorage → app reloads in selected language
- Both label shown (English name + native name) for clarity
