# Module: AI Health Agent (LangGraph)

## Overview
A single Claude-powered **Health Agent** lives on every cattle's detail screen. The agent is implemented as a **LangGraph.js workflow** running inside the Cloudflare Worker. It reasons over two stress signals and replies in natural language:

- **Individual cattle stress** — the Strain Index persisted on `cattle.stress_level`, last computed via `PATCH /api/stress/cattle/:id` (see `flow/03-vitals-stress.md`).
- **Environmental stress** — the THI band at the farm's location, computed live via `GET /api/stress/environmental`.

> Long-term per-cattle memory (LocusGraph) is **out of scope** for this iteration. Conversation history is persisted to D1 only.

Cattle registration uses a plain form (see `flow/02-cattle.md`). No AI is involved there.

---

## Endpoint

```
POST /api/agent/health
Auth: Bearer <session token>
Body: {
  cattleId:   string,           // required
  message:    string,           // required, 1–2000 chars
  latitude?:  number,           // optional, -90..90
  longitude?: number            // optional, -180..180
}
Response: {
  reply: string,
  conversationId: string,
  cattleStress?:     CattleStressSnapshot,
  environmentalStress?: ThiSnapshot
}
```

If `latitude`/`longitude` are omitted, the environmental signal is skipped and the agent reasons over the individual stress alone.

---

## LangGraph Workflow

The handler builds a small directed graph with four nodes. Each invocation runs once per user message; the graph is *not* persisted between requests (the conversation is — via D1).

```
        ┌──────────────┐
START ─▶│ loadContext  │     fetch cattle, last stress, THI,
        └──────┬───────┘     and recent messages in parallel
               │
               ▼
        ┌──────────────┐
        │ buildPrompt  │     compose system prompt
        └──────┬───────┘     from both stress signals + history
               │
               ▼
        ┌──────────────┐
        │   respond    │     Claude (claude-sonnet-4-…)
        └──────┬───────┘     via @langchain/anthropic
               │
               ▼
        ┌──────────────┐
        │   persist    │     insert user + assistant rows
        └──────┬───────┘     into messages, bump conversation
               │
              END
```

### Graph State

```ts
type AgentState = {
  // Input
  cattleId: string;
  userId: string;
  userMessage: string;
  latitude?: number;
  longitude?: number;

  // Resolved by loadContext
  conversationId: string;
  cattle: CattleRow;
  cattleStress: { level: StressLevel; updatedAt: string };
  vitalsHistory: VitalsRow[]; // last 10 readings, ascending
  environmentalStress?: ThiResult;
  recentMessages: { role: 'user' | 'assistant'; content: string }[];

  // Resolved by buildPrompt
  systemPrompt: string;

  // Resolved by respond
  reply: string;
};
```

### Nodes

#### 1. `loadContext`
- `SELECT * FROM cattle WHERE id = ? AND user_id = ?` → 404 if missing
- Look up (or create) the `health` conversation for this user × cattle
- In parallel:
  - `getRecentMessages(…, limit=20)` — conversation history
  - `getLatestVitals(…, limit=10)` — trend data for the prompt
  - if `latitude`/`longitude` provided: `getEnvironmentalStress(lat, lon)` (cached 10 min)

#### 2. `buildPrompt`
Composes a system prompt with:
- Cattle profile (name, breed, age, weight, ear tag)
- Current individual stress level + when it was last computed
- Current environmental THI band (or "not provided")
- Reasoning rules (see *System Prompt* below)

#### 3. `respond`
- Calls Claude through `@langchain/anthropic` with system prompt + conversation history + the new user turn
- `max_tokens: 1024`
- No tool-use in this iteration

#### 4. `persist`
- `INSERT INTO messages` once for the user turn, once for the assistant reply
- `UPDATE conversations SET updated_at = now() WHERE id = ?`

---

## System Prompt

```
You are a veterinary AI assistant for {cattle.name} ({cattle.earTag}).
Breed: {cattle.breed}, Age: {cattle.age} years, Weight: {cattle.weight} kg.

You reason over TWO stress signals:

1. Individual cattle stress (Strain Index):
   - Current level: {cattle.stress_level}
   - Last computed at: {cattle.updated_at}
   - This comes from the cattle's rectal temperature and respiration
     rate, breed-normalized.

   Recent trend (use this to detect improvement or deterioration):
   Last N reading(s), oldest first (direction: rising | falling | stable):
   • {ts}: T={temp}°C, R={resp}/min → SI {si} ({level})
   • ...

2. Environmental stress (THI):
   {if envStress}
   - Outdoor temperature: {env.temperature}°C
   - Relative humidity: {env.humidity}%
   - THI: {env.thi}
   - Level: {env.stressLevel}
   {else}
   - No environmental reading was provided for this session.
   {endif}

Reasoning rules:
- If individual stress is high but environment is "none"/"mild" →
  look for infection, injury, or per-animal health issues.
- If THI is "severe" or "danger" → heat stress is the dominant driver;
  recommend shade, water, cooling, ventilation.
- If both are elevated → the environment is amplifying an underlying
  issue. Mitigate the environment first, then re-check vitals.
- Always cite the numbers you used. Always say WHICH signal you are
  acting on.
- If the trend shows recent improvement after a prior alert, acknowledge it.
- If the trend shows deterioration, escalate (vet contact, immediate action).
- Keep replies short, specific, and actionable. Avoid generic platitudes.
```

---

## D1 Schema

```sql
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cattle_id TEXT NOT NULL REFERENCES cattle(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL DEFAULT 'health' CHECK (agent_type IN ('health')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, cattle_id, agent_type)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages(conversation_id, created_at);
```

Each `(user_id, cattle_id)` has at most one `health` conversation. New messages append to it.

---

## Worker Configuration

The agent supports **two LLM providers** behind a single interface
(`services/agent/tools.ts → createLLM`). Switch via env var.

| Var | Where | Required | Notes |
|-----|-------|----------|-------|
| `AGENT_PROVIDER` | env / `wrangler.jsonc` `[vars]` | optional | `anthropic` (default) or `openai` |
| `ANTHROPIC_API_KEY` | Workers Secret | required if `AGENT_PROVIDER=anthropic` | |
| `ANTHROPIC_MODEL` | env | optional | default `claude-sonnet-4-20250514` |
| `OPENAI_API_KEY` | Workers Secret | required if `AGENT_PROVIDER=openai` | |
| `OPENAI_MODEL` | env | optional | default `gpt-4.1` |

Set locally via `.dev.vars`:
```
AGENT_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
# or
AGENT_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

In production:
```
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put OPENAI_API_KEY
```

LangChain abstracts the message + tool-calling layer, so swapping providers
requires no changes to nodes, prompts, or graph wiring.

---

## Frontend Integration

```ts
// app/services/agent.ts
export async function chatHealth(input: {
  cattleId: string;
  message: string;
  latitude?: number;
  longitude?: number;
}): Promise<{ reply: string; conversationId: string }> {
  return apiRequest('/api/agent/health', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
```

The chat UI on `app/cattle/[id]/agent.tsx` calls this on every send. It can pull `latitude`/`longitude` from `expo-location` and pass them through; if location permission is denied, leave them off and the agent will reason from individual stress alone.

---

## Out of Scope (for this iteration)

- Tool-use for vitals recording (would need the `vitals` history table — not yet built).
- LocusGraph long-term memory.
- Streaming responses (we return a single JSON for now).
- Autonomous monitoring (see `flow/10-autonomous-monitoring.md`).
