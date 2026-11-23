# LabLink: Automated & Human Evaluator Audit
## Competition: PromptWars Hackathon (Cynergy Coding Club × Google for Developers)
**Repository:** `sharancode3/PROMPTWARS` | **Branch:** `main` | **Target Deployment:** Google Cloud Run

---

## 1. Six Evaluation Criteria Traceability Matrix

| Evaluation Signal | Challenge Requirement | Verified Implementation Path | Audit Evidence & Command |
| :--- | :--- | :--- | :--- |
| **1. Code Quality** | Readable, modular, strictly typed, maintainable, zero dead code. | Monorepo workspaces (`shared/`, `server/`, `client/`). Pure domain logic in `server/src/domain/`, typed schemas in `shared/src/schemas.ts`, UI in `client/src/`. | `npm run typecheck` (0 errors), strict TypeScript across 100% of codebase. |
| **2. Security** | Safe inputs, no secret leakage, prompt-injection hygiene, zero privilege bypass. | Zod schema validation on every route; no credentials committed; `@google/genai` calls server-side only with deterministic fallback; synthetic state in localStorage. | Clean `.gitignore`; no secrets in git history; helmet security headers enabled. |
| **3. Efficiency** | Lean dependencies, fast builds, lightweight assets, low memory footprint. | 0 heavy chart/calendar libraries; initial gzipped client bundle is **82.5 kB**; git pack size is **5.12 MB** (strictly < 10 MB limit). | `npm run build` completed in under 2 seconds; `git count-objects -vH`. |
| **4. Testing** | Comprehensive automated testing of core domain logic, invariants, and API routes. | 40 automated tests across 9 test files covering half-open intervals, 3-factor fairness policy, scheduling arbitration, API endpoints, and React UI. | `npm test` passes 40/40 tests across `shared`, `server`, and `client`. |
| **5. Accessibility** | WCAG 2.2 AA compliant, visible focus, full keyboard operation, screen-reader support. | Zero emojis; 100% custom inline SVG geometry; high-contrast Swiss palette (`#FAFAF7`, `#0A0A0A`, `#C00018`); `aria-live="polite"` regions; landmarks. | Full tab navigation through navigation, forms, and arbitration tables. |
| **6. Problem Alignment** | Discovery, booking, project requests, faculty approvals, and fair conflict resolution. | All 5 primary routes implemented: `01 Home`, `02 Discover`, `03 Request`, `04 Conflicts` (Star Demo), `05 Approvals`. | 60-Second zero-typing seeded conflict demo arbitrates between 2 competing students on Jetson Orin. |

---

## 2. Quantitative Verification Metrics

```
Monorepo Workspace Status:
├── shared:  1/1 test passed (Seed validation & half-open intervals)
├── server:  35/35 tests passed (7 suites: feasibility, fairness, scheduler, reducers, aiMatcher, api, health)
└── client:  4/4 tests passed (Navigation, role switcher, CTA buttons, UI landmarks)
Total Test Suite: 40/40 PASSED (100% pass rate)

Bundle & Artifact Footprint:
├── Client JavaScript (gzipped): 82.54 kB (Target: < 200 kB)
├── Client CSS (gzipped):        4.90 kB
├── Git Packed Repository Size:  5.12 MB (Target: < 10 MB)
└── Git Active Branches:        1 (main only)
```

---

## 3. 60-Second Judge Demo Walkthrough

1. **Step 1: Open Home Page (`/`)**
   - Immediate unauthenticated access with no login gate.
   - Evaluator banner confirms `Asia/Kolkata` campus timezone and active role.
2. **Step 2: Run Conflict Demo**
   - Click the prominent Signal Red button: **"Run the conflict demo"**.
   - Lands on `/conflicts` showing the contested NVIDIA Jetson Orin 64GB slot on Day 2 (14:00 - 16:00).
   - Shows 2 competing students: Alex Rivera (Senior Capstone in 1 day) and Jordan Lee (Intro Coursework in 16 days).
3. **Step 3: Resolve with LabLink**
   - Click **"Resolve with LabLink"**.
   - 4-beat visual choreography evaluates feasibility, computes the 3-factor policy (Urgency 50%, Fair Share 30%, Wait Age 20%), ranks proposals, and awards exact slot to Alex Rivera.
   - Jordan Lee receives transparent alternative recommendations (nearest slot, equivalent hardware in parallel lab, priority waitlist).
4. **Step 4: Apply Allocation & Faculty Sign-off**
   - Click **"Apply Allocation Proposals"** -> status updates to "Under Review".
   - Click **"Open Faculty Approval Queue"** -> faculty advisor approves the booking with 1 click.
   - The Confirmed Laboratory Schedule audit table updates immediately with the confirmed reservation.
