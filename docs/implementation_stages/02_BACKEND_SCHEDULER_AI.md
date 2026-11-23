# Stage 2 Prompt: Backend, Fair Scheduler, and GenAI

Run this after Stage 1 passes. If a second coding agent is used, give it the frozen contract and restrict its edits to server/domain/API files. The frontend agent must not change the contract while this stage is active.

---

## Role and objective

Implement the LabLink domain inside the existing TypeScript workspaces: pure scheduling logic in `shared/` or `server/src/domain`, thin Express routes in `server/`, the browser-snapshot service boundary, and one safe GenAI capability. The engine must return feasible, explainable options; faculty remains the final approver. Do not migrate frameworks or duplicate schemas.

Read `docs/implementation_stages/README.md`, `01_FOUNDATION_AND_CONTRACT.md`, `AGENTS.md`, `CLAUDE.md`, `docs/API_CONTRACT.md`, `docs/PRD.md`, `docs/DATA_MODEL.md`, `docs/ARCHITECTURE.md`, and `docs/AI_PIPELINE.md` before editing. Apply the source-of-truth corrections in Stage 1 if any survived.

## Stage loop

1. Inspect current changes and confirm the Stage 1 contract/schema versions.
2. Implement the pure domain functions first; keep routes thin and I/O out of scheduling logic.
3. Add service/API and AI adapter code against the contract.
4. Add focused tests for the invariants below.
5. Run backend typecheck/build/tests, fix, and repeat. Update docs with actual behavior, not planned behavior.
6. Stop at the acceptance gate and report changed files, routes, test evidence, and remaining limitations.

## Required domain rules

Use server-side TypeScript with strict types and the existing shared Zod schemas as the source of truth. Keep resource IDs and capability tags from the actual seeded catalog as the only valid match targets. Update the current schema's `academicSeniority` score field; no seniority score may remain in API output or the UI.

### Hard feasibility gates

A candidate allocation is feasible only if all conditions pass:

- Required resource or capability is supported; an equivalent resource must be explicitly marked equivalent or satisfy all mandatory capabilities.
- Resource is available, not in maintenance, and inside lab operating hours.
- Student/demo user satisfies the resource's required safety certification.
- Requested duration is within allowed limits and any required buffer is included.
- Candidate interval is within the request window and completes before the project deadline.
- Candidate does not overlap another confirmed booking or a previously selected allocation on that resource.

Use half-open intervals `[start,end)`, so a booking ending at 14:00 does not collide with one starting at 14:00. Normalize date math and compare instants consistently; display in `Asia/Kolkata`.

### Explainable fairness policy

Keep feasibility separate from prioritization. A missing certification, incompatible tool, or unavailable slot must never be “rescued” by a high score.

For feasible competing requests, implement a small policy with three visible factors:

1. **Deadline urgency:** earlier project deadlines raise priority using a normalized, bounded function.
2. **Fair share:** lower recent use of scarce lab resources raises priority modestly.
3. **Waiting time:** older requests receive an aging boost to reduce starvation.

Use this explicit, transparent demo policy unless a verified requirement forces a documented adjustment: `urgency = round(100 * clamp(1 - daysUntilDeadline / 30, 0, 1))`; `fairShare = round(100 * clamp(1 - recentHoursOnResourceGroup / 12, 0, 1))`; `waitAge = round(100 * clamp(hoursWaiting / 72, 0, 1))`; `priority = round(0.50 * urgency + 0.30 * fairShare + 0.20 * waitAge)`. Put these weights/thresholds in one named constant and explain them in `docs/AI_PIPELINE.md` and `docs/ASSUMPTIONS.md` as a demo policy, never organizer scoring rules. Do not score academic level, seniority, school year, or project label. Do not give users a bonus for claiming inflexibility. Requirement compatibility is a gate; use exact match before equivalent-resource suggestions.

For a conflict cluster, produce a deterministic ordering: transparent policy score descending, then earlier submission timestamp, then stable request ID. Select the best feasible slot with the least displacement from the requested window; prefer a slot that preserves scarce alternatives for other requests. Explain the practical limitations of this bounded recommendation policy. Never claim globally optimal scheduling.

Generate alternatives in this order: nearest feasible slot on the same resource, marked-equivalent resource, then split session only if the request allows split use. If none exists, return an honest no-feasible-slot result and the earliest waitlist suggestion. Keep alternatives bounded (maximum three).

### State and mutation boundaries

- `POST /api/v1/scheduling/arbitrate` is read-only and returns proposals with score factors, feasibility reasons, and alternatives.
- `POST /api/v1/scheduling/apply` rechecks the submitted demo snapshot before applying. It returns an updated snapshot with **pending faculty approval**; it does not silently confirm access.
- `POST /api/v1/faculty/approvals/:id` requires the current snapshot and a reason for reject/reschedule; it records a synthetic audit event in the returned snapshot.
- `POST /api/v1/requests` and approval/apply mutations return an updated demo snapshot; `POST /api/v1/requests/query` and arbitration are read-only. Cloud Run is stateless: the browser carries the synthetic scenario snapshot and persists returned snapshots locally. The server must not keep authoritative state in process memory. `POST /api/v1/demo/reset` always returns the exact same seed scenario. Clearly state that data is per browser and demo-only.
- Public demo routes may change only synthetic demo data. Do not claim the role selector is authentication or apply it to real records.

## GenAI behavior

Implement one visible GenAI use first: natural-language project text to an editable structured equipment/request draft.

- Verify the current official Google GenAI SDK and a supported fast model before wiring it. The current scaffold depends on the older `@google/generative-ai`; migrate to the currently supported official SDK only after verification, remove the old dependency, and record the reason in `docs/TRD.md`. Use a configurable model name; never paste a key into code or client config.
- Send only the short project text and the minimum catalog summary needed. Limit input length; use a timeout; cap response size.
- Use schema-constrained structured output where supported, then validate it again with Zod.
- Accept only IDs/capabilities that exist in the supplied catalog. Treat model output as untrusted data. The user reviews and edits every parsed field before request submission.
- Model output cannot create availability, set booking status, rank winners, approve, or apply an allocation.
- When key/network/quota is unavailable, run a keyword/synonym fallback and return an explicit `source: "rules"` marker. UI text must say `AI-assisted` or `Rule-based` accurately.
- Avoid logging user project text, prompt contents, API keys, or secrets. Do not include hidden instructions or unrelated student data in the model prompt.

## API behavior

Implement only the frozen `/api/v1/*` endpoints and keep error responses consistent with existing Express conventions. Validate params, query, body, and demo snapshot. Return 400 for invalid input, 404 for unknown resource/request, and 409 when a stale proposal no longer fits. Do not return stack traces. Apply basic body limits and an AI-route rate limit using the existing `express-rate-limit` dependency; avoid extra middleware packages unless justified in `docs/TRD.md`.

## Focused tests

Write tests for:

- interval boundaries, overlap, and buffers;
- unavailable/maintenance resource and out-of-hours rejection;
- missing certification and incompatible capability rejection;
- deadline-infeasible candidate and no-alternative result;
- fairness factors and deterministic tie ordering without seniority;
- multiple conflicting requests never receiving overlapping assignments;
- stale proposal rejected at apply;
- faculty decision state transitions and required reason;
- AI valid schema, malformed output, timeout, and rules fallback.

## Acceptance gate

- P0 API routes work against the seed scenario.
- The same inputs produce the same allocation result.
- No infeasible allocation is returned as available or confirmed.
- Apply revalidates; faculty remains the final approval.
- Focused domain/API tests, typecheck, and build pass.
- The Express server starts and serves APIs with no Gemini credentials; the AI route returns the tested rules fallback.

