# Submission Checklist & Verification Protocol
## Project: LabLink — Campus Laboratory Resource-Sharing Platform
**Status:** DRAFT (Phase 1: Discovery & Planning)  
**Submission Deadline:** 5:00 PM Asia/Kolkata

---

## 1. Mandatory Submission Artifacts

| # | Item | Required Format / Value | Status |
| :--- | :--- | :--- | :--- |
| **1** | **GitHub Repository Link** | Must end in `.git`:<br>`https://github.com/sharancode3/PROMPTWARS.git` | [ ] Ready to verify |
| **2** | **Public Deployed URL** | Publicly accessible URL (Cloud Run / Vercel):<br>e.g. `https://lablink-promptwars-xxxx.a.run.app` | [ ] Ready for deployment |
| **3** | **LinkedIn Project Post** | URL of published post explaining the challenge & solution | [ ] Drafted below |
| **4** | **Brief Project Description** | Text paragraph for submission form | [ ] Drafted below |

---

## 2. GitHub Repository Compliance Rules

- [ ] **Public Visibility**: Confirm repository is set to **Public** on GitHub.
- [ ] **Exact Single Branch**: Confirm only `main` exists (`git branch -a`). Delete any auxiliary branches before final submission.
- [ ] **Size Under 10 MB**: Verify repo size using `git count-objects -vH`.
  - `.gitignore` must strictly exclude:
    - `node_modules/`
    - `.next/` and `dist/`
    - `.env*` (except `.env.example`)
    - Large media/video/zip binaries
- [ ] **URL Syntax**: Submitted URL must be exactly `https://github.com/sharancode3/PROMPTWARS.git`.

---

## 3. Public Deployed Application Verification

- [ ] **Zero Friction Access**: The deployed URL loads immediately without login walls, SSO barriers, or private access requests.
- [ ] **Demo Persona Switcher**: Evaluators can toggle between **Student**, **Faculty**, and **Lab Admin** in 1 click.
- [ ] **Health Check OK**: `GET /api/health` returns HTTP 200 with `{ status: "ok" }`.
- [ ] **Zero Console Errors**: Verified clean browser console on initial load and during all booking flows.
- [ ] **Fallback Verified**: If external AI API keys are not supplied, the app gracefully operates using the built-in heuristic engine.

---

## 4. Evaluator AI Scoring Signals (Platform Assessment)

| Signal | Target Standard | Implementation & Evidence |
| :--- | :--- | :--- |
| **Code Quality** | Clean, modular, type-safe | Strict TypeScript, separated layers (`/components`, `/lib`, `/app/api`), zero any types, ESLint passing. |
| **Security** | Zero exposed secrets, safe inputs | No API keys committed to git; all endpoints validated with Zod schemas; strict sanitization against XSS/injections. |
| **Efficiency** | Lean footprint, fast load | Next.js standalone build; minimal bundle footprint; instant sub-second response times. |
| **Testing** | Proven feature verification | Comprehensive Vitest suite covering the Fair Scheduling Engine, Conflict Resolution logic, and API validation. |
| **Accessibility** | WCAG 2.1 AA compliant | Accessible contrast ratios, full keyboard focus rings, ARIA live alerts for slot updates, semantic tags. |
| **Problem Alignment** | 100% adherence to LabLink PS | Cross-department discovery, AI project matcher, interactive slot booking, conflict arbitration, faculty queue. |

---

## 5. Submission Content Drafts

### 5.1 Brief Project Description (For Event Submission Form)
> **LabLink** is an intelligent, GenAI-powered campus laboratory resource-sharing platform designed to eliminate departmental silos and democratize access to specialized research infrastructure. Built with Next.js, TypeScript, and Google Gemini, LabLink enables students to discover specialized equipment (high-performance GPU rigs, RF spectrum analyzers, FPGA dev kits) across academic departments using natural language project descriptions. The platform features an interactive slot reservation system backed by a deterministic, multi-objective **Fair Conflict Resolution Engine** that balances project deadlines, academic seniority, and fair-share quotas to arbitrate competing booking requests. With a seamless Faculty Approval Queue, real-time alternative slot recommendations, and an instant zero-friction demo role switcher, LabLink maximizes laboratory equipment utilization while ensuring transparent, fair academic access.

### 5.2 LinkedIn Post Draft
> 🚀 Excited to unveil **LabLink** — built for **PromptWars** by Cynergy Coding Club & Google for Developers!
> 
> Higher education labs house millions of dollars in specialized equipment—from NVIDIA Jetson Orin dev kits to RF spectrum analyzers and confocal microscopes—yet they frequently sit underutilized behind departmental silos. Meanwhile, students working on urgent capstone and research projects struggle to find and access the hardware they need.
> 
> 💡 **What We Built:**
> **LabLink** transforms campus lab accessibility:
> 🔍 **GenAI Equipment Discovery**: Students describe their project goals in plain English, and our Gemini-powered engine instantly matches them with specialized cross-departmental lab equipment and workstations.
> ⚖️ **Fair Scheduling & Conflict Resolution**: When urgent project deadlines collide over high-demand hardware, our deterministic fairness engine calculates an auditable priority score (balancing deadlines, academic level, and prior usage) and recommends intelligent, feasible alternative slots.
> 👨‍🏫 **Faculty Approval Workflow**: Faculty advisors and lab coordinators get a dedicated 1-click review queue to vet project merit and grant digital access passes.
> 
> 🛠️ **Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Google Gemini API, Zod, and Vitest.
> 
> Check out our project on GitHub and explore the live deployment!
> #BuildWithAI #PromptWars #GoogleForDevelopers #Nextjs #GenAI #CampusInnovation
