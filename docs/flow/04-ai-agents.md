# Module: AI Agent

## Overview
A single Claude-powered AI Health Agent provides per-cattle health analysis and vitals recording through natural chat. Claude API is called from Cloudflare Workers. Cattle registration uses a simple form (see [02-cattle.md](./02-cattle.md)) — no AI needed for 5 fixed fields.

---

## Health Agent

### Purpose
Per-cattle AI advisor that analyzes vitals, assesses stress, and provides actionable health recommendations.

### Location
Cattle Detail → AI Agent Tab

### Context Provided to Agent
```json
{
  "cattle": {
    "name": "Lakshmi",
    "breed": "zebu",
    "age": 3,
    "weight": 450.5,
    "earTag": "A-042"
  },
  "latestVitals": {
    "temperature": 39.2,
    "respiratoryRate": 55,
    "humidity": 72,
    "heartRate": 88,
    "stressLevel": "moderate",
    "recordedAt": "2026-03-18T10:30:00Z"
  },
  "vitalsHistory": [ ... ]
}
```

### Quick Prompt Chips
| Chip | Triggers |
|------|----------|
| "Analyze stress levels" | Detailed breakdown of each vital's contribution to stress |
| "Any health risks?" | Risk assessment based on trends + current vitals |
| "Recommend treatment" | Actionable steps (cooling, hydration, vet contact, etc.) |

### Flow
```
1. User opens AI Agent tab on Cattle Detail
2. Worker fetches cattle profile + latest vitals from D1
3. Builds system prompt with cattle context
4. User can type freely or tap quick prompt chips
5. Worker sends message + context to Claude API
6. Agent responds with health-specific advice
7. Conversation stored in D1
```

### System Prompt (Summary)
```
You are a veterinary AI assistant for a specific cattle.
You have access to the animal's profile, latest vitals, and history.
Analyze stress levels, identify health risks, and recommend treatments.
Be specific and actionable. Use the provided vitals data in your analysis.
Always mention which vitals are concerning and why.
```

### REST API
| Method | Path | Input (JSON Body) | Output | Auth |
|--------|------|-------------------|--------|------|
| `POST` | `/api/agent/health` | `{ cattleId, message, conversationHistory }` | `{ reply }` | ✅ Yes |

---

## D1 Database Schema

```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cattle_id TEXT REFERENCES cattle(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('registration', 'health')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata TEXT,  -- JSON string for extracted data (registration agent)
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_conversations_cattle ON conversations(cattle_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
```

## Worker Implementation Notes
- **Anthropic API Key**: stored in Workers Secrets (`ANTHROPIC_API_KEY`)
- **Claude model**: `claude-sonnet-4-20250514` (or latest)
- **Streaming**: Use Workers streaming response for real-time chat feel
- **Context window**: Include last 20 messages max to stay within token limits
- **Registration agent**: Uses Claude tool/function calling to extract structured JSON
- **Health agent**: Cattle vitals injected into system prompt on each request
