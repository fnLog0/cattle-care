# Screen: Create Cattle — AI Agent Chat

## Purpose
Conversational interface to add cattle. Feels like chatting, not filling a form. Simple for farmers who may not be tech-savvy.

## Layout

```
┌─────────────────────────────────────┐
│  ←  Add New Cattle                  │  Header with back arrow
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🤖 Hello! Let's add a new  │    │  Agent message bubble
│  │ member to your herd.       │    │  Light green bg #F0FDF4
│  │                             │    │
│  │ What's your cattle's name?  │    │
│  └─────────────────────────────┘    │
│                                     │
│          ┌─────────────────────┐    │
│          │ Her name is Lakshmi │    │  User message bubble
│          └─────────────────────┘    │  Green bg #16A34A
│                                     │  White text
│  ┌─────────────────────────────┐    │
│  │ 🤖 Great name! 🐄          │    │
│  │                             │    │
│  │ What breed is Lakshmi?     │    │
│  │                             │    │
│  │ ┌───────┐ ┌──────────┐     │    │
│  │ │ Zebu  │ │CrossBreed│     │    │  Quick reply chips
│  │ └───────┘ └──────────┘     │    │  (tappable, outlined)
│  │ ┌────────┐                 │    │
│  │ │ Murrah │                 │    │
│  │ └────────┘                 │    │
│  └─────────────────────────────┘    │
│                                     │
│  ... more conversation ...          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🤖 Here's the summary:     │    │  Summary card
│  │                             │    │
│  │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │    │
│  │   Name:     Lakshmi        │    │
│  │   Breed:    Zebu           │    │
│  │   Age:      3 years        │    │
│  │   Weight:   450 kg         │    │
│  │   Ear Tag:  A-042          │    │
│  │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │    │
│  │                             │    │
│  │ ┌───────────────────────┐   │    │
│  │ │   ✅ Confirm & Add    │   │    │  Green button inside card
│  │ └───────────────────────┘   │    │
│  │ ┌───────────────────────┐   │    │
│  │ │   ✏️ Edit Details     │   │    │  Secondary button
│  │ └───────────────────────┘   │    │
│  └─────────────────────────────┘    │
│                                     │
│ ─────────────────────────────────── │
│ ┌─────────────────────────┐ ┌───┐  │
│ │ Type a message...       │ │ ➤ │  │  Input bar
│ └─────────────────────────┘ └───┘  │
└─────────────────────────────────────┘
```

## Message Bubble Specs

### Agent Message
```
- Alignment: Left
- Background: #F0FDF4 (very light green)
- Text: #292524 (dark gray), 16px
- Border radius: 16px (0 top-left)
- Max width: 80% of screen
- Padding: 12px 16px
```

### User Message
```
- Alignment: Right
- Background: #16A34A (green)
- Text: #FFFFFF (white), 16px
- Border radius: 16px (0 top-right)
- Max width: 80% of screen
- Padding: 12px 16px
```

## Quick Reply Chips
```
┌─────────┐
│  Zebu   │  Outlined, 1px green border
└─────────┘  Green text, white bg
             Height: 36px
             Border radius: 18px (pill)
             Tap → sends as user message
```

## Summary Confirmation Card
```
- Appears as special agent message
- White card with border inside the bubble
- Lists all 5 fields clearly
- Two buttons:
  - "Confirm & Add" → POST /api/cattle → navigate to Cattle List
  - "Edit Details" → agent asks which field to change
```

## Input Bar
```
┌───────────────────────────────┐ ┌───┐
│ Type a message...             │ │ ➤ │
└───────────────────────────────┘ └───┘
- Input height: 48px
- Border: 1px #D6D3D1
- Border radius: 24px
- Send button: 48x48, green circle, white arrow
- Disabled (gray) when input is empty
```

## States
- **Typing indicator**: Three bouncing dots in agent bubble while waiting
- **Error**: "Something went wrong, tap to retry" below failed message
- **Success**: After confirm, show "✅ Lakshmi added to your herd!" then auto-navigate back

## Keyboard
- Auto-focus input on screen open
- Keyboard pushes chat up (KeyboardAvoidingView)
- Scroll to bottom on new message
