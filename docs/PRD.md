# Product Requirements Document (PRD)
## Project: LabLink — Campus Laboratory Resource-Sharing Platform
**Status:** DRAFT (Phase 1: Discovery & Planning)  
**Target Deadline:** 5:00 PM Asia/Kolkata (Hard Deadline)  
**Repository:** `sharancode3/PROMPTWARS` (single branch: `main`)

---

## 1. Executive Summary & Problem Context
In higher education institutions, specialized laboratory resources (e.g., high-performance GPU servers, RF/microwave spectrum analyzers, FPGA dev kits, cleanrooms, 3D printers, CNC milling units, and confocal microscopes) are siloed within individual academic departments. Students face severe hurdles:
1. **Discovery Barrier**: Inability to identify what high-end equipment exists outside their home department.
2. **Opaque Scheduling & Inefficiency**: Equipment sits idle during non-class hours or is bottlenecked by manual, paper-based reservation books.
3. **Unresolved Scheduling Conflicts**: Multiple urgent capstone/research projects compete for identical hardware windows with no objective, fair arbitration mechanism.
4. **Administrative Friction**: Faculty advisors and lab coordinators lack a consolidated portal to review project merit, prerequisite compliance, and usage telemetry before issuing access.

**LabLink** solves this with a modern web platform integrating a **GenAI-powered Equipment Matcher & Proposal Assistant** and an **Explainable, Deterministic Fair Allocation & Conflict Resolution Engine**.

---

## 2. Requirements Matrix & Traceability

### 2.1 Stated Challenge & Organizer Requirements
- **Resource Discovery**: Cross-department catalog for specialized equipment, development kits, and lab workstations.
- **Intelligent Slot Booking**: Calendar-based time-slot reservation with availability matrix.
- **Project-Based Access Requests**: Students submit title, abstract, faculty advisor, requirements, and project deadline.
- **Faculty Approvals**: Multi-role review queue allowing faculty to approve, reject, or request slot adjustments.
- **Conflict Resolution & Optimization**: Intelligent arbitration recommending fair and feasible allocations based on project deadlines, equipment availability, and student requirements.
- **Organizer Constraints**:
  - Public GitHub repository ending in `.git`, strictly **exactly one branch** (`main`), strictly **under 10 MB**.
  - Publicly accessible deployment URL (working without private access or auth walls for evaluators; Cloud Run compatible).
  - LinkedIn project post explaining the solution.
  - Automated evaluation against 6 signals: Code Quality, Security, Efficiency, Testing, Accessibility, Problem Alignment.
  - Max 2 scored Challenge submission attempts (latest score counts).

### 2.2 User-Provided Constraints
- **Time Deadline**: 5:00 PM Asia/Kolkata. All development, testing, deployment, and verification must conclude with safe buffer time before 17:00.
- **UX & Polish Priority**: High visual fidelity, professional responsive UI, accessible design.
- **Strict Role Boundaries**: Clear separation of discovery/planning from implementation (Phase 1 zero-code, zero-deploy, zero-commit rule).

### 2.3 Assumptions for Confirmation
1. *Authentication in Demo Mode*: While real deployments use campus OAuth/SSO, evaluator access must be frictionless (no login wall). *Assumption:* Platform will feature an instant "Demo Role Switcher" (Student / Faculty / Lab Admin) allowing immediate evaluation of both student and faculty workflows without registration.
2. *GenAI Provider*: Google Gemini API (via `@google/genai` or Gemini Flash 1.5) with a robust deterministic mock/rule-based fallback if API keys are not provided in evaluator environments.
3. *Data Persistence for Cloud Run*: Standalone container with in-memory state pre-seeded with rich multi-department data (or SQLite/LocalStorage for client persistence) ensuring instant cold starts, zero external DB connection fragility, and high platform scores.

### 2.4 Agent Recommendations
1. **Hybrid GenAI Architecture**: Use GenAI for semantic search, natural language project-to-equipment extraction, and natural-language conflict mitigation explanations. Keep slot conflict detection and score calculation **100% deterministic and auditable** so AI never invents phantom slots or makes unauthorized decisions.
2. **Single-Page Application (SPA) / Full-Stack Next.js**: Utilize Next.js 14+ (App Router) or Vite React + Tailwind CSS with Lucide icons for maximum UI polish, zero bloat, instant container builds, and sub-second page loads.

---

## 3. User Personas & Core Workflows

### Persona A: The Student Innovator (e.g., Alex, 4th Year Robotics)
- **Need**: Needs 16 hours of Jetson Orin / RTX 4090 GPU time to train an obstacle avoidance model for an upcoming thesis deadline in 4 days.
- **Pain Point**: CSE lab is fully booked; unaware that the Mechatronics Dept has 2 idle Orin Dev Kits.
- **Workflow**: Types natural project description $\rightarrow$ LabLink identifies compatible kits across departments $\rightarrow$ Selects slot $\rightarrow$ Engine detects conflict with lower-urgency junior lab practice $\rightarrow$ Recommends optimal allocation and alternative slots $\rightarrow$ Submits project access proposal for faculty sign-off.

### Persona B: The Faculty Approver / PI (e.g., Dr. Radhika, ECE Dept)
- **Need**: Efficiently vet access requests from internal and external department students.
- **Pain Point**: Flooded with email requests without safety prerequisite confirmation or deadline urgency context.
- **Workflow**: Logs into Faculty Dashboard $\rightarrow$ Views pending requests sorted by fair priority score $\rightarrow$ Reviews AI summary of student project alignment and safety prerequisite check $\rightarrow$ Approves or suggests alternative slot in 1 click.

### Persona C: The Lab Resource Coordinator / Technician (e.g., Mr. Verma)
- **Need**: Monitor bench utilisation, equipment health, and enforce lab operating hours (08:00–20:00).
- **Workflow**: Views heatmaps of workstation utilisation, sets maintenance blocks, and verifies physical check-ins.

---

## 4. MVP Scope Definition

### 4.1 P0 (Must Have - Minimum Viable Product for Challenge)
- **Cross-Department Equipment Catalog**: Filterable by Department (CSE, ECE, Mech, Bio, Physics), Category (Workstation, Dev Kit, Heavy Rig), and Status (Available, In-Use, Maintenance).
- **Natural Language & GenAI Matcher**: Students describe project requirements in free text; AI extracts required hardware specs and recommends exact matching equipment.
- **Interactive Calendar & Slot Booking**: Visual timeline/slot picker (1-hour/2-hour blocks) with clear operational boundaries.
- **Project-Based Access Request Form**: Captures project title, faculty guide, deadline date, required tools, and justification.
- **Deterministic Fair Allocation & Conflict Resolution Engine**:
  - Hard constraint checks: No double bookings, lab operating hours respected, safety prerequisites validated.
  - Soft fairness scoring: Based on project deadline urgency ($W_1$), academic level ($W_2$), prior usage fair-share quota ($W_3$), and equipment suitability match ($W_4$).
  - Conflict Explainer: When slot is contested, system provides clear human-readable justification and alternative slot recommendations.
- **Faculty Approval Queue**: Dedicated review dashboard with 1-click Approve, Reject, or Reschedule actions.
- **Demo Role Switcher**: Instant switcher between Student (Alex), Faculty Approver (Dr. Radhika), and Lab Admin (Mr. Verma).
- **Accessibility & Responsive Polish**: WCAG AA contrast, keyboard navigation, clear ARIA attributes.

### 4.2 P1 (High Value - If Time Permits Before 15:30)
- **Utilisation Analytics Dashboard**: Department-level equipment utilization rates, peak hours, and idle time metrics.
- **Smart Safety Verification**: Prerequisite badge checking (e.g., "Laser Safety Cert Required" before booking high-power optics).
- **Exportable Booking Pass**: Downloadable QR/PDF pass with booking confirmation details.

### 4.3 P2 (Post-Hackathon / Future Roadmap)
- Physical IoT smart lock & RFID card integration for turnstile/bench activation.
- Integration with university LMS (Canvas/Moodle) and ERP (SAP/Ellucian).
- Automated penalty deductions for no-show reservations.

---

## 5. Measurable Acceptance Criteria

1. **Equipment Discovery**: Student can search by keyword ("FPGA", "GPU", "Spectrum") or department and filter results in $<100\text{ms}$.
2. **GenAI Recommendation**: Given a prompt like *"Need a setup for testing 2.4GHz antenna return loss"*, system correctly matches RF Network Analyzer in the ECE Dept with confidence score $>85\%$.
3. **Slot Conflict Handling**:
   - If User A books Slot [14:00 - 16:00], and User B requests the same slot:
   - System triggers the Conflict Resolution Engine.
   - Computes Priority Scores based on deadline and fair share.
   - Recommends the slot to the higher-urgency request while simultaneously offering User B alternative adjacent slots (e.g., [16:00 - 18:00] or an equivalent machine in another lab).
4. **Faculty Workflow**: Faculty can approve a request; status immediately transitions from `PENDING_FACULTY` to `CONFIRMED`.
5. **Zero Dead Ends & Error Tolerance**: App loads without console errors, has zero broken links, works completely offline/fallback when Gemini API key is unset.

---

## 6. High-Value Test Strategy
- **Unit Tests**:
  - `fairnessScorer.test.ts`: Validate that earlier deadlines and lower recent usage yield higher priority scores deterministically.
  - `conflictEngine.test.ts`: Verify collision detection, boundary overlap checks, and alternative slot generation.
- **Component & a11y Tests**:
  - Verification of ARIA labels on booking modal, keyboard focus trap, contrast compliance.
- **E2E / Integration Flow**:
  - Complete flow: Student submits request $\rightarrow$ conflict detected $\rightarrow$ alternative selected $\rightarrow$ Faculty switches role and approves $\rightarrow$ Student sees confirmed status.
