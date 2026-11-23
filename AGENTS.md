# LabLink: MASTER CONTEXT
> Save this file in the repo root as `AGENTS.md` (and copy to `CLAUDE.md`). Every agent reads it FIRST. It overrides any default habit.

## 1. Mission
Build **LabLink**: a GenAI-powered campus laboratory resource-sharing platform. Students discover and book specialised equipment, dev kits and lab workstations across departments. Faculty approve. The system optimises utilisation and **resolves scheduling conflicts by recommending fair, feasible allocations** based on project deadlines, availability and student requirements.

Original problem statement (verbatim intent, do not drift): equipment discovery, intelligent slot booking, project-based access requests, faculty approvals, optimised resource utilisation, intelligent conflict resolution with fair and feasible allocation recommendations.

## 2. How we are judged (design every decision around this)
An automated AI evaluator reads the **public GitHub repo** and the **live Cloud Run URL** and scores six things:
1. Code Quality: readable, organised, maintainable.
2. Security: safe inputs, data handling, credentials.
3. Efficiency: smart resource usage, lean dependencies.
4. Testing: evidence that key features work.
5. Accessibility: usable UI, keyboard access, contrast.
6. Problem Statement Alignment: does it solve the actual challenge?

Also: the live URL must work with NO login and convey the idea in under 60 seconds. A dead URL = disqualification. Only the LAST of 2 submissions counts, so `main` must always be deployable.

Because the evaluator is an AI reading files, **make quality legible**: clear folder structure, a README that maps every PS requirement to code and tests, docs/ folder, tests next to what they test, no dead code, no TODO litter, no secrets, meaningful names, short functions, comments only where intent is non-obvious.

## 3. Hard rules
- Do NOT ask questions. Decide, then log the decision in `docs/ASSUMPTIONS.md` (one line each).
- `main` is the only branch. Never create other branches. Commit small and often with conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). `main` must always build and pass tests.
- Repo must stay **under 10 MB**: no binaries, no images over 50 KB, no datasets, no `node_modules`, no build output, no `.env`.
- No secrets in code or git history. Only `.env.example` with placeholder names. Gemini key comes from env (`GEMINI_API_KEY`), in production from Secret Manager.
- The app MUST work if Gemini is down or the key is missing: every AI feature has a deterministic fallback and the UI shows an "AI-assisted / rule-based" badge honestly.
- Lean dependencies. Before adding a package, justify it in one line in `docs/TRD.md` dependency table. Prefer platform APIs and small hand-written components (calendar grid, SVG charts) over libraries.
- Never leave failing tests, lint errors, TypeScript `any` (use `unknown` + narrowing), `console.log` (use the logger), or commented-out code.

## 4. Stack (fixed, do not debate)
- Monorepo with npm workspaces: `shared/` (zod schemas + types + pure domain constants), `server/`, `client/`.
- Language: TypeScript strict everywhere.
- Server: Node 22, Express, zod, helmet, express-rate-limit, compression, pino (logger), `@google/genai` for Gemini. Model id from env `GEMINI_MODEL` (verify the current Flash model id in Google AI docs; do not hardcode a guess).
- Client: React 18, Vite, TypeScript, Tailwind CSS, react-router. No UI kit, no chart lib, no calendar lib.
- Tests: Vitest + supertest (server), Vitest + React Testing Library + vitest-axe (client).
- Data: repository interface with an **in-memory seeded implementation** (Cloud Run is ephemeral, so run `--max-instances=1`). Document the production target (PostgreSQL schema in `docs/DATA_MODEL.md`). The seam is the `Repository` interface so swapping storage touches one folder.
- Auth: demo mode. `DEMO_MODE=true` exposes a role switcher (Student / Faculty / Admin) so judges need no login. Server still enforces role + ownership checks on every route. Auth sits behind an `AuthProvider` interface so SSO can be dropped in (document this).
- Deploy: single container on Google Cloud Run serving API + built client.

## 5. Product pillars (all must be visibly present in the live demo)
1. **Equipment Discovery**: filter by department, category, capability, availability window; plain-language search ("measure a 100 MHz signal") mapped to capabilities by Gemini (schema-constrained), keyword fallback.
2. **Intelligent Slot Booking**: week calendar, live conflict detection, operating hours, buffers, max session length, certification prerequisites, smart "next best slots" suggestions.
3. **Project-Based Access Requests**: a Project owns a bill of equipment (bundle) with a deadline; bundle booking is atomic (all items same window or none). Plain-language intake ("I need an FPGA board and a logic analyser for 6 hours before Dec 12") becomes a validated structured request.
4. **Faculty Approvals**: queue with AI-written brief, conflict badges, one-click approve/reject/request-changes with note, audit trail.
5. **Utilisation Optimisation**: analytics (heatmap, idle hours, top contested resources, cross-department sharing), underused-equipment nudges, auto-release of no-shows, waitlist promotion.
6. **Fair Conflict Resolution (the star)**: deterministic, explainable allocation engine (spec in prompt 02). Gemini only narrates the engine's output; it never decides. Every proposal shows a score breakdown and "why this person got this slot".

## 6. Golden demo flow (polish this above everything else)
Landing page has a prominent **"Run the conflict demo"** button. It seeds a realistic contested scenario: 4 students, overlapping requests for the same scarce resources, different deadlines and usage history. Then the judge is guided: Admin/Faculty opens **Conflict Center** → clicks **Resolve with LabLink** → sees ranked allocations, alternatives (nearest slot, equivalent equipment, split session, waitlist), score bars, plain-language explanation → **Apply** → bookings appear, waitlisted student gets notified, utilisation chart updates. Whole flow under 60 seconds, zero typing.

## 7. Engineering standards
**Structure:** feature-first folders; pure domain logic in `server/src/domain` (no I/O); services orchestrate; routes are thin (validate → call service → respond). Shared zod schemas are the single source of truth for types and validation on both sides.
**Errors:** one typed `AppError` hierarchy, one error middleware, never leak stack traces, consistent JSON `{error:{code,message,details?}}`.
**Security:** helmet with a strict CSP, rate limits (stricter on AI routes), body size limits, zod validation on every input incl. query/params, output encoding via React, prompt-injection hygiene for LLM calls (user text is data inside delimiters, capped length, output must pass a zod schema, no tools, no secrets in prompts), role + ownership checks, audit log for approvals, `npm audit` clean at high/critical, no `dangerouslySetInnerHTML`.
**Efficiency:** O(n log n) interval logic using sorted intervals, no N+1 style repeated scans, memoised selectors, route-level code splitting, gzip, long-cache hashed assets, ETag on GETs, small bundle (target under 200 KB gzipped JS initial).
**Accessibility (WCAG 2.2 AA):** landmarks, skip link, one h1 per page, visible focus, full keyboard operation incl. calendar grid (arrow keys, Enter/Space), aria-live for toasts and async results, labelled form controls, errors linked via aria-describedby, colour never the only signal (icon + text), contrast ≥ 4.5:1 (3:1 for large text/UI), touch targets ≥ 44 px, `prefers-reduced-motion` and `prefers-color-scheme` respected, per-route document titles, `lang="en"`.
**Testing:** `npm test` at root runs everything. Required: engine unit tests incl. invariants (no double booking, determinism, bundle atomicity, deadline respected, fairness ordering), service tests, API tests for every route (happy, validation, authz), AI fallback tests with Gemini mocked, UI tests for key components, axe checks on every page. Coverage reported; domain layer ≥ 90%.
**Docs:** README (what/why, live URL placeholder, architecture diagram, PS-to-code traceability table, how to run/test/deploy, AI usage and fallback, security notes, limitations/roadmap), plus `docs/`.

## 8. Definition of Done (any task)
`npm run lint && npm run typecheck && npm test && npm run build` all pass; no new `any`; docs updated if behaviour changed; committed to `main` with a conventional message.
