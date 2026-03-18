# Design System — CattleCare AI

## Design Philosophy
> **Simple. Clear. Farmer-first.**
> Large touch targets, readable fonts, minimal clutter. Works in bright sunlight on dusty screens.

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| **Green (Primary)** | `#16A34A` | Buttons, healthy status, success |
| **Dark Green** | `#166534` | Headers, primary text |
| **White** | `#FFFFFF` | Backgrounds, cards |
| **Light Gray** | `#F5F5F4` | Screen backgrounds |
| **Dark Gray** | `#292524` | Body text |
| **Medium Gray** | `#78716C` | Secondary text, labels |

### Stress Colors
| Level | Color | Hex |
|-------|-------|-----|
| ✅ No Stress | Green | `#22C55E` |
| 🟡 Mild | Amber | `#F59E0B` |
| 🟠 Moderate | Orange | `#F97316` |
| 🔴 Severe | Red | `#EF4444` |
| ⛔ Danger | Dark Red | `#991B1B` |

## Typography

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| **H1** | 28px | Bold | Screen titles |
| **H2** | 22px | SemiBold | Section headers |
| **H3** | 18px | SemiBold | Card titles |
| **Body** | 16px | Regular | General text |
| **Caption** | 14px | Regular | Labels, hints |
| **Small** | 12px | Medium | Badges, tags |

> All text minimum **16px** for readability. No tiny text.

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Inline spacing |
| `sm` | 8px | Between small elements |
| `md` | 16px | Card padding, gaps |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Screen padding top/bottom |

## Components

### Buttons
```
┌─────────────────────────────────┐
│         Primary Button          │  Green bg, white text
│         Height: 52px            │  Border radius: 12px
│         Font: 16px Bold         │  Full width
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        Secondary Button         │  White bg, green border
│         Height: 52px            │  Green text
└─────────────────────────────────┘
```

### Input Fields
```
┌─────────────────────────────────┐
│ Label                           │  Caption, gray
│ ┌─────────────────────────────┐ │
│ │ Placeholder text...         │ │  Height: 52px
│ └─────────────────────────────┘ │  Border: 1px #D6D3D1
│                                 │  Radius: 12px
│                                 │  Font: 16px
└─────────────────────────────────┘
```

### Cards
```
┌─────────────────────────────────┐
│                                 │  White bg
│  Content                        │  Radius: 16px
│                                 │  Shadow: subtle
│                                 │  Padding: 16px
└─────────────────────────────────┘
```

### Stress Badge
```
  ┌──────────┐
  │ 🟡 Mild  │   Rounded pill, colored bg (10% opacity) + colored text
  └──────────┘   Height: 28px, Padding: 4px 12px
```

## Icons
- Use **Lucide Icons** (simple, clean line icons)
- Size: 24px default, 20px for small contexts
- Color: matches text color

## Touch Targets
- **Minimum 48x48px** for all tappable elements
- Cards are fully tappable
- Generous padding on buttons

## Accessibility
- High contrast ratios (4.5:1 minimum)
- Large fonts (16px minimum body)
- No color-only indicators (always text + color)
- Works in bright outdoor sunlight
