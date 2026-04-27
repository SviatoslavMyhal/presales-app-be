# PreSalesAI — Backend architecture (deal engine)

This repository contains **two layers**:

1. **Legacy JS pipeline** — `src/agents/`, `agentOrchestrator`, `/api/presales/*`, tools (proposal, briefing, …).
2. **PreSalesAI TypeScript module** — `src/presales-ai/`, compiled to `dist/presales-ai/`, exposed as **`/api/deal/*`** and **`/api/call/*`**.

The TS layer is a **thinking engine**: structured outputs (Zod), insight artifacts, scoring hooks, knowledge memory, and **streaming-ready** live assist — without duplicating the multi-agent orchestration for **full deal analysis** (that still delegates to `agentOrchestrator`).

---

## Folder structure

```
src/presales-ai/
  shared/           types.ts, errors.ts
  ai/               llmClient.ts (chat JSON + stream), schemas.ts (Zod)
  deal/             dealService.ts, insightStore.ts, pipelineMapper.ts
  question/         questionEngine.ts
  solution/         solutionEngine.ts
  psychology/       riskPsychology.ts
  call/             liveAssist.ts (stream + structured)
  knowledge/        knowledgeMemory.ts (in-memory; swap for PG + embeddings later)
```

After `npm run build`, compiled JS lives under **`dist/presales-ai/`** (gitignored).

---

## API mapping (REST)

| Endpoint | Role |
|----------|------|
| `POST /api/deal/analyze` | Runs **full** multi-agent pipeline via `agentOrchestrator`, persists **Deal** + **Insights** in memory, records **knowledgeMemory**, returns `{ deal, pipeline, insights }`. |
| `POST /api/deal/questions` | Standalone **categorized** discovery questions (LLM JSON + Zod). |
| `POST /api/deal/solution` | **Fast vs scalable** variants + architecture notes. |
| `POST /api/deal/risks` | **Psychology / risk** lens (vague reqs, red flags, strategy). |
| `GET /api/deal/:id/insights` | Read stored insights + deal snapshot for `deal.id` from last analyze on this process. |
| `GET /api/deal/memory/recent` | Recent deal fingerprints (MVP in-memory). |
| `GET /api/deal/memory/similar?q=` | Cheap similarity over past job posts. |
| `POST /api/call/live-assist` | Structured JSON assist from transcript notes. |
| `POST /api/call/live-assist/stream` | **SSE** token stream (`data: {"token":"..."}`). |

Existing routes (`/api/presales/*`) remain unchanged for backward compatibility.

---

## Pipeline (step-by-step): `POST /api/deal/analyze`

1. **Input** normalized: `job_post`, optional `client_messages`, `team_expertise`, `constraints`.
2. **`agentOrchestrator.run(input)`** — Analyst → Intelligence ∥ Risk → Strategy → Synthesis (same as `/api/presales/analyze`).
3. **`pipelineMapper`** — maps each agent output into typed **Insight** records (summary, risk, solution_variant, psychology, scores).
4. **`computeScoresFromPipeline`** — derives `deal_quality` / `risk_score` heuristics (replace with your scoring model / paid tier).
5. **`insightStore`** — in-memory `Map` (restart clears; **persist to Supabase** for SaaS).
6. **`knowledgeMemory.recordDeal`** — fingerprint for similarity search.

---

## SaaS / monetization hooks

- **Insight types** align with billable “artifacts” (export, PDF, API quota).
- **Knowledge memory** is swappable: `DealFingerprint` → Postgres + `pgvector` or external vector DB.
- **Live assist**: streaming endpoint ready for **per-minute** billing or seat-based caps.

---

## Build & run

```bash
npm install
npm run build    # required before first start (or use npm run dev)
npm start
```

`prestart` runs `tsc` automatically for `npm start`. In development, `npm run dev` runs build once then `nodemon` (re-run `npm run build` after TS changes).

---

## Future work

- Persist **Deal** / **Insight** to Supabase with RLS (tenant_id).
- Replace token overlap with **embeddings** for `findSimilar`.
- Add **retry / idempotency** in `llmClient` and rate limits per API key.
- Unify **Zod** outputs with existing agent JSON envelopes where possible.
