# LabLink Master Context for Coding Agents

**Use this before every stage prompt.** Paste this entire file first, then paste exactly one stage prompt from this folder. The stage prompt defines the work for that run; this context defines the product, evidence, quality bar, and rules that apply throughout. Read it again if the repo or task has changed.

## Mission

Build LabLink, a GenAI-assisted campus laboratory resource-sharing platform. Students need to discover specialized equipment, development kits, and workstations across departments; find feasible slots; submit project-based access requests; and receive faculty decisions. When requests compete, LabLink should recommend fair, feasible allocations based on deadlines, availability, and student requirements while using resources well.

The aim is a convincing, useful, trustworthy hackathon submission. Make quality visible in the live app, source structure, tests, and documentation. Do not claim that a feature, metric, deployment, score, or test exists unless it is implemented and verified.

## What the team has established

- The challenge requires equipment discovery, intelligent slot booking, project requests, faculty approval, better resource utilization, and fair conflict recommendations.
- The public evaluator experience must be login-free and understandable in roughly 60 seconds. A zero-typing seeded demo should show the product's main value immediately.
- The user chose **Swiss minimalism with playful geometry** and places high importance on UI/UX quality. The interface must be polished, useful, accessible, responsive, and faithful to the approved design documents.
- The event briefing lists six evaluation signals: code quality, security, efficiency, testing, accessibility, and problem alignment. It does not publish numeric weights. Never invent official percentages or promise a score.
- The briefing requires a public GitHub repository submitted with the `.git` URL, exactly one branch (`main`), repository size under 10 MB, a working public Cloud Run URL for Top 10 consideration, a short project description, and a LinkedIn post. There are at most two scored attempts; the **latest completed score is final**. A technical retry applies only when evaluation could not complete. Verify any event detail against the supplied briefing and `docs/HACKATHON_RULES.md` before submission.
- The challenge deadline supplied by the user is **5:00 PM Asia/Kolkata**. At the start of each stage, check the actual remaining time, prioritize P0, and keep a real verification/deployment buffer.
- The repo already contains an npm-workspaces TypeScript scaffold: `shared/` for shared schemas/types, `server/` for Express, and `client/` for React/Vite. Confirm the live tree and package manifests before editing. Extend this scaffold; do not migrate to Next.js or create another app/server without proving a concrete blocker.

## Product and research context

The market scan found that laboratory equipment and facility scheduling already exist in products such as [Agilent iLab](https://www.agilent.com/en/software/lab-management), [Stratocore PPMS](https://www.stratocore.com/), and [Labguru](https://www.labguru.com/). Do **not** claim LabLink is the first equipment-booking platform. Make its hackathon differentiator specific and demonstrable: a student-first cross-department discovery flow that connects a project need to real catalog capabilities, explains feasible conflict recommendations, and carries the proposal into a faculty decision without requiring a campus login.

Use the existing research and project docs first. Do additional research only when it can change an implementation decision or prevent an inaccurate claim. For current libraries, deployment behavior, and GenAI APIs, consult official primary documentation; record the source and the decision in the relevant project doc. Do not spend the limited build window collecting generic market facts.

## Read the repository before acting

At the beginning of each stage, inspect the working tree, current branch, root README, `AGENTS.md`, `CLAUDE.md`, root and workspace package manifests, source, tests, and **every Markdown file under `docs/`**, including previous stage prompts. Treat local instructions as important context, but verify them against the live code and the higher-priority sources below. Do not overwrite uncommitted or unfamiliar work.

Use each document for its intended job:

| Document | How to use it |
| --- | --- |
| `docs/PRD.md` | Product goals, personas, P0/P1 boundaries, acceptance criteria, and traceability. Keep the build focused on the smallest complete challenge-aligned product. Correct obsolete or unsupported claims instead of repeating them. |
| `docs/TRD.md` | Actual stack, dependencies, boundaries, runtime, and deployment plan. Reconcile it with the current npm workspaces and code before adding packages or changing architecture. |
| `docs/WORKFLOWS.md` | Student discovery/request, slot selection, conflict resolution, faculty review, and exception journeys. Implement the transitions and failure states, not just the happy-path screens. |
| `docs/UI_UX.md` and `docs/DESIGN_SYSTEM.md` | Primary approved visual and interaction sources. Read tokens, layout, typography, geometry, component, motion, responsiveness, and accessibility guidance before building or changing UI. |
| `docs/UX_SPEC.md` | Earlier storyboard. Reuse useful flow ideas, but the approved `UI_UX.md` and `DESIGN_SYSTEM.md` take precedence when they differ. |
| `docs/DATA_MODEL.md` and `docs/API_CONTRACT.md` | Shared data vocabulary, invariants, validation, and frontend/backend boundary. Keep code and both documents aligned. |
| `docs/ARCHITECTURE.md` and `docs/TRD.md` | Component boundaries, API/service responsibilities, deployment topology, and security constraints. Update stale topology instead of implementing a second architecture. |
| `docs/AI_PIPELINE.md` | AI input/output boundaries, schema validation, deterministic allocation, and fallback. AI must never invent equipment availability or make booking/approval decisions. |
| `docs/ASSUMPTIONS.md` | Explicit unresolved choices and their status. Add concise assumptions when evidence is unavailable; do not silently turn assumptions into event rules. |
| `docs/HACKATHON_RULES.md` and `docs/SUBMISSION_CHECKLIST.md` | Event requirements and submission evidence. If they conflict with the supplied organizer briefing, the briefing wins; remove unsupported percentages or claims. |
| `README.md` | Evaluator-facing explanation of the product, how to run it, implemented features, evidence, and limitations. Keep it truthful and consistent with the live build. |
| `docs/implementation_stages/README.md` and the stage files | Execution order, scope, acceptance gates, and handoffs. Run the current stage only; do not jump ahead while its gate is failing. |

### Source-of-truth order

When requirements conflict, use this order and record consequential resolutions:

1. Exact challenge statement and the official organizer briefing.
2. The user's explicit instructions, including deadline, public no-login demo, existing repo, visual direction, and no-emoji requirement.
3. This master context and the active stage prompt.
4. Approved product/design/API docs, corrected against the actual repo.
5. Older storyboards, generated drafts, and duplicated agent instructions.

Read every doc; do not blindly obey every sentence. Flag contradictions, fix the canonical doc and its copies together, and record the final decision. In particular, do not retain fabricated judging weights, unsupported confidence/utilization/fairness claims, academic-seniority priority, stale SDK/model instructions, or a claim that Cloud Run process memory is durable.

## Non-negotiable product behavior

### Student and faculty workflows

- A fresh visitor can start the seeded demo without an account, external key, or typing. Explain clearly that role switching is a **synthetic demo view**, not authentication.
- Discovery searches actual seeded resources and capabilities across departments. Resource details show meaningful specifications, lab/location, prerequisites, operating hours, availability, and feasible slot choices.
- Slot selection is explicit and keyboard accessible. A proposal is not a confirmed booking. Submitting a project-linked request creates a visible pending state.
- Conflict resolution displays feasible assignments, alternatives, and understandable reasons. Applying a proposal revalidates it and creates a pending faculty decision.
- Faculty can approve, reject, or request rescheduling; require a reason where appropriate. State changes must be reflected in the student view and remain accurate after refresh/reset.
- Every important flow has honest loading, empty, validation, success, no-feasible-slot, and error states. Preserve form input on recoverable errors.

### Scheduling and fairness

Feasibility is a hard gate before priority. Reject candidates with incompatible capabilities, missing safety certification, maintenance/unavailable status, out-of-hours use, invalid duration/buffer, a deadline violation, or an overlapping booking. Use half-open intervals `[start, end)` so adjacent slots do not collide. Use `Asia/Kolkata` for campus display and compare normalized instants consistently.

Among feasible candidates only, use the transparent demo policy defined in the active scheduler prompt and `docs/AI_PIPELINE.md`. It may consider deadline urgency, prior use of scarce resources, and request waiting time. It must not reward academic seniority, project labels, unsupported status, or claims of inflexibility. Explain score factors in plain language, label all weights as an app/demo policy (never organizer policy), make tie-breaking deterministic, and describe the method as a bounded heuristic rather than a globally optimal solver.

### GenAI boundaries

Use GenAI for a narrow, visible task such as turning a student's project description into an editable equipment/request draft. The user reviews the result before submission. Validate all model output with the shared schema and catalog IDs. Keep the key server-side, cap input/output, set timeouts, avoid logging private text/secrets, and provide a working deterministic rule-based fallback. The scheduler remains deterministic. AI cannot create resources, invent availability, rank winners, apply allocations, or approve access. Verify the supported SDK/model from current official Google documentation at implementation time; keep model configuration out of client code.

### State and deployment

Cloud Run can restart and scale across stateless instances. `max-instances=1` does not make process memory durable. The planned public demo keeps a versioned **synthetic** scenario in that browser's local storage and sends validated snapshots to stateless API operations; document that it is browser-local and not real campus/cross-device persistence. Never put real student data or credentials in this demo state. The production Cloud Run service should serve the built Vite client and Express `/api/v1/*` routes from the same origin, listen on `process.env.PORT`, and allow public evaluator access.

## UI/UX is a product requirement

Do not treat visual polish as decoration after the logic. Read and follow the exact tokens and rules in `docs/UI_UX.md` and `docs/DESIGN_SYSTEM.md` before changing components. Preserve the chosen Swiss grid and playful geometry, paper/ink palette, restrained signal color, typography, hairline structure, inline geometric SVGs, and responsive layout as defined there. Do not invent a parallel design system or add visual effects that make status or booking logic harder to understand.

- **No emojis anywhere in the interface, navigation, buttons, status labels, notifications, or icon substitutes.** Use consistent inline SVG geometry with accessible names.
- Information hierarchy should help a judge understand the problem, available resources, conflict, recommendation, and pending approval at a glance.
- Every status uses text plus a shape/icon, never color alone. Scores and metrics must be derived from actual seed data and engine output.
- Use clear focus, visible labels, keyboard access, semantic landmarks, accessible async announcements, correct contrast, and `prefers-reduced-motion`. Keep touch targets comfortable and content usable on narrow screens.
- Animation should explain a real state transition (conflict, factor reveal, proposal ordering, allocation result). Never add fake waiting or hide the final result behind motion.
- Prefer an accessible slot list/matrix over an elaborate calendar that cannot be fully operated by keyboard. Do not add charts, analytics, QR passes, or other P1 scope until the full P0 path works.
- Verify the real UI at desktop and mobile sizes and through keyboard-only use. Do not claim WCAG conformance without checking implemented states and contrast.

## Code and evaluator quality bar

Make each official evaluation signal easy to verify from code, tests, docs, and the running app:

1. **Code quality:** keep the existing workspace boundaries; shared Zod schemas are canonical; keep routes thin, domain logic deterministic and testable, names clear, functions focused, types strict, and docs aligned. Avoid parallel implementations, dead code, placeholder screens, ignored errors, unexplained dependencies, and `any` where `unknown` plus validation is appropriate.
2. **Security:** validate every external param/query/body and model response; bound request sizes; keep secrets out of source, browser bundles, logs, prompts, and Git; use safe errors; limit AI calls; make the public demo synthetic-only. A demo-role switch is not authorization.
3. **Efficiency:** prioritize a working P0 over libraries and speculative features. Keep assets/dependencies/build small, avoid duplicate API/model calls and repeated scans, and measure rather than claim performance.
4. **Testing:** add focused tests for scheduling invariants, API validation and mutations, AI fallback, and key workflows. Run the repository's real scripts; distinguish actual lint/tests from placeholder scripts. Report commands and results accurately. Fix failures and rerun the affected checks.
5. **Accessibility:** verify keyboard paths, focus, labels, errors, announcements, responsive reflow, reduced motion, and contrast on the implemented UI, not just in a checklist.
6. **Problem alignment:** map every clause of the challenge to a working feature, source path, and relevant test. Keep the README traceability table accurate.

The organizer has not published weights for these signals. Do not optimize around a made-up score formula or display predicted judge scores.

## Stage execution discipline

For each run, follow this loop:

1. Read this master context and the **entire active stage prompt**. Inspect live repo state, instructions, package scripts, relevant docs, source, tests, branch status, and remaining time to 5:00 PM IST.
2. Summarize the stage's intended outcome and the exact acceptance gate to yourself. Identify dependencies on previous stages and user work before editing.
3. Make the smallest complete change that achieves this stage. Keep unrelated files and prior changes intact. Do not broaden scope to P1 or rewrite working architecture to match a stale document.
4. Keep docs and code in sync. When a requirement changes, update the canonical doc and affected references in the same stage; record any unresolved assumption.
5. Run the checks required by the active stage; inspect the results, fix defects, and repeat failed checks. Never claim checks not run. Do not skip the acceptance gate to rush to the next stage.
6. At stage end, report: files changed; product behavior delivered; relevant doc updates; checks actually run and their results; acceptance items passed/failed; known limitations and decisions; and exact next-stage handoff. If a gate fails, state the blocker and fix it within the stage if time permits.

Use the stage order in `docs/implementation_stages/README.md`:

- **Stage 1 — Foundation and contract:** audit the real repo; reconcile stale/invented requirements; align PRD/TRD/workflows/design/data/architecture docs; complete shared schemas, seed scenario, and versioned API contract; preserve and build the existing workspace scaffold. Gate: buildable repo and one consistent contract.
- **Stage 2 — Backend, scheduler, and GenAI:** implement pure feasibility and transparent deterministic allocation logic, stateless APIs, validation, approvals, and one GenAI draft parser with fallback; test scheduling and state invariants. Gate: no infeasible allocation, deterministic results, AI not required for demo.
- **Stage 3 — Frontend and signature flow:** implement the approved Swiss/playful UI, fast public demo, discovery, accessible slot selection, project request, conflict explanation, approval queue, and responsive/reduced-motion behavior. Gate: complete student-to-faculty scenario works and is understandable quickly.
- **Stage 4 — Integration and release:** join real UI/API, audit all six evaluation signals, run the end-to-end path, measure repository constraints, deploy the public Cloud Run service if authorized, smoke-test it, and prepare accurate submission materials. Gate: verified live flow and submission readiness.

Stage 2 and Stage 3 may run in parallel only after Stage 1 freezes the contracts, and only when file ownership stays separate. Stage 4 owns integration. With one agent, run sequentially.

## Git, deployment, and submission boundaries

- Preserve the user's working tree. Do not delete branches, force-push, rewrite Git history, or change repo visibility to satisfy event constraints. Inspect and report a mismatch; ask before risky cleanup or external changes.
- Keep the repository within event limits and check actual Git-tracked size, branch count, ignored secrets, and public visibility using evidence. Do not assume a local clone is public or meets the size limit.
- Prepare all code, checks, docs, and deployment configuration before an external action. Do not publish a LinkedIn post or submit a scored attempt without the user's explicit authorization.
- Because the latest score is final, use attempt one only after the live URL and critical P0 flow are verified. Consider attempt two only after inspecting actual feedback, making a low-risk improvement, rerunning checks, and obtaining authorization. Never submit merely to test the platform; technical retry is only for evaluation failure before a score completes.
- Do not fabricate a deployed URL, repository status, link, score, test count, metric, or publication status. If credentials or event access are missing, finish all independent work and provide the precise remaining action.

## Required handoff format

At the end of each stage, give a concise evidence-based handoff:

```text
Stage: [number and name]
Outcome: [what now works]
Changed: [key paths]
Docs reconciled: [paths]
Checks: [commands and actual pass/fail]
Acceptance gate: [passed / not passed, with evidence]
Limitations or assumptions: [only real ones]
Next stage: [what it can safely begin]
```

Do not use emojis in the interface or agent-facing deliverables. Keep the product, implementation, and explanation precise, calm, and consistent.
