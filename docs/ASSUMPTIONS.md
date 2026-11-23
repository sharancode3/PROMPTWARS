# Architecture & Product Assumptions Log
## Project: LabLink — Campus Laboratory Resource-Sharing Platform
**Rule:** Log every autonomous design and implementation decision in one clear line.

---

1. **Monorepo Architecture**: Decided on npm workspaces with `shared/`, `server/`, and `client/` for unified type-safety and single Docker container deployment.
2. **Design Language**: Swiss Minimalism x Playful Geometry (`05_UI_UX_SYSTEM.md`) takes precedence over all previous styling drafts. Light theme (`#FAFAF7`) is hero default with full dark theme support (`#0A0A0A`).
3. **No External Icon Libraries**: Strictly zero emojis and zero external icon libraries (lucide/fontawesome) in final bundle — all custom inline SVG components with square caps and 1.5px strokes to maintain <10MB repo footprint.
4. **Font Stack**: Display and body typography utilizes local/system neo-grotesk font stack with tabular monospace for numbers to ensure zero external font CDN dependencies and 100% offline functionality.
5. **Deterministic Allocation Seam**: The scheduling allocation engine is 100% deterministic and written in pure domain logic (`server/src/domain`); GenAI is strictly utilized for intake parsing, conflict explanation, and faculty briefs.
6. **Stateless Cloud Run & Client-Snapshot State**: State management uses browser-local versioned scenario snapshots (`localStorage`) passed to stateless Express API endpoints for instant Cloud Run cold starts and zero container persistence fragility; PostgreSQL production target schema documented in `docs/DATA_MODEL.md`.
7. **Demo Authentication**: Evaluator demo mode operates without passwords or SSO walls via an explicit top-bar role switcher (Student, Faculty, Lab Admin), while retaining role authorization checks on all API routes.
8. **AI Fallback Guarantee**: If `GEMINI_API_KEY` is absent or rate-limited, the system falls back to a deterministic rule-based inverted-index heuristic matcher without throwing errors or failing evaluation.
9. **Timezone Baseline**: Display default formatted in 24-hour time in Asia/Kolkata (`en-IN`) while storing timestamps in ISO 8601 UTC with half-open intervals `[start, end)`.
10. **Single Branch Constraint**: All development committed directly to `main` with conventional commit prefixes (`feat:`, `fix:`, `test:`, `docs:`, `chore:`); zero secondary branches created.
11. **Objective Fairness Policy**: Academic seniority and subjective status labels are excluded; priority evaluation strictly enforces hard feasibility first, followed by transparent demo weights: deadline urgency (40%), scarce resource fair-share (30%), waiting time (20%), and requirement fit (10%).
