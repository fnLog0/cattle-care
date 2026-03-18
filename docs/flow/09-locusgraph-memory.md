# Module: LocusGraph Agent Memory

## Overview
LocusGraph gives the AI Health Agent **persistent memory per cattle**. Instead of starting every chat session fresh, the agent remembers past health observations, treatments applied, farmer actions, and trends — making each conversation smarter over time.

## Problem Without Memory

```
Session 1: "Lakshmi's respiratory rate is 55 — elevated. Move to shade."
              ↓ (2 weeks pass)
Session 2: "Lakshmi's respiratory rate is 55 — elevated. Move to shade."
              ← Same advice repeated. No awareness of history.
```

## Solution: Per-Cattle Memory Graph

```
D1 stores RAW DATA          LocusGraph stores UNDERSTANDING
─────────────────           ──────────────────────────────
vitals readings             "respiratory rate trending up over 3 readings"
chat message logs           "farmer moved Lakshmi to shade on Mar 18"
cattle profile              "shade treatment improved respiratory rate"
                            "Lakshmi is prone to heat stress in summer"
```

---

## Architecture

```
┌──────────────┐     ┌──────────────────────────────┐     ┌──────────────┐
│  Mobile App  │────▶│      Cloudflare Worker        │────▶│  D1 (raw)    │
│              │     │                                │     └──────────────┘
└──────────────┘     │  1. Fetch existing vitals      │
                     │  2. Retrieve memories           │────▶┌──────────────┐
                     │  3. Build prompt                │     │  LocusGraph  │
                     │  4. Call Claude (with tools)    │     │  (memory)    │
                     │  5. If vitals in message:       │     │              │
                     │     → Claude extracts via tool  │     │              │
                     │     → Save to D1 + calc stress  │────▶│              │
                     │  6. Store observation            │────▶│              │
                     └──────────┬──────────────────────┘     └──────────────┘
                                │
                         ┌──────▼───────┐
                         │ Claude API   │
                         │ (tool_use)   │
                         └──────────────┘
```

## Health Agent: Two Modes

The Health Agent handles both **vitals recording** and **health analysis** through natural chat.

### Mode 1: Farmer Submits Vitals via Chat
```
Farmer: "Lakshmi's temperature is 39.2 and respiratory rate is 55"
  → Claude extracts: { temperature: 39.2, respiratoryRate: 55 }
  → Asks for missing: "What's the heart rate and humidity?"
Farmer: "Heart rate 88, humidity 72"
  → Claude extracts all 4 → calls record_vitals tool
  → Worker: calculate stress + INSERT to D1 + UPDATE cattle
  → Claude: "Recorded! Stress level: Moderate. Respiratory rate is elevated..."
```

### Mode 2: Farmer Asks Questions
```
Farmer: "Analyze stress levels"
  → Claude uses existing vitals + LocusGraph memories
  → Responds with analysis referencing trends and past treatments
```

### Claude Tool Definition

```typescript
const tools = [
  {
    name: 'record_vitals',
    description: 'Record vitals for this cattle when the farmer provides temperature, respiratory rate, humidity, and heart rate values. Call this only when all 4 vitals are collected.',
    input_schema: {
      type: 'object',
      properties: {
        temperature: { type: 'number', description: 'Body temperature in °C' },
        respiratoryRate: { type: 'number', description: 'Breaths per minute' },
        humidity: { type: 'number', description: 'Ambient humidity %' },
        heartRate: { type: 'number', description: 'Heart rate in bpm' }
      },
      required: ['temperature', 'respiratoryRate', 'humidity', 'heartRate']
    }
  }
];
```

### System Prompt (Updated)

```
You are a veterinary AI assistant for {cattle.name}.

You have two jobs:
1. COLLECT VITALS: When the farmer tells you vitals (temperature, respiratory
   rate, humidity, heart rate), extract the numbers and call the record_vitals
   tool. If some vitals are missing, ask for the remaining ones conversationally.
   Do NOT call the tool until all 4 are provided.

2. ANALYZE HEALTH: When the farmer asks questions, analyze using the current
   vitals, trends, and past history. Be specific with numbers.

{vitals context}
{memory context}
```

---

## Memory Types Stored Per Cattle

### 1. Health Observations
Stored after the AI analyzes vitals and identifies something notable.

```
event_kind: "observation"
context_id: "observation:cattle_{cattleId}_{timestamp}"
payload: {
  topic: "Lakshmi respiratory concern",
  value: "Respiratory rate 55 bpm (warning). Trending up: 42→48→55 over 3 readings. Possible early respiratory infection or heat stress."
}
related_to: ["fact:cattle_{cattleId}"]
```

### 2. Farmer Actions
Stored when the farmer tells the agent they took action.

```
event_kind: "action"
context_id: "action:cattle_{cattleId}_{timestamp}"
payload: {
  topic: "treatment applied to Lakshmi",
  value: "Farmer moved Lakshmi to shaded area, increased water access. Will monitor for 3 days."
}
related_to: ["observation:cattle_{cattleId}_{prev_timestamp}"]
```

### 3. Outcomes (feedback)
Stored when a follow-up shows whether treatment worked.

```
event_kind: "feedback"
context_id: "feedback:cattle_{cattleId}_{timestamp}"
payload: {
  topic: "shade treatment outcome for Lakshmi",
  value: "Respiratory rate dropped from 55 to 38 after 5 days in shade. Treatment effective."
}
reinforces: ["action:cattle_{cattleId}_{action_timestamp}"]
```

### 4. Per-Cattle Facts
Long-lived knowledge about a specific animal.

```
event_kind: "fact"
context_id: "fact:cattle_{cattleId}"
payload: {
  topic: "Lakshmi profile",
  value: "Zebu, 3 years, 450kg. Prone to heat stress in summer months. Shade treatment has been effective historically."
}
```

---

## Worker Integration

### Enhanced Health Agent Endpoint

```typescript
// POST /api/agent/health
app.post('/api/agent/health', async (c) => {
  const { cattleId, message, conversationHistory } = await c.req.json();
  const userId = c.get('userId');

  // 1. Fetch cattle + vitals from D1
  const cattle = await getCattle(c.env.DB, cattleId);
  const vitals = await getLatestVitals(c.env.DB, cattleId);
  const vitalsHistory = await getVitalsHistory(c.env.DB, cattleId, '30d');

  // 2. Retrieve memories about this cattle from LocusGraph
  const memories = await locusGraph.retrieveMemories({
    query: `${cattle.name} health vitals stress treatment`,
    context_types: {
      observation: [],
      action: [],
      feedback: [],
      fact: [`cattle_${cattleId}`]
    },
    limit: 10
  });

  // 3. Build system prompt with memory context
  const systemPrompt = buildHealthPrompt(cattle, vitals, vitalsHistory, memories);

  // 4. Call Claude with tools
  let reply = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    system: systemPrompt,
    messages: conversationHistory.concat({ role: 'user', content: message }),
    tools,
    max_tokens: 1024
  });

  // 5. Handle tool use — Claude extracted vitals from farmer's message
  let assistantReply = '';
  let newVitals = null;

  if (reply.stop_reason === 'tool_use') {
    const toolUse = reply.content.find(b => b.type === 'tool_use');

    if (toolUse?.name === 'record_vitals') {
      const { temperature, respiratoryRate, humidity, heartRate } = toolUse.input;

      // Calculate stress + save to D1
      const stress = calculateStress({ temperature, respiratoryRate, humidity, heartRate });
      newVitals = await saveVitals(c.env.DB, cattleId, {
        temperature, respiratoryRate, humidity, heartRate,
        stressIndex: stress.score,
        stressLevel: stress.level
      });

      // Send tool result back to Claude for final response
      reply = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        system: systemPrompt,
        messages: [
          ...conversationHistory,
          { role: 'user', content: message },
          { role: 'assistant', content: reply.content },
          { role: 'user', content: [{
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify({
              saved: true,
              stressLevel: stress.level,
              stressIndex: stress.score,
              temperature, respiratoryRate, humidity, heartRate
            })
          }]}
        ],
        tools,
        max_tokens: 1024
      });
    }
  }

  assistantReply = reply.content.find(b => b.type === 'text')?.text ?? '';

  // 6. Store observation in LocusGraph
  const currentVitals = newVitals ?? vitals;
  const insight = extractInsight(assistantReply, cattle, currentVitals);
  if (insight) {
    await locusGraph.storeEvent({
      event_kind: 'observation',
      context_id: `observation:cattle_${cattleId}_${Date.now()}`,
      payload: { topic: `${cattle.name} health check`, value: insight },
      related_to: [`fact:cattle_${cattleId}`]
    });
  }

  // 7. Detect farmer actions mentioned in their message
  const farmerAction = detectFarmerAction(message, cattle);
  if (farmerAction) {
    await locusGraph.storeEvent({
      event_kind: 'action',
      context_id: `action:cattle_${cattleId}_${Date.now()}`,
      payload: { topic: `${cattle.name} farmer action`, value: farmerAction },
      related_to: [`fact:cattle_${cattleId}`]
    });
  }

  return c.json({
    reply: assistantReply,
    vitalsRecorded: newVitals !== null,
    stressLevel: newVitals?.stressLevel ?? vitals?.stressLevel
  });
});
```

### System Prompt Builder

```typescript
function buildHealthPrompt(
  cattle: Cattle,
  vitals: Vitals,
  history: Vitals[],
  memories: Memory[]
): string {
  const memoryBlock = memories.length > 0
    ? `\n## Past History (from memory):\n${memories.map(m =>
        `- [${m.event_kind}] ${m.payload.value}`
      ).join('\n')}\n\nUse this history to:\n- Track trends ("last time respiratory rate was X, now it's Y")\n- Follow up on past concerns\n- Reference treatments that worked or didn't\n- Avoid repeating the same advice if farmer already tried it`
    : '';

  return `You are a veterinary AI assistant for ${cattle.name} (${cattle.earTag}).
Breed: ${cattle.breed}, Age: ${cattle.age} years, Weight: ${cattle.weight} kg.

## Current Vitals:
- Temperature: ${vitals.temperature}°C
- Respiratory Rate: ${vitals.respiratoryRate}/min
- Heart Rate: ${vitals.heartRate} bpm
- Humidity: ${vitals.humidity}%
- Stress Level: ${vitals.stressLevel} (index: ${vitals.stressIndex})

## Vitals Trend (last 30 days):
${history.map(v => `${v.recordedAt}: temp=${v.temperature}, resp=${v.respiratoryRate}, hr=${v.heartRate}`).join('\n')}
${memoryBlock}

Be specific and actionable. Reference actual numbers from the vitals.
When you identify a new concern, state it clearly.
When the farmer mentions they took action (moved to shade, gave medicine, etc.), acknowledge it.`;
}
```

### Insight Extractor

```typescript
// Uses Claude to summarize what was notable in the response
// Only stores when something meaningful was identified
async function extractInsight(
  aiReply: string,
  cattle: Cattle,
  vitals: Vitals
): Promise<string | null> {
  // Simple heuristic: store if vitals are concerning
  const concerns: string[] = [];
  if (vitals.temperature > 40) concerns.push(`temp ${vitals.temperature}°C (critical)`);
  if (vitals.respiratoryRate > 80) concerns.push(`resp ${vitals.respiratoryRate}/min (critical)`);
  else if (vitals.respiratoryRate > 40) concerns.push(`resp ${vitals.respiratoryRate}/min (warning)`);
  if (vitals.heartRate > 100) concerns.push(`HR ${vitals.heartRate} bpm (critical)`);
  else if (vitals.heartRate > 80) concerns.push(`HR ${vitals.heartRate} bpm (warning)`);

  if (concerns.length === 0) return null;

  return `${cattle.name} vitals check: ${concerns.join(', ')}. Stress: ${vitals.stressLevel}.`;
}

// Detects if farmer mentioned taking action
function detectFarmerAction(message: string, cattle: Cattle): string | null {
  const actionKeywords = ['moved', 'gave', 'administered', 'called vet', 'shade',
    'water', 'medicine', 'treated', 'separated', 'isolated', 'feeding'];
  const lower = message.toLowerCase();
  const hasAction = actionKeywords.some(kw => lower.includes(kw));
  if (!hasAction) return null;
  return `Farmer reported for ${cattle.name}: "${message}"`;
}
```

---

## Example Conversations

### Session 1 (March 18) — Farmer Submits Vitals
```
Farmer: "Lakshmi's temperature is 39.2 and respiratory rate is 55"
Agent:   "Got it — temp 39.2°C and respiratory rate 55/min.
          What's her heart rate and humidity?"

Farmer: "Heart rate 88, humidity 72"
Agent:   "✅ Vitals recorded for Lakshmi!
          • Temperature: 39.2°C — Normal
          • Respiratory Rate: 55/min — ⚠ Elevated (normal: ≤ 40)
          • Heart Rate: 88 bpm — ⚠ Elevated (normal: ≤ 80)
          • Humidity: 72% — ⚠ Above comfort range
          • Stress Level: Moderate (score: 3/8)

          Respiratory rate has been trending up: 42 → 48 → 55 over
          the last 3 readings. I recommend moving her to a shaded
          area and ensuring extra water access."

→ D1: vitals row inserted, cattle stress_level updated to 'moderate'
→ LocusGraph stores: observation (respiratory trending up, 42→48→55)
```

### Session 2 (March 19) — Farmer Reports Action
```
Farmer: "I moved Lakshmi to shade yesterday and gave extra water"
Agent:   "Good — I see you moved Lakshmi to shade and increased water.
          I'll track this. Let's check back in a few days to see
          if the respiratory rate improves."

→ LocusGraph stores: action (farmer moved to shade, extra water)
```

### Session 3 (March 25) — Follow-Up Vitals + Memory Recall
```
Farmer: "Temperature 38.5, respiratory 38, heart rate 72, humidity 65"
Agent:   "✅ Vitals recorded for Lakshmi!
          • Temperature: 38.5°C — Normal
          • Respiratory Rate: 38/min — ✓ Normal (was 55 last week!)
          • Heart Rate: 72 bpm — ✓ Normal (was 88)
          • Humidity: 65% — ✓ Normal
          • Stress Level: None (score: 0/8)

          Great news! Respiratory rate dropped from 55 to 38/min —
          back in the normal range. The shade treatment you applied
          on March 19 appears to have worked well. Keep it up!"

→ D1: vitals row inserted, cattle stress_level updated to 'none'
→ LocusGraph stores: feedback (shade treatment effective, resp 55→38)
```

---

## LocusGraph Context Structure

```
fact:cattle_{id}                    ← long-lived cattle knowledge
  ├── observation:cattle_{id}_{ts}  ← health checks, concerns
  │     └── action:cattle_{id}_{ts} ← farmer treatments
  │           └── feedback:cattle_{id}_{ts} ← outcomes
  ├── observation:cattle_{id}_{ts}  ← another check
  └── ...
```

### Retrieval Queries by Use Case

| Scenario | Query | Filters |
|----------|-------|---------|
| Open health chat | `"{name} health vitals"` | `context_types: { observation, action, feedback }` |
| Farmer asks "what did we try?" | `"{name} treatment action"` | `context_types: { action }` |
| Check trends | `"{name} trend respiratory"` | `context_types: { observation, feedback }` |
| Full history | `"{name}"` | `context_types: { observation, action, feedback, fact }` |

---

## Mock Implementation

For the mock-first approach, LocusGraph calls can be simulated with an in-memory store:

```typescript
// mock/memory.mock.ts
type MockMemory = {
  event_kind: string;
  context_id: string;
  payload: { topic: string; value: string };
  related_to?: string[];
  timestamp: number;
};

const memoryStore: MockMemory[] = [];

export async function retrieveMemories(query: string): Promise<MockMemory[]> {
  await delay(200);
  const lower = query.toLowerCase();
  return memoryStore
    .filter(m => m.payload.value.toLowerCase().includes(lower)
      || m.payload.topic.toLowerCase().includes(lower))
    .slice(-5);
}

export async function storeEvent(memory: Omit<MockMemory, 'timestamp'>): Promise<void> {
  await delay(100);
  memoryStore.push({ ...memory, timestamp: Date.now() });
}
```

---

## Migration Path

| Phase | Memory Source | Notes |
|-------|-------------|-------|
| Mock (current) | In-memory array | `mock/memory.mock.ts` — simple keyword match |
| Real (API swap) | LocusGraph gRPC/API | `services/memory.ts` swaps import, same interface |

Follows the same swap pattern as all other services:
```typescript
// services/memory.ts — MOCK MODE
import * as mock from '@/mock/memory.mock';
export const retrieveMemories = mock.retrieveMemories;
export const storeEvent = mock.storeEvent;

// services/memory.ts — REAL MODE (later)
import { locusGraphClient } from './locusgraph-client';
export const retrieveMemories = (query) => locusGraphClient.retrieve({ query });
export const storeEvent = (event) => locusGraphClient.store(event);
```
