# LabLink UI/UX Refinement Prompt

## Goal

Refine the existing LabLink app using the current screen at `http://localhost:8080/discover` as the starting point. The current page is functional, but the horizontal navigation, top demo banner, role controls, user details, theme text button, and content compete for space. Rework the experience into a spacious, polished laboratory platform with a persistent left sidebar, clear page hierarchy, useful lab-specific content, and purposeful visualizations.

This is an implementation task. Inspect the current app, then edit and verify it. Do not return only a plan or mockup.

## Read these instructions first

1. Follow the root `AGENTS.md` and `CLAUDE.md`, the user’s LabLink problem statement, and this prompt. The official briefing controls event rules; never invent judging weights.
2. Inspect the current code, tests, package scripts, and state/API behavior before changing anything. In particular inspect `client/src/App.tsx`, `components/common/Header.tsx`, `pages/DiscoverPage.tsx`, `context/ScenarioContext.tsx`, `api/client.ts`, `shared/src`, and the existing server routes.
3. Read and use the project docs: `docs/PRD.md`, `TRD.md`, `WORKFLOWS.md`, `UI_UX.md`, `DESIGN_SYSTEM.md`, `UX_SPEC.md`, `DATA_MODEL.md`, `API_CONTRACT.md`, `ARCHITECTURE.md`, `AI_PIPELINE.md`, `ASSUMPTIONS.md`, `HACKATHON_RULES.md`, and `SUBMISSION_CHECKLIST.md`. Keep them consistent with the implemented app. `UI_UX.md` and `DESIGN_SYSTEM.md` define the visual identity; the user’s explicit request in this prompt updates the navigation layout from top navigation to a left sidebar.
4. Use the existing npm-workspaces stack: React 18, Vite, React Router, Tailwind, Express, shared TypeScript/Zod schemas, and current seeded scenario. Do not migrate frameworks, add a new database, install a chart/UI/animation library, or build a real campus-auth system for this refinement.
5. If the app is already running, inspect that instance; do not start a duplicate server. Do not ask questions. Record necessary assumptions in `docs/ASSUMPTIONS.md`.

## Product rules that must remain true

LabLink helps students discover cross-department laboratory equipment, choose feasible slots, submit project requests, see explainable conflict recommendations, and follow faculty approvals. The zero-login role switch is synthetic demo state, not authentication.

Use the existing scenario and API/scheduler for operational facts. **Do not generate availability in the UI from guessed time windows.** In particular, replace the ad hoc sample-slot generator in Discover if it does not use current bookings, requests, maintenance, operating hours, buffers, certifications, and the scheduler’s rules. No slot may be called available unless the real app logic says it is feasible. A recommendation remains pending until faculty approval.

Demo data is acceptable and useful, but it must be explicitly labelled as a synthetic/illustrative demo dataset, never presented as a real campus inventory. Search results, counts, statuses, charts, and utilization must be computed from the seed scenario or actual API response. Do not hard-code impressive-looking percentages, confidence scores, savings, or utilization values.

Keep the scheduler deterministic and faculty approval authoritative. GenAI may help interpret a project or summarize provided learning notes, but must not invent resources or availability, decide priority, allocate a slot, or approve access. Any local/context-aware guide must cite the seeded note or resource it used and clearly identify itself as a demo/reference-based assistant. Do not pretend a local model is running when it is not. Do not add a complex model backend for this UI task.

## Required experience and information architecture

### 1. Spacious desktop shell with a real left sidebar

Replace the current horizontal page navigation with a persistent left sidebar on desktop. The sidebar is the primary navigation. Keep the top bar compact and limited to the current page/context, accessible role selector, and global theme control; do not put all routes back into a crowded top row. Move the evaluator-mode explanation into a small, calm demo-status label. Remove the constant “evaluation signal” claim from the UI.

Use a measured layout: fixed sidebar around 240–280px (collapsible to an icon rail if quick and accessible), readable main content width, generous page gutters and vertical rhythm, clear section headers, and consistent card/table padding. Avoid both dense cramped rows and oversized empty whitespace. Keep the Swiss grid/hairline look without turning every item into a bordered box.

Desktop sidebar should include:
- Overview
- Discover
- Labs
- Requests
- Bookings
- Conflict Center
- Faculty Approvals (visible/usable in the Faculty demo role)
- Knowledge Library
- Insights
- Settings

Use concise labels and custom inline SVG icons that belong to the existing geometry system. Indicate the active route clearly with text and a non-color cue. The demo role selector must remain easy for judges to find, but should not consume the whole header. Keep current user/department context available without forcing it into every page header.

On narrow screens, convert the sidebar to an accessible left drawer opened by a compact menu button. The drawer must close after navigation and on Escape, manage focus, and not obscure the current page when closed. Keep primary actions reachable at 320px; no horizontal page scrolling. Do not make a dense horizontal navigation bar the mobile fallback.

### 2. Settings and theme

Create a real `/settings` page for demo and appearance options. Move **Reset Seed Data** out of the global top banner into a clearly labelled demo-data section in Settings. Reset must require a confirmation step, restore the canonical seed scenario, announce completion, and preserve theme/preferences. Do not silently reset on navigation.

Replace the text-only DARK/LIGHT control with one reusable, accessible inline-SVG theme toggle: the same SVG component changes its sun/moon geometry for the active theme, has an accurate accessible label, works by keyboard, and persists the user's choice across reloads. Support the documented light and dark tokens in `docs/DESIGN_SYSTEM.md`; light remains the default. Avoid duplicate theme controls with conflicting state.

Settings may also include the current synthetic role, campus timezone, reduced-motion preference (respect OS preference by default), and a clearly labelled AI mode/status. Keep all controls functional and small. Never place API keys or secrets in settings or browser storage.

### 3. Labs, resource detail, and learning library

Add a useful Labs directory and lab detail view, reusing existing resource data. Each lab should show only seeded/known information:
- Department, building/room, operating hours, lab contact/persona, access prerequisites, capabilities, and equipment located there.
- Resource cards/details with real seeded specs, maintenance/availability state, required certifications, buffer/max session, and a clear next action.
- A lab-specific “Learn and prepare” area containing a small curated set of materials: lecture notes, approved demo SOP/checklists, and optional video links for relevant equipment/lab topics.

Extend `shared/src` seed data and Zod schemas only where needed, rather than embedding separate fake records inside React components. Use distinct sample labs across the existing departments and add a Chemistry/Bio lab only if it fits the current schema/seed structure cleanly. Give every material a title, type, lab/resource tags, short description, source, and optional verified URL. Never fabricate external video URLs or claim demo notes are official campus documents. Mark synthetic examples as demo materials. If a public link is added, verify it opens and identify its source; otherwise use a local demo note without a link.

Seed at least two labs with useful learning materials, including verified video references where practical and local lecture-note/SOP examples for others. Include a chemistry note-summary example grounded in seeded safety/learning notes with visible references. Keep all sample materials short and clearly marked as demo content.

Add a Knowledge Library page with search/filter by lab, equipment, topic, and material type. It should work from the seeded materials with no external service. A compact “Lab Guide” can use the selected lab/resource, the current request context, and matching seed notes to return a short answer with visible source references. Label its actual mode honestly (for example, “Reference-based demo assistant”). For chemistry or hazardous-lab content, do not invent handling instructions: cite the approved demo safety note and direct users to the lab coordinator/faculty for authoritative procedure.

### 4. Complete user journeys and useful sections

Preserve and improve the current routes and interactions. Add routes only when they provide a complete, usable section:
- **Overview:** clear product proposition, “Run conflict demo” primary action, quick links, a small snapshot of seeded resource/request state, and one informative SVG visualization.
- **Discover:** spacious search and filter controls for department, category, capability, availability, and certification; result count derived from filtered data; cards with consistent spec hierarchy; accessible detail/slot selector connected to actual availability logic.
- **Labs:** browse labs and open details/associated assets/materials.
- **Requests:** project-based multi-resource request, deadline, duration, slot and prerequisite validation. Preserve bundle atomicity; all requested items succeed together or none do. If missing, implement the smallest deterministic shared validation/all-or-nothing operation without adding a database.
- **Bookings:** upcoming/past synthetic booking states and clear pending/confirmed/cancelled labels; never imply a pending request is confirmed.
- **Conflict Center:** preserve the golden 4-student seeded conflict flow, show actual policy factors and feasible alternatives, explain the choice plainly, and keep faculty approval as the final step.
- **Approvals:** role-aware review queue with project/resources/deadline/prerequisites, a concise summary derived from the request (use the real AI response when available or label it rule-based), explanation, approve/reject/request-changes, required note where needed, and accurate status updates.
- **Insights/Admin:** small useful charts computed from the demo scenario: resource utilization by lab, weekly busy/available periods, cross-department sharing, contested and underused resources. Include the time range and simple formula/source. Show an underused-equipment nudge when the seed supports it. Include a clearly labelled demo recovery action that can release a seeded no-show slot and promote a waitlisted request through existing scenario state; do not build a scheduler/cron service. If the seed has insufficient data, show an honest empty state rather than invented values.
- **Knowledge Library** and **Settings** as described above.

Do not add unnecessary backend endpoints. Reuse existing API/context and the typed seed scenario. Prefer small pure selectors for counts, availability summaries, material search, and chart inputs. If a route requires missing behavior, add the smallest typed, validated change in the existing server/shared architecture and cover it with a focused test. Do not implement SSO, a database, local-model hosting, notifications, QR passes, or unrelated infrastructure in this task.

## Visual language, SVGs, charts, and motion

Follow the real tokens and component rules from `docs/DESIGN_SYSTEM.md`: light paper `#FAFAF7`, ink `#0A0A0A`, existing signal/cobalt/forest/amber semantics, hairline rules, zero-radius containers, typography hierarchy, and responsive Swiss grid. Update `docs/UI_UX.md` to record the user-requested sidebar and any real route/layout changes; preserve the existing brand character.

Create/reuse a small typed inline SVG icon/primitive set for navigation and lab/resource categories. Add purposeful, data-bound visual elements such as:
- An SVG lab/location diagram or geometric lab identity mark.
- A conflict timeline and alternative-slot path.
- A weekly availability strip/slot matrix.
- An accessible utilization heatmap or compact bar chart with labels and a text/table equivalent.
- Small learning-material type marks and capability glyphs.

Visuals must explain real app data. Give non-decorative SVGs a title/description; mark purely decorative SVGs hidden from assistive technology. No raster illustrations, emoji, remote icon fonts, gradients, heavy shadows, or chart library. Do not draw charts that imply measurements the seed does not contain.

Some older docs show Unicode symbols as icon examples. Treat them as meaning references only; render actual icons and statuses through shared SVG components, never as emoji or standalone text glyphs.

Use restrained transitions for sidebar open/collapse, route change, filter selection, detail panel, theme change, and conflict resolution. Motion must communicate a real state change, use the existing CSS/WAAPI approach, and obey `prefers-reduced-motion`; no fake processing delay or continuously moving decoration. Keep the product calm and institutional, with playful geometry used to clarify labs, capabilities, status, and allocation.

## Implementation loop

1. Inspect current code/docs/state and identify the smallest set of files required. Preserve existing functionality and user changes.
2. Refactor the app shell/sidebar first, then theme/settings, then lab/material seed data and screens, then data-driven visuals. Keep existing student-to-faculty demo working throughout.
   If the remaining hackathon window is tight, complete the sidebar, Settings/theme/reset, spacious Discover, and all existing booking/conflict/approval flows first. Then add working Labs/Knowledge sections and data-derived Insights. Never leave a navigation link pointing to an empty or placeholder screen.
3. Add/update shared schemas and tests only for actual new data/logic. Keep components focused, typed, and reusable; avoid `any`, dead routes, placeholders, dummy buttons, and console logging.
4. Run the app if it is not already running. Visually inspect `/discover`, overview, Labs, Settings, Conflict Center, and Approvals at desktop and mobile sizes. Test sidebar keyboard behavior, theme persistence, reset confirmation, filters, slot selection, request-to-approval state, and the no-AI fallback.
5. Run the applicable existing checks: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. If a script is only a placeholder, report that honestly; do not claim it verifies linting. Fix failures and repeat affected checks.
6. Update `README.md`, `docs/UI_UX.md`, `docs/WORKFLOWS.md`, and data/API docs only where behavior/schema actually changed. Record assumptions and known limitations.

## Acceptance gate

Finish only when:
- Desktop uses a true left sidebar as primary navigation; mobile navigation is usable and accessible.
- Discover no longer feels cramped and no longer labels guessed windows as available.
- Settings contains the confirmed reset and working persistent theme preference; the theme icon is one reusable inline SVG control.
- Labs and Knowledge Library display useful, clearly labelled seeded content; the context-aware guide answers from cited notes without pretending an unavailable model is running.
- Overview/Insights visuals are calculated from seeded data and labelled demo data.
- Existing discovery, request, conflict, faculty approval, and reset flows still work without an external AI key.
- No fake real-world inventory/metrics, unsupported AI claims, emoji, broken navigation, keyboard traps, horizontal overflow, or misleading booking states remain.
- Build, types, relevant tests, and manual visual/keyboard checks are reported with actual results.

Do not deploy, push, publish, or submit a scored attempt as part of this UI task. Follow `AGENTS.md` for branch and commit discipline.
