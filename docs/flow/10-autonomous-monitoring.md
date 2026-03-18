# Module: Autonomous Monitoring (Future — LangGraph)

> **Status**: Planned — not in current scope. Requires LangGraph workflow engine.

## Overview
An autonomous multi-step agent that continuously monitors herd health, detects at-risk cattle, cross-references treatment history via LocusGraph, drafts alerts, and notifies farmers/vets with human-in-the-loop confirmation.

## Why LangGraph (Not Simple Prompt→Response)

Current Health Agent:
```
Farmer asks → fetch vitals → retrieve memories → Claude responds → done
```

Autonomous Monitoring Agent:
```
Timer triggers → scan all cattle → identify at-risk → check past treatments
  → draft alert → wait for farmer confirmation → notify vet → follow up
  → store outcome → update cattle risk profile
```

This is a **stateful, multi-step, branching workflow** with:
- Conditional routing (healthy vs. at-risk vs. critical)
- Parallel agent execution (analyze multiple cattle simultaneously)
- Human-in-the-loop checkpoints (farmer must approve before vet is notified)
- Tool calling loops (agent decides what to check next)
- Long-running state (workflow spans hours/days)

---

## Architecture

```
┌──────────────┐     ┌──────────────────────────────────────────┐
│  Cron Trigger │────▶│           LangGraph Workflow              │
│  (every 1hr)  │     │                                          │
└──────────────┘     │  ┌─────────┐    ┌──────────┐             │
                     │  │  Scan   │───▶│ Analyze  │             │
                     │  │  Node   │    │  Node    │             │
                     │  └─────────┘    └────┬─────┘             │
                     │                      │                    │
                     │              ┌───────┼────────┐           │
                     │              ▼       ▼        ▼           │
                     │          healthy   at-risk  critical      │
                     │            │         │         │           │
                     │          (end)   ┌───▼───┐  ┌─▼────────┐ │
                     │                  │ Draft  │  │ Urgent   │ │
                     │                  │ Alert  │  │ Alert +  │ │
                     │                  └───┬───┘  │ Vet Call  │ │
                     │                      │      └─┬────────┘ │
                     │                      ▼        ▼           │
                     │                 ┌──────────────┐          │
                     │                 │  Human Gate   │          │
                     │                 │ (farmer app)  │          │
                     │                 └──────┬───────┘          │
                     │                        ▼                  │
                     │                 ┌──────────────┐          │
                     │                 │   Execute    │          │
                     │                 │  (notify/    │          │
                     │                 │   store)     │          │
                     │                 └──────────────┘          │
                     └──────────────────────────────────────────┘
                              │              │            │
                        ┌─────▼──┐    ┌──────▼───┐  ┌────▼─────┐
                        │   D1   │    │ LocusGraph│  │  Push /  │
                        │(vitals)│    │ (memory)  │  │  SMS     │
                        └────────┘    └──────────┘  └──────────┘
```

---

## Workflow Nodes

### 1. Scan Node
Runs on schedule. Fetches all cattle + latest vitals for a user.

```
Trigger: Cron (every 1 hour) or manual
Input: userId
Output: [{ cattle, vitals }]
Tools: D1 query (all cattle with latest vitals)
```

### 2. Analyze Node
Runs in parallel per cattle. Checks current vitals against thresholds and LocusGraph history.

```
Input: { cattle, vitals }
Tools: LocusGraph retrieve (past observations, treatments)
Logic:
  - Compare current vitals to thresholds
  - Check trend direction (improving / worsening / stable)
  - Check if past treatment was applied and whether it worked
  - Cross-reference with similar cattle patterns
Output: { cattleId, risk: 'healthy' | 'at-risk' | 'critical', reasoning, suggestedAction }
```

### 3. Route (Conditional Edge)
```
if risk == 'healthy'  → end (no action, optional log)
if risk == 'at-risk'  → Draft Alert Node
if risk == 'critical' → Urgent Alert Node
```

### 4. Draft Alert Node
Generates a farmer-friendly alert using Claude.

```
Input: { cattle, vitals, reasoning, pastMemories }
Tools: Claude API
Output: {
  alertText: "Lakshmi's respiratory rate has been rising for 3 days (42→48→55).
              Recommended: move to shade, increase water. Shall I notify your vet?",
  suggestedActions: ["move_to_shade", "increase_water", "notify_vet"]
}
```

### 5. Urgent Alert Node
For critical cattle — generates alert AND prepares vet notification.

```
Input: { cattle, vitals, reasoning }
Tools: Claude API
Output: {
  alertText: "⛔ URGENT: Nandi's temperature is 41.5°C (critical). Immediate vet attention needed.",
  vetMessage: "Emergency: Cattle Nandi (ET-007), temp 41.5°C, resp 85/min. Owner: Ram Kumar. Location: ...",
  suggestedActions: ["notify_vet_immediately", "cool_water", "isolate"]
}
```

### 6. Human Gate (Checkpoint)
Workflow **pauses** and waits for farmer response via push notification or in-app prompt.

```
Input: { alertText, suggestedActions }
Farmer can:
  - ✅ Approve actions → continue to Execute Node
  - ✏️ Modify actions → update, then continue
  - ❌ Dismiss → end (store dismissal in LocusGraph)
Timeout: 30 minutes for at-risk, 10 minutes for critical
Fallback: If no response on critical → auto-notify emergency contact
```

### 7. Execute Node
Carries out approved actions.

```
Actions:
  - Send push notification to farmer
  - Send SMS/WhatsApp to vet (if approved)
  - Store observation in LocusGraph
  - Store action taken in LocusGraph
  - Update cattle alert status in D1
```

### 8. Follow-Up Node (Delayed)
Scheduled check after treatment window.

```
Trigger: 24–72 hours after action
Logic:
  - Fetch latest vitals
  - Compare to pre-treatment vitals
  - Store feedback in LocusGraph (treatment worked / didn't work)
  - If not improved → re-enter workflow as new scan
```

---

## LangGraph State Schema

```typescript
type MonitoringState = {
  userId: string;
  cattleList: Array<{
    cattle: Cattle;
    vitals: Vitals;
    risk: 'healthy' | 'at-risk' | 'critical';
    reasoning: string;
    pastMemories: Memory[];
    suggestedAction: string;
  }>;
  alerts: Array<{
    cattleId: string;
    alertText: string;
    vetMessage?: string;
    suggestedActions: string[];
    farmerResponse?: 'approved' | 'modified' | 'dismissed';
    executedAt?: string;
  }>;
  followUps: Array<{
    cattleId: string;
    scheduledAt: string;
    originalVitals: Vitals;
  }>;
};
```

---

## LocusGraph Integration

### What Gets Stored

| Event | When | Example |
|-------|------|---------|
| `observation` | Analyze Node finds concern | "Lakshmi resp trending up 3 days" |
| `observation` | Analyze Node finds improvement | "Nandi temp normalized after treatment" |
| `action` | Execute Node sends alert | "Sent at-risk alert to farmer for Lakshmi" |
| `action` | Execute Node notifies vet | "Vet Dr. Sharma notified about Nandi" |
| `feedback` | Follow-Up Node checks outcome | "Shade treatment effective: resp 55→38 in 5 days" |
| `feedback` | Farmer dismisses alert | "Farmer dismissed alert — noted as false positive" |

### What Gets Retrieved

| Node | Query | Purpose |
|------|-------|---------|
| Analyze | `"{name} health trend treatment"` | Avoid re-alerting for known issues under treatment |
| Draft Alert | `"{name} past treatments outcomes"` | Reference what worked before in the alert text |
| Follow-Up | `"{name} action treatment"` | Compare current vitals to pre-treatment baseline |

---

## Notification Channels

| Priority | Channel | Timing |
|----------|---------|--------|
| At-risk | In-app push notification | Within scan cycle |
| Critical | Push + SMS to farmer | Immediate |
| Critical (no response) | SMS to emergency contact / vet | After 10 min timeout |

---

## Tech Stack (Future)

| Component | Technology |
|-----------|-----------|
| Workflow Engine | LangGraph (Python) or LangGraph.js |
| Scheduler | Cloudflare Cron Triggers or Durable Objects |
| State Persistence | LangGraph checkpointer (D1 or KV) |
| Notifications | Expo Push Notifications + Twilio SMS |
| Memory | LocusGraph (observations, actions, feedback) |
| AI | Claude API (analysis + alert drafting) |

---

## Prerequisites Before Implementation

1. LocusGraph agent memory working (Module 09)
2. Real API backend deployed (mock swap complete)
3. Push notification infrastructure (Expo notifications)
4. SMS/WhatsApp integration for vet notifications
5. Farmer emergency contact field in user profile

---

## Example Full Cycle

```
Hour 0:  Cron fires → Scan 24 cattle
         → 22 healthy (skip)
         → Lakshmi at-risk (resp 55, trending up)
         → Nandi critical (temp 41.5°C)

Hour 0+1s: Analyze Lakshmi
           → LocusGraph: no past treatment for this issue
           → Draft alert: "Respiratory rate rising. Move to shade?"

Hour 0+1s: Analyze Nandi (parallel)
           → LocusGraph: "had fever last month, antibiotics worked"
           → Urgent alert: "Critical temp. Similar to last month — vet needed."

Hour 0+2s: Push notification to farmer (both alerts)

Hour 0+5m: Farmer approves Lakshmi shade action
           Farmer approves Nandi vet notification
           → SMS sent to Dr. Sharma
           → Actions stored in LocusGraph

Hour 72:   Follow-up check
           → Lakshmi resp: 55→38 ✓ (store feedback: shade worked)
           → Nandi temp: 41.5→38.5 ✓ (store feedback: antibiotics worked again)
```
