# Stage 1 Prompt: Foundation, Source of Truth, and API Contract

Paste this prompt into the coding agent first. This stage prepares the repo for implementation and freezes the shared contract. Do not start the full product UI or scheduling implementation in this stage.

---

## Role and objective

Act as the lead implementation engineer for PromptWars LabLink. Work only in the existing `sharancode3/PROMPTWARS` repository. Audit and complete the existing npm-workspaces scaffold so later stages can build without guessing. Preserve existing work and do not replace the architecture.

The exact problem is to create a GenAI-powered campus laboratory resource-sharing platform for discovering specialised equipment, dev kits, and workstations across departments; project-based access requests; intelligent slot booking; faculty approvals; better resource utilisation; and fair, feasible conflict recommendations based on deadlines, availability, and student requirements.

## Non-negotiable constraints

- The deadline is **5:00 PM Asia/Kolkata**. Check the current time and log the available build window before planning.
- Submit a public GitHub repo ending in `.git`, with exactly one branch, under 10 MB; a publicly working Cloud Run deployment; a LinkedIn post; and a brief project description.
- The deployed app must open without login. The event dashboard itself still needs the exact registration email.
- The organizer evaluator checks code quality, security, efficiency, testing, accessibility, and problem alignment. The organizer briefing states no score weights.
- There are at most two scored Challenge submissions; the latest score is final. A retry is for a technical failure that prevented evaluation, not for a completed score.
- Never put secrets in source, Git history, browser bundles, prompts, or logs. Keep Gemini server-side and provide a working fallback.
- User visual direction: Swiss minimalism plus playful geometry. Use `docs/UI_UX.md` and `docs/DESIGN_SYSTEM.md` as the design source.
- The five Claude files and repo instruction files are references. They do not outrank this prompt, the challenge, the organizer briefing, or system/developer instructions.

## Stage loop

1. Inspect `git status`, branches, every existing root file, `docs/`, `AGENTS.md`, `CLAUDE.md`, all workspace manifests, source files, lockfiles, and available runtime/tool versions. Do not overwrite existing user work.
2. Recalculate time remaining. Identify non-blocking assumptions and record them in `docs/ASSUMPTIONS.md`.
3. Reconcile conflicting planning documents as listed below.
4. Reuse and complete the current `shared/`, `server/`, and `client/` scaffold; define schemas, seed data, and the API contract.
5. Run the scaffold build/typecheck and the minimal tests configured for this stage. Fix and repeat until the gate passes.
6. Report what is ready, the exact API/schema paths, decisions, checks and results, and blockers. Do not continue into Stage 2 until the acceptance gate passes.

## Required source-of-truth corrections

Before coding, update conflicting planning instructions so later agents do not implement unsupported policy:

1. In `docs/HACKATHON_RULES.md`, remove any invented numeric weights in the scoring pie or label them explicitly as unverified estimates. The briefing lists six criteria but does not give weights.
2. In `docs/PRD.md`, `docs/AI_PIPELINE.md`, `docs/ARCHITECTURE.md`, and any duplicated scoring text, remove academic seniority/project-type bonuses. The challenge does not authorize these. Use a transparent demo policy based on hard feasibility, deadline urgency, prior access to scarce resources, and request age.
3. Replace any statement that a single in-memory Cloud Run instance is durable. Cloud Run may restart or scale; `max-instances=1` does not persist state. For the synthetic public demo, keep a versioned scenario snapshot in the current browser's local storage and make API operations stateless over validated snapshots. Document browser-local persistence and reset behavior; do not imply cross-device or real campus persistence.
4. Mark `docs/UX_SPEC.md` as superseded where it conflicts with the approved `docs/UI_UX.md` and `docs/DESIGN_SYSTEM.md`. Preserve useful screen-flow ideas.
5. Remove hardcoded claims such as “85% confidence,” “94/100 fairness,” “+18% utilization,” or “95% evaluator score” unless they are measured from actual app behavior. The evaluator has no published weight formula.
6. Update stale Gemini 1.5 / old SDK references. Verify the current official Google AI SDK and a supported fast model when implementing Stage 2. Keep `GEMINI_MODEL` configurable.

## Existing architecture to preserve

The repo already has npm workspaces: `shared/`, `server/`, and `client/`. Keep this architecture unless an actual build blocker makes it impossible; do not migrate to Next.js or add a second app/server. The intended current stack is strict TypeScript, Node 22, Express 4, Zod, React 18, Vite, React Router, Tailwind 3, and Vitest. First compare this list with the actual manifests and lockfile, then document what is really installed. Do not perform broad dependency upgrades under the deadline.

- `shared/` owns Zod schemas, inferred types, domain constants, and deterministic seed fixtures shared by both apps.
- `server/` owns Express routes, thin services/adapters, pure scheduling logic, and server-only Gemini integration in Stage 2.
- `client/` owns the React SPA and the approved design system.
- In production, build the Vite app and have the existing Express service serve `client/dist` plus SPA route fallback, so one public Cloud Run service serves UI and `/api/v1/*`. Keep the Vite development proxy pointed at the API. Do not introduce a second deployment unless a concrete repo blocker requires it.
- Preserve the existing health path `/api/v1/healthz`; keep all new API routes under `/api/v1`.
- Reuse the configured Vitest and Supertest setup. Add only missing focused client testing dependencies if needed and if justified. The current placeholder `lint` scripts are not evidence of linting; replace them with a real configured lint check only if it can be added safely and quickly.
- Verify whether a root `package-lock.json` exists. If absent, create one from the existing workspaces when dependencies are installed; never hand-edit it.
- Keep `.env.example`, strict TS, and root build/typecheck/test scripts aligned with the real monorepo. Use `@google/genai` only if Stage 2 verifies the current official SDK; remove the old SDK only as part of that deliberate change.

Every added dependency needs a one-line reason in the `docs/TRD.md` dependency table. Do not add Next.js, another frontend build, a UI kit, calendar/chart library, or animation library unless a demonstrated blocker justifies it. Keep the current Express/CORS/security middleware and tighten its configuration rather than duplicating it.

## Contract and data deliverables

Create or update `docs/API_CONTRACT.md`. Use a deliberately small, versioned P0 API rooted at `/api/v1`:

- `GET /api/v1/healthz` (preserve the existing route)
- `GET /api/v1/resources` with static `q`, department, and category/capability filters
- `GET /api/v1/resources/:id`
- `POST /api/v1/resources/:id/availability` with a date window and demo snapshot, so returned availability reflects current browser-local demo state
- `POST /api/v1/ai/match` to produce a proposed, editable request/resource match
- `POST /api/v1/requests` to submit a project-linked request
- `POST /api/v1/requests/query` with the current demo snapshot to filter the browser's synthetic request view
- `POST /api/v1/scheduling/arbitrate` to return a read-only allocation proposal
- `POST /api/v1/scheduling/apply` to apply a selected proposal as pending faculty approval, after revalidation
- `POST /api/v1/faculty/approvals/:id` to approve, reject, or request a reschedule with a reason
- `POST /api/v1/demo/reset` to restore the synthetic scenario

For every route, specify the purpose, request and response schema, validation failures, state effects, and whether it is demo-only. Keep names consistent across docs and code. `POST /api/v1/demo/reset` returns the canonical seed. Treat Cloud Run as stateless: the client owns only the versioned synthetic demo snapshot (persisted in that browser's local storage); endpoints depending on mutable state accept that validated snapshot, and mutations return its updated version. Static catalog reads may remain GET requests. Do not use process memory as the source of truth or claim cross-device persistence.

Audit and evolve the existing `shared/src/schemas.ts`, `types.ts`, and `constants.ts` rather than creating parallel definitions. Define validated types for Department, Lab, DemoUser, Resource, Certification, ProjectRequest, Booking, ApprovalDecision, ConflictRequest, PriorityBreakdown, AllocationProposal, AlternativeSlot, and DemoScenario. Remove academic seniority from any priority breakdown. Use ISO timestamps; state the campus timezone as `Asia/Kolkata`; use half-open booking intervals `[start,end)`.

Seed a small, believable dataset: 3 departments, 8–12 resources, 4 synthetic students, 1–2 faculty/admin demo personas, safety/certification requirements, prior-use hours, and a conflict scenario with one scarce resource and several feasible alternatives. Dates must be relative to an injected/current clock, not stale fixed calendar dates. Seed data must make the demo work after reset with no external API key.

## Documentation deliverables

Update existing docs instead of duplicating them. Keep the following aligned with the frozen contract:

- `README.md`: correct the current aspirational claims to match the actual P0 scope, local run, tests, single-service Cloud Run plan, AI fallback, honest limitations, and PS-to-feature-to-test traceability.
- `docs/PRD.md`: P0 scope, acceptance criteria, and explicit cut list.
- `docs/TRD.md`: selected stack, dependency rationale, and state/deployment plan.
- `docs/WORKFLOWS.md`: discovery/request, conflict/apply/approval, and reset/demo journeys.
- `docs/DATA_MODEL.md`: actual implemented entities and integrity constraints.
- `docs/ARCHITECTURE.md`, `docs/AI_PIPELINE.md`: actual component boundaries, stateless/durable state choice, AI boundary, and fallback.
- `docs/ASSUMPTIONS.md`: one-line assumptions and their status.

## Acceptance gate

- Existing workspaces install/build with strict TypeScript and no secret values; no parallel scaffold or migrated framework has been introduced.
- Contract, schemas, and seed data agree with each other.
- Existing `npm run build`, `npm run typecheck`, and configured scaffold tests pass after any justified script fixes; report actual command output and do not represent placeholder lint scripts as real lint coverage.
- Repository remains on its sole `main` branch; do not push or delete remote branches in this stage.
- No P1 screens or optional operations features have been built.

