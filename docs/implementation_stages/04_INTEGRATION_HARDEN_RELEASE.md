# Stage 4 Prompt: Integration, Evaluator Audit, Cloud Run, and Submission

Run after Stages 2 and 3 are complete, or when their independent work is ready to integrate. This is the release owner stage. Do not assume deployment, scores, or external access; verify each one.

---

## Role and objective

Integrate the actual backend and UI, make the six evaluator criteria easy to verify, verify Cloud Run readiness, and prepare the submission pack. Recalculate time remaining to 5:00 PM IST before starting. Protect the live deployment and attempt buffer.

Read `docs/implementation_stages/README.md`, all prior stage reports, `AGENTS.md`, `CLAUDE.md`, `docs/HACKATHON_RULES.md`, `docs/SUBMISSION_CHECKLIST.md`, `README.md`, and the implemented PRD/TRD/architecture/test docs.

## Stage loop

1. Inspect `git status`, current branch list, repo size, package scripts, app URL/configuration, and stage gates. Preserve all existing changes.
2. Run the end-to-end checks below from a clean local state; record actual results.
3. Fix critical failures, then repeat the exact affected checks and full release checks.
4. Deploy only when authorized and the local gate passes. Smoke-test the deployed URL from a fresh unauthenticated session.
5. Prepare the submission pack and request any final external-action authorization only after the app, docs, and checks are ready.
6. Report links and evidence only when verified. Never fabricate a URL, score, test result, repo size, or LinkedIn publication.

## End-to-end verification

Walk the real implementation from a fresh browser session:

1. Load the public landing page without sign-in.
2. Start/reset the conflict demo; confirm the synthetic scenario loads.
3. Search/filter actual resources and open one detail/availability view.
4. Submit a project request, including the AI-assisted draft path and the rules fallback path where applicable.
5. Resolve the seeded conflict; confirm all returned options satisfy interval, deadline, equipment, lab-hour, and safety gates.
6. Apply a recommendation; confirm it becomes pending faculty approval.
7. Switch to faculty, approve or request a reschedule with a reason, then return to the student view and confirm the updated status.
8. Reset and verify the same deterministic scenario is restored.

Fix broken links, uncaught errors, stuck loading states, stale data, incorrect success messages, and any path that requires typing or an account to demonstrate the product.

## Evaluator audit

Create/update `docs/EVALUATOR_AUDIT.md` with one row per official criterion and evidence paths/commands:

- **Code quality:** clear modules, strict types, concise functions, no dead code/debug logging, docs match actual code.
- **Security:** no secrets in repo/history/client bundle, Zod validation on external inputs, bounded input sizes, safe errors, synthetic-only demo state, rate limit for GenAI where practical.
- **Efficiency:** lean dependencies, no oversized assets, measured build/container/repo size, efficient list/interval logic, no avoidable repeated API/model calls.
- **Testing:** actual test commands and pass counts; cover allocation invariants, API validation, AI fallback, and core user flow. Do not claim 90% or all-route coverage unless measured.
- **Accessibility:** keyboard path, focus, labels, error announcements, contrast and reduced-motion checks on implemented screens.
- **Problem alignment:** map each phrase of the challenge to a visible feature, source path, and relevant test.

The official briefing does not specify score weights. Remove unsupported percentages from the docs and do not optimize for a fabricated weighting formula.

## Security and efficiency release checks

- Confirm Gemini key is server-only and never printed. Use Cloud Run Secret Manager when available; app must start when no key exists.
- Ensure model responses are parsed and validated before use; the scheduler remains deterministic; faculty remains final approver.
- Confirm public role switching can mutate synthetic demo data only.
- Confirm error responses do not leak stack traces or environment values.
- Check `.gitignore` for `.env`, `node_modules`, `.next`, build output, coverage output, and large artifacts.
- Measure actual repository size and confirm it is strictly below 10 MB. Keep exactly one branch (`main`). Do not delete remote branches or force-push. If unexpected branches exist, stop and request approval for the exact cleanup action.
- Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` (or the actual documented equivalents); fix and repeat. Build the container if Docker is available and time allows.

## Cloud Run deployment and public smoke test

Use Cloud Run as the primary deployment because the briefing ties Top 10 eligibility to a working Cloud Run project. Confirm actual project/region/permissions first; default to `asia-south1` only if supported and appropriate. Deploy the existing Express service as one container. Its production start must serve the built `client/dist` SPA and `/api/v1/*` from the same origin, listen on `process.env.PORT`, expose `/api/v1/healthz`, and allow unauthenticated evaluator access.

Cloud Run may scale to multiple stateless instances and can restart them. Never treat `max-instances=1` or process memory as durable persistence. Keep the synthetic scenario in browser local storage and make API operations stateless over validated snapshots. Keep API secrets in Secret Manager when configured; do not put them in image layers or command logs.

The demo scenario is browser-local and synthetic; do not claim server-side or cross-device persistence. Cloud Run process memory must not be required for any demo path.

After an authorized deploy, verify:

- `GET /api/v1/healthz` returns HTTP 200;
- landing page and assets return successfully without login;
- resource search, request interpretation/fallback, conflict resolution, and approval demo work from a fresh session;
- browser console/network has no blocking errors;
- the demo can reset to seed data.

If Google Cloud credentials or project access are missing, complete all independent checks, prepare exact deployment steps, and report the external blocker. Never invent a live URL.

## Submission pack and attempt strategy

Update `docs/SUBMISSION_CHECKLIST.md` and README with verified values only. Prepare:

- the exact repository URL ending in `.git`;
- the live Cloud Run URL after verified deployment;
- a brief description that matches implemented features;
- a LinkedIn post draft that explains the problem/solution and links the project; do not publish it without explicit user authorization;
- a 60-second judge demo script;
- the one-branch, <10 MB, public URL, no-login, quality-check checklist.

Scored submissions are external actions. Complete all implementation and verification first. Submit attempt 1 only after the live smoke test and all critical P0 checks pass, with the user's explicit authorization. Read its actual feedback. The latest score is final, so attempt 2 is reserved for a verified, low-risk change with a clear expected gain; never promise it will score higher. The single technical retry applies only if submission/evaluation fails before a score completes.

## Acceptance gate and final report

The release gate passes only when local checks pass, the live public Cloud Run URL is verified, repo rules are satisfied, and submission materials match the implementation. Report:

- verified repo and deployed links;
- branch count and measured repo size;
- commands run and actual test results;
- public-session smoke-test result;
- evaluator audit evidence/gaps;
- description and LinkedIn draft status;
- scored attempt status and any remaining blocker.

