# Stage 3 Prompt: Frontend, UX Logic, Motion, and Accessibility

Run after Stage 1 has frozen schemas and API contract. If this stage runs in parallel with Stage 2, work only on frontend components, styles, and client API adapters. Use typed fixtures until the backend passes its gate; do not change shared API schemas to fit a mock.

---

## Role and objective

Build the evaluator-facing LabLink experience inside the existing `client/` React 18 + Vite + React Router + Tailwind workspace. Keep the Express API in `server/` and shared Zod contracts in `shared/`; do not migrate to Next.js or add another UI framework. Make the core scenario clear and usable in under 60 seconds from a fresh public visit, with no login and no typing required to start the demo.

Read `docs/implementation_stages/README.md`, `01_FOUNDATION_AND_CONTRACT.md`, `docs/UI_UX.md`, `docs/DESIGN_SYSTEM.md`, `docs/WORKFLOWS.md`, `docs/PRD.md`, and the frozen `docs/API_CONTRACT.md`. Treat `docs/UX_SPEC.md` as a prior storyboard where it conflicts with the approved design docs or this P0 scope.

## Stage loop

1. Inspect existing `client/src/` routes/components/styles, `shared/` contract types, Vite config/proxy, and user changes.
2. Build the prioritized screens and shared components in the order below.
3. Connect typed API calls under `/api/v1` or typed fixtures; add explicit loading/error/empty/fallback states. Keep API base configuration same-origin in production and use the existing Vite proxy for local development.
4. Run frontend build, typecheck, core component tests, and keyboard/a11y checks. Fix and repeat.
5. Update `docs/UI_UX.md` only if the implemented behavior changes the spec; report the flow, checks, and unimplemented P1 items.

## P0 screens and behavior

Build the following compact route set. Fold less important content into panels or summaries instead of producing dead-end routes.

### 01 — Home / demo start

- Show the LabLink value proposition in one line.
- Provide the primary `Run the conflict demo` action. One click loads the deterministic seeded scenario and opens Conflict Center.
- Keep the `Demo mode — no login required` notice visible.
- Keep the Student / Faculty / Lab Admin demo-role switch visible and keyboard-operable. Preserve request and scenario state across role changes without reload.
- Store only the versioned synthetic demo snapshot in browser local storage so the same browser can move through student and faculty steps while Cloud Run remains stateless. Validate/parse it with the shared schema when loading; on invalid or old data, offer reset to the canonical seed. Never put credentials or real student information in local storage.
- Provide reset to restore the seed; announce success to assistive technology.

### 02 — Discover resources

- Search by resource name, capability, or natural-language project need; filter by department, category, availability window, and prerequisite status.
- Resource cards show real seeded specs, location/department, availability state, certifications required, and the next feasible slot where available.
- Provide a resource detail or focused detail panel with a keyboard-accessible list of feasible slots. Selecting a slot should populate the project request; clearly distinguish a proposed slot from a confirmed booking.
- Pair every status with a visible text label and a shape; never encode state by color alone.
- Search must return the actual resource IDs from the API/fixture. Do not invent matching assets or confidence percentages.

### 03 — Project access request

- Collect project title/description, deadline, required equipment/capability, duration, requested window, and short justification.
- Make required fields, valid deadline, duration, and selected slot clear; do not require typing an equipment ID or an account.
- If GenAI is configured, display an editable draft with fields requiring review. If fallback runs, label it `Rule-based` and preserve the same editable flow.
- Show missing certification, deadline, and availability issues before submission. Keep input after validation errors.
- After submission, show a visible pending-faculty state and any alternative slot options.

### 04 — Conflict Center (signature path)

- Show the four seeded synthetic requests, contested resource, deadlines, available windows, prior-use values, and prerequisite status.
- `Resolve conflict` calls the deterministic engine. Display the assigned option, up to three alternatives, and labelled factor bars for deadline urgency, fair share, and waiting time. Explain how hard constraints were applied.
- Do not show the draft's academic-seniority score or fabricated fairness/utilization values. Compute before/after numbers from scenario data.
- `Apply allocation` creates a pending faculty decision, not a final confirmed booking. Explain that faculty approval is still required.

### 05 — Faculty approval queue

- Show the pending request, matched equipment, deadline, prerequisites, feasibility, allocation reasons, and student-provided justification.
- Provide approve, reject, and request-reschedule actions. Require a clear reason for reject/reschedule. Update the request state and status glyph immediately after a successful API response; preserve or roll back UI state on errors.
- The public demo role switch is a synthetic view selector only, not real campus authentication.

Show booking status and the utilization summary on the request/conflict result rather than building a separate analytics suite before P0 works. Full booking history, elaborate analytics, QR passes, and extra routes are P1.

## Visual system and components

Use `docs/DESIGN_SYSTEM.md` and `docs/UI_UX.md` as the source for:

- paper-first light theme, ink/Signal Red/Cobalt tokens, one-pixel hairlines, zero-radius containers, Swiss grid, tabular numerals, inline SVG geometry, and responsive rail layout;
- custom SVG icons and geometry; no emoji, external icon CDN, heavy raster assets, gradients, or third-party motion package;
- explicit focus styling, 44–48 px interaction targets, semantic statuses, visible labels, and text alternatives.

Build only components needed by P0: AppShell, DemoRoleSwitch, Button, FormField, StatusGlyph, ResourceCard, SlotOption, RequestSummary, ScoreBreakdown, AlternativeList, ApprovalActions, Toast/LiveRegion, LoadingState, EmptyState, ErrorState, and ResetControl. Reuse shared styles and tokens; avoid arbitrary per-component colors.

## Motion and interaction logic

Use the four visual beats from the approved conflict choreography: highlight the contested request, reveal actual score factors, reorder ranked proposals, and move the selected allocation/alternative into its result position. Use CSS or WAAPI only. Motion explains a state change; it must not fake asynchronous work or block the result behind an artificial delay.

Respect `prefers-reduced-motion`: present final state immediately or use a short opacity change. Animate only when the state changes; never animate continuously. Keep the button and status labels accurate if an API call fails or returns no feasible slot.

## Accessibility and responsive behavior

- Use semantic landmarks, one meaningful page heading, visible labels, and accessible names.
- Keyboard users can reach every action in logical order; dialogs close on Escape and restore focus.
- Provide visible focus, status text plus shape, `aria-live` for async completion/errors, and inline errors tied to controls.
- Ensure content reflows at 320 px with no horizontal page scroll; test key views on narrow and wide layouts.
- Maintain the contrast targets documented in `docs/DESIGN_SYSTEM.md`; do not claim WCAG compliance without checking the implemented colors and states.
- Do not introduce a custom week-calendar grid unless its full keyboard interaction is complete. An accessible slot list/matrix is preferred for P0.

## Acceptance gate

- Fresh-session, zero-typing demo start reaches conflict results.
- Search, request, conflict result, faculty decision, and reset all have working success and failure states.
- Student/faculty role switching preserves synthetic state.
- No fabricated metrics, phantom availability, or AI claims appear.
- Core frontend tests/build/typecheck pass; keyboard path and responsive layout are checked and findings recorded.

