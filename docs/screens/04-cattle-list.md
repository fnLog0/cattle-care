# Screen: Cattle List (Home)

## Purpose
Main screen after login. Shows all cattle in a clean, scannable list. Farmer sees herd health at a glance.

## Layout

```
┌─────────────────────────────────────┐
│                                     │
│  My Herd                    🔍      │  H1 + Search icon
│  24 cattle                          │  Caption, gray
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🔍 Search cattle...        │    │  Search bar (shown on tap 🔍)
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🐄 Lakshmi        [🔴 Severe] │ │
│  │  Zebu  •  Tag: A-042       │    │  Cattle Card
│  │                             │    │
│  │  🌡️ 39.2°C    💨 55/min   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🐄 Ganga          [✅ Healthy] │ │
│  │  Murrah  •  Tag: B-017     │    │  Cattle Card
│  │                             │    │
│  │  🌡️ 36.8°C    💨 32/min   │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🐄 Sundari       [🟡 Mild]│    │
│  │  CrossBreed  •  Tag: C-003 │    │  Cattle Card
│  │                             │    │
│  │  🌡️ 37.5°C    💨 45/min   │    │
│  └─────────────────────────────┘    │
│                                     │
│                          ┌────┐     │
│                          │ +  │     │  FAB (Green, 56x56)
│                          └────┘     │
│                                     │
│ ─────────────────────────────────── │
│  🐄 Herd     📊 Reports   ⚙️ Settings│  Bottom Tab Bar
└─────────────────────────────────────┘
```

## Cattle Card Specs

```
┌─────────────────────────────────────┐
│                                     │
│  Row 1:  🐄 Name          [Badge]  │  Name: H3 (18px Bold)
│                                     │  Badge: Stress pill
│  Row 2:  Breed  •  Tag: XX-XXX     │  Caption (14px, gray)
│                                     │
│  Row 3:  🌡️ 39.2°C    💨 55/min   │  Body (16px)
│                                     │  Temp in red if > 37°C
└─────────────────────────────────────┘

- Background: White
- Border radius: 16px
- Padding: 16px
- Shadow: 0 1px 3px rgba(0,0,0,0.08)
- Gap between cards: 12px
- Tap → Cattle Detail screen
```

## Stress Badge on Card
| Level | Text | Background | Text Color |
|-------|------|-----------|------------|
| None | "Healthy" | `#DCFCE7` | `#16A34A` |
| Mild | "Mild" | `#FEF3C7` | `#D97706` |
| Moderate | "Moderate" | `#FFEDD5` | `#EA580C` |
| Severe | "Severe" | `#FEE2E2` | `#DC2626` |
| Danger | "Danger" | `#FEE2E2` | `#991B1B` |

## Empty State
```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│            🐄                       │
│                                     │
│     No cattle added yet             │  H2, Dark Gray
│                                     │
│   Tap + to add your first cattle    │  Body, Medium Gray
│                                     │
│                                     │
└─────────────────────────────────────┘
```

## Search Behavior
- Tap 🔍 icon → search bar slides down
- Search is instant (filter client-side for < 50 cattle, API for more)
- Shows "No results found" if no match
- X button to clear and close search

## Loading State
- Skeleton cards (3 gray rectangles pulsing)
- No spinner

## Pull to Refresh
- Pull down → refresh cattle list
- Shows green activity indicator

## Sort Order
- Default: Danger first → Severe → Moderate → Mild → Healthy
- Farmers see the animals needing attention first
