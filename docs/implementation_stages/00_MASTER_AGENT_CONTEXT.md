# LabLink Master Context for Coding Agents

**Paste this context before each stage prompt, then paste only that stage's prompt.** This file sets shared rules; the active stage prompt sets the work scope. Follow both.

## Goal and event rules

Build LabLink: a GenAI-assisted campus platform for cross-department equipment discovery, feasible slot booking, project access requests, faculty approvals, and fair conflict recommendations. The public demo should explain the idea in about 60 seconds, with no login and a seeded, zero-typing start.

Follow the official briefing for event rules. It requires a public GitHub repository submitted as a `.git` URL, exactly one branch (`main`), repository size under 10 MB, a working public Cloud Run URL for Top 10 consideration, a short project description, and a LinkedIn post. The six evaluation signals are code quality, security, efficiency, testing, accessibility, and problem alignment; **the briefing gives no numeric weights**. There are at most two scored submissions; the latest completed score is final. A technical retry is only for an evaluation that could not complete. The user's deadline is **5:00 PM Asia/Kolkata**: check the time at each stage, prioritize P0, and preserve a release buffer.

Never invent event rules or evaluator weights. If briefing, user instructions, repo notes, or drafts conflict, follow this order: exact challenge and official briefing; user's explicit instructions (including Swiss minimalism with playful geometry and no emojis); this context and active stage prompt; corrected project docs; older drafts. Record important assumptions and reconcile affected docs.

## Repo and research context

The existing codebase is an npm-workspaces TypeScript monorepo: `shared/` (Zod schemas/types), `server/` (Express), and `client/` (React/Vite/Tailwind). Inspect the live tree and manifests before editing. Extend the current stack; do not migrate to Next.js, add another app/server, or upgrade major dependencies without a concrete blocker. The intended public deployment is one Cloud Run Express service serving the built Vite client and `/api/v1/*` from the same origin.

The market scan found existing lab/equipment scheduling products such as [Agilent iLab](https://www.agilent.com/en/software/lab-management), [Stratocore PPMS](https://www.stratocore.com/), and [Labguru](https://www.labguru.com/equipment). Do not claim basic equipment booking is new. Make LabLink's differentiator demonstrable: student-first cross-department discovery, project-aware and explainable feasible allocation, and a clear faculty decision flow. For fast-changing technology details, verify only what is needed from current official documentation and record the source/decision; avoid generic research that does not affect implementation.

## Read and use the project documents

Before Stage 1, inspect the working tree, branch, root `README.md`, `AGENTS.md`, `CLAUDE.md`, workspace manifests, source/tests, and **every Markdown file under `docs/`**. Use the docs as a connected spec, not as isolated suggestions:

- `PRD.md`: product needs, personas, P0/P1, acceptance and traceability.
- `TRD.md`: actual stack, dependencies, boundaries and deployment; verify against code.
- `WORKFLOWS.md`: student, booking, conflict, faculty and exception journeys.
- `UI_UX.md` + `DESIGN_SYSTEM.md`: approved visual/interaction source; follow the actual tokens and components.
- `UX_SPEC.md`: older storyboard; reuse helpful flow details only where they do not conflict with the approved UI docs.
- `DATA_MODEL.md` + `API_CONTRACT.md`: shared schema, validation and client/server contract.
- `ARCHITECTURE.md` + `AI_PIPELINE.md`: system boundaries, deterministic scheduler, GenAI limits and fallback.
- `ASSUMPTIONS.md`: log decisions that are not confirmed.
- `HACKATHON_RULES.md` + `SUBMISSION_CHECKLIST.md`: event requirements; correct them if they contradict the official briefing.
- `README.md`, `AGENTS.md`, `CLAUDE.md`, and the implementation-stage files: current product claims, repo instructions and execution gates; verify against the live implementation.

If docs disagree, identify the canonical source, fix the affected docs together, and keep them aligned with implemented behavior. Do not blindly repeat stale claims, invented metrics, old SDK instructions, or an architecture that no longer matches the repo.

## Product, algorithm, AI, and UI rules

- **UI matters:** implement the approved Swiss-minimal / playful-geometry system from `UI_UX.md` and `DESIGN_SYSTEM.md`; do not invent a competing visual system. No emojis in the interface or agent deliverables. Use consistent inline SVGs, clear hierarchy, responsive layouts, visible focus, keyboard operation, text-plus-shape statuses, accessible errors/announcements, and reduced-motion behavior. Animation must explain real state changes and never fake work. Prefer an accessible slot list to a calendar that is not fully keyboard-operable.
- A fresh visitor can start the seeded demo without login or typing. Student/faculty role switching is a synthetic demo view, not authentication. Show discovery, real resource details/availability, slot selection, project request, conflict recommendation, and pending faculty approval. A recommendation is not a confirmed booking; preserve accurate loading, empty, error, and success states.
- **Feasibility comes before fairness:** reject incompatible equipment, missing certification, maintenance/unavailable resources, out-of-hours slots, invalid duration/buffer, deadline violations, or overlaps. Use half-open intervals `[start,end)` and campus timezone `Asia/Kolkata`. Among feasible requests, explain deterministic priorities using deadline urgency, recent fair-share use, and waiting time. Never prioritize academic seniority, project labels, or claimed inflexibility. Demo weights are app policy, not organizer rules; do not claim globally optimal scheduling.
- GenAI may turn project text into an editable, schema-validated request draft. The user reviews it. AI must never invent equipment/availability, rank winners, book, apply allocations, or approve. Keep keys server-side, bound inputs, avoid sensitive logs, verify current official SDK/model details, and provide an honest rules fallback.
- Cloud Run is stateless; `max-instances=1` does not make memory durable. Keep only a versioned synthetic scenario in that browser's local storage and make APIs stateless over validated snapshots. State honestly that the demo is browser-local, not real campus or cross-device persistence.

## Execution and quality bar

At every stage: inspect current work first; preserve user changes; implement only the active stage; keep code/docs/contracts aligned; run that stage's real checks, fix failures, and repeat; report evidence without claiming unrun tests or unmeasured metrics. Keep P0 ahead of P1. Make the six evaluation signals easy to verify: strict types and clear modules; validation and secret safety; lean dependencies/assets; focused tests for scheduler/API/AI/workflows; verified keyboard/accessibility behavior; and a README mapping challenge requirements to real features, paths and tests.

Run stages in the order in `docs/implementation_stages/README.md`. Stage 2 and 3 may parallelize only after Stage 1 freezes contracts and only with separate file ownership. Do not skip a stage gate.

Do not delete branches, force-push, rewrite history, change repository visibility, publish LinkedIn, deploy publicly, or submit a scored attempt without the user's explicit authorization. Prepare and verify all independent work first. Because the latest score counts, use attempt one only when the live P0 flow is verified; consider attempt two only after reviewing actual feedback, making a low-risk tested improvement, and getting authorization.

At the end of each stage, report: outcome; changed files/docs; checks actually run and results; whether its acceptance gate passed; real limitations/assumptions; and the safe next-stage handoff.
