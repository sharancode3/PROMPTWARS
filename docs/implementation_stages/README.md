# LabLink Implementation Stages

**Purpose:** Run the build through four bounded, reviewable coding-agent stages. Each stage has its own paste-ready prompt and acceptance gate.

## Repository state at prompt creation

**Repository snapshot checked 23 Nov 2026:** this is already an npm-workspaces TypeScript monorepo with `shared/` (Zod types/schemas), `server/` (Express API and a health route), and `client/` (React 18 + Vite + Tailwind). A basic health test and starter code exist. The prompts below continue this scaffold; they do not create a second app or replace the stack. Re-inspect the live tree before each stage because it may have changed.

## Stage order

Before running any stage, paste [00_MASTER_AGENT_CONTEXT.md](00_MASTER_AGENT_CONTEXT.md) into the coding agent. Then paste only the active stage prompt below. Repeat the master context at each new stage so the agent retains the product, documentation, UI/UX, evaluation, and execution rules.

For the current live-screen redesign, paste [UI_UX_REFINEMENT_PROMPT.md](UI_UX_REFINEMENT_PROMPT.md) by itself as the single task prompt. It directs the agent to read `AGENTS.md` and the project docs, updates Stage 3's layout to the requested desktop sidebar, and adds lab-learning/settings/insights while preserving existing API and scheduler boundaries.

| Stage | Prompt file | Combines | Gate before proceeding |
| --- | --- | --- | --- |
| 1. Foundation and contract | [01_FOUNDATION_AND_CONTRACT.md](01_FOUNDATION_AND_CONTRACT.md) | Existing-repo audit, source-of-truth cleanup, scope lock, shared schemas, API contract, demo scenario | Existing monorepo builds; contract and assumptions are frozen; no unresolved requirement conflicts |
| 2. Backend, scheduler, and GenAI | [02_BACKEND_SCHEDULER_AI.md](02_BACKEND_SCHEDULER_AI.md) | Domain model, deterministic allocation, APIs, storage strategy, Gemini parsing, backend tests | Feasibility invariants and API checks pass; AI fallback works |
| 3. Frontend and signature flow | [03_FRONTEND_UX.md](03_FRONTEND_UX.md) | Swiss-grid UI, user workflows, state logic, motion, accessibility, client integration | Fresh demo scenario works across student and faculty views on desktop and mobile |
| 4. Integration and release | [04_INTEGRATION_HARDEN_RELEASE.md](04_INTEGRATION_HARDEN_RELEASE.md) | Full audit, testing, security, Cloud Run, submission pack, attempt strategy | Live public smoke flow passes; repo and submission gates are verified |

### Logical implementation workstreams

The project has seven logical workstreams: (1) requirements and repository audit, (2) source-of-truth reconciliation and architecture, (3) scaffold/contracts/data, (4) backend scheduling and storage, (5) GenAI and fallback, (6) frontend interaction and visual system, and (7) integration, evaluator checks, deployment, and submission. They are grouped into the four prompts above to reduce handoffs while keeping each acceptance gate clear.

## Efficient execution

- Run Stage 1 first. Its API contract is the boundary for the rest of the work.
- With one coding agent, run all prompts sequentially.
- With separate agents, Stage 2 and Stage 3 may work in parallel only after Stage 1 passes. Keep backend edits in `server/` and shared contracts in `shared/`; keep frontend edits in `client/`. Stage 3 must use the frozen contract and typed fixtures while Stage 2 is in progress. Stage 4 has one integrator reconcile and verify everything.
- Never create extra Git branches. Do not delete a branch or force-push to satisfy the one-branch rule; inspect and surface any unexpected branch state for the user.
- Recalculate the actual time remaining to **5:00 PM Asia/Kolkata** at each stage. Suggested targets: Stage 1 15 minutes, Stage 2 45 minutes, Stage 3 55 minutes, Stage 4 45 minutes, with the remainder held for deployment issues and the final attempt decision. Cut P1 work before shortening the verification or deployment buffer.

## Authority and research notes

Use this order when instructions disagree:

1. The exact LabLink problem statement and the organizer briefing.
2. The user's explicit constraints: the 5:00 PM IST deadline, public no-login demo, existing repository, and Swiss minimalism with playful geometry.
3. These implementation-stage prompts.
4. Current project documents, after correcting conflicts below.
5. The five Claude files, as design proposals rather than binding organizer rules.

Important corrections the implementation agent must preserve:

- The briefing names six evaluation signals but publishes no numeric weights. Remove or clearly mark any pie-chart percentages as unsupported; never present them as official.
- The challenge does not grant priority by academic seniority or project label. Use feasibility first, then an explicit and explainable policy based on deadline urgency, fair-share history, and request age. Mark chosen weights as a demo policy, not organizer policy.
- Cloud Run service instances are stateless and may restart or scale. `max-instances=1` does not make process memory durable. For this synthetic public demo, keep the versioned scenario in that browser's local storage and make the API compute statelessly from validated scenario snapshots; document that data is browser-local and resettable.
- `docs/UI_UX.md` and `docs/DESIGN_SYSTEM.md` are the chosen visual direction. `docs/UX_SPEC.md` is an older storyboard; reconcile it without replacing the approved Swiss-minimal / playful-geometry system.
- Replace stale model/SDK examples such as Gemini 1.5 with a currently supported model and SDK verified from official Google AI documentation at implementation time. Keep the model name configurable.
- Do not ship fabricated confidence, utilization, fairness, or saved-hours metrics. Derive displayed values from the seeded scenario and engine output.
- Existing products such as iLab, PPMS, and Labguru already provide lab/equipment scheduling. Present LabLink's student-first, explainable project-to-allocation flow as its hackathon differentiator; do not claim that basic booking is unprecedented.

## Shared stage loop

Every prompt must be followed literally: inspect current state, implement only that stage, run its acceptance checks, fix and repeat, update the relevant docs, then report evidence and blockers. Keep the sole `main` branch buildable. Do not claim a test or deployment check passed unless it was actually run.

