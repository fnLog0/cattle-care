# Screen: Cattle Detail

## Purpose
Detailed view of a single cattle with two tabs: Vitals (health data) and AI Agent (chat). Farmer can quickly see health status and get advice.

## Header

```
┌─────────────────────────────────────┐
│  ←  Lakshmi              🗑️        │  Back + name + delete icon
│      Zebu  •  Tag: A-042           │  Caption, gray
│      Age: 3 yrs  •  450 kg        │  Caption, gray
└─────────────────────────────────────┘
```

## Tab Bar

```
┌──────────────────┬──────────────────┐
│   📊 Vitals      │   💬 AI Agent    │  Two tabs
└──────────────────┴──────────────────┘
  Active tab: green underline + green text
  Inactive tab: gray text
```

---

## Tab 1: Vitals

```
┌─────────────────────────────────────┐
│  ←  Lakshmi              🗑️        │
│      Zebu  •  Tag: A-042           │
│      Age: 3 yrs  •  450 kg        │
│                                     │
│  ┌──────────────┬──────────────┐    │
│  │  📊 Vitals   │  💬 AI Agent │    │
│  └──────────────┴──────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      Stress Level           │    │
│  │                             │    │
│  │     ┌─────────────┐        │    │
│  │     │             │        │    │  Large circular gauge
│  │     │   🟠 3.8    │        │    │  Color = stress level
│  │     │  Moderate   │        │    │  Number + label
│  │     │             │        │    │
│  │     └─────────────┘        │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🌡️ Temperature             │    │
│  │  39.2°C                     │    │  Value in orange (warning)
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░  73%    │    │  Progress bar
│  │  Normal: ≤ 37°C             │    │  Hint text, gray
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  💨 Respiratory Rate        │    │
│  │  55 breaths/min             │    │  Value in orange
│  │  ▓▓▓▓▓▓▓▓▓▓▓░░░░░  69%    │    │  Progress bar
│  │  Normal: ≤ 40/min           │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  💧 Humidity                │    │
│  │  72%                        │    │  Value in amber
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░  85%    │    │  Progress bar
│  │  Normal: ≤ 70%              │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  ❤️ Heart Rate              │    │
│  │  88 bpm                     │    │  Value in amber
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░  88%    │    │  Progress bar
│  │  Normal: ≤ 80 bpm           │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  💬 Ask AI about Lakshmi   │    │  CTA button → AI Agent tab
│  └─────────────────────────────┘    │
│                                     │
│  Last updated: 10 min ago          │  Caption, gray
│                                     │
└─────────────────────────────────────┘
```

### Stress Gauge Specs
```
- Circular gauge (like a speedometer)
- Size: 160x160px
- Center: score number (large, 32px bold)
- Below: stress level text (18px)
- Ring color matches stress level
- Ring fills proportionally (score/8 * 360°)
```

### Vital Card Specs
```
- White card, 16px radius, 16px padding
- Row 1: Icon + Label (Caption, gray)
- Row 2: Value (H2, 22px bold, color-coded)
- Row 3: Progress bar (8px height, rounded)
  - Green if normal
  - Amber if warning
  - Red if critical
- Row 4: "Normal: ≤ X" hint (12px, gray)
- Gap between cards: 12px
```

### Progress Bar Colors
| Range | Bar Color | Background |
|-------|----------|------------|
| Normal | `#22C55E` | `#DCFCE7` |
| Warning | `#F59E0B` | `#FEF3C7` |
| Critical | `#EF4444` | `#FEE2E2` |

---

## Tab 2: AI Agent Chat

```
┌─────────────────────────────────────┐
│  ←  Lakshmi              🗑️        │
│      Zebu  •  Tag: A-042           │
│                                     │
│  ┌──────────────┬──────────────┐    │
│  │  📊 Vitals   │  💬 AI Agent │    │
│  └──────────────┴──────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🤖 Hi! I'm monitoring      │    │
│  │ Lakshmi's health. Her       │    │  Initial agent message
│  │ current stress level is     │    │  with vitals summary
│  │ Moderate (3.8/8).           │    │
│  │                             │    │
│  │ How can I help?             │    │
│  └─────────────────────────────┘    │
│                                     │
│                                     │
│                                     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Quick prompts:              │    │
│  │                             │    │
│  │ ┌──────────────────────┐    │    │
│  │ │ Analyze stress levels│    │    │  Chip 1
│  │ └──────────────────────┘    │    │
│  │ ┌──────────────────────┐    │    │
│  │ │ Any health risks?    │    │    │  Chip 2
│  │ └──────────────────────┘    │    │
│  │ ┌──────────────────────┐    │    │
│  │ │ Recommend treatment  │    │    │  Chip 3
│  │ └──────────────────────┘    │    │
│  └─────────────────────────────┘    │
│                                     │
│ ─────────────────────────────────── │
│ ┌─────────────────────────┐ ┌───┐  │
│ │ Ask about Lakshmi...    │ │ ➤ │  │  Input bar
│ └─────────────────────────┘ └───┘  │
└─────────────────────────────────────┘
```

### Quick Prompt Chips
```
- Displayed above input when conversation is empty/short
- Outlined green pills (same as create cattle screen)
- Tapping sends chip text as user message
- Chips hide once conversation has 3+ messages
```

### Chat Behavior
- Same message bubble styles as Create Cattle chat
- Agent messages reference specific vitals data
- Streaming response (text appears word by word)
- Scroll to bottom on new messages

## Delete Confirmation
```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │  Bottom sheet modal
│  │   Delete Lakshmi?           │    │  H2
│  │                             │    │
│  │   This will remove all      │    │  Body, gray
│  │   vitals and chat history.  │    │
│  │                             │    │
│  │  ┌───────────────────────┐  │    │
│  │  │    Yes, Delete        │  │    │  Red button
│  │  └───────────────────────┘  │    │
│  │  ┌───────────────────────┐  │    │
│  │  │      Cancel           │  │    │  Secondary button
│  │  └───────────────────────┘  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```
