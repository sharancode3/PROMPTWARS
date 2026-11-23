# Technical Requirements Document (TRD)
## Project: LabLink — Campus Laboratory Resource-Sharing Platform
**Status:** DRAFT (Phase 1: Discovery & Planning)  
**Target Deployment:** Google Cloud Run (Containerized, Port 8080)  
**Code Quality Target:** Maximum Automated Platform Assessment Score

---

## 1. Stack Evaluation & Recommendation

To ensure the fastest maintainable delivery, zero build bloat, and full compliance with Cloud Run and evaluator standards, we evaluated three architecture options:

| Option | Stack | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Option A** *(Selected)* | **npm Workspaces (TypeScript Monorepo: `shared/`, `server/` Express, `client/` React 18 + Vite + Tailwind)** | • Clear separation of concerns with shared Zod contracts<br>• Single Cloud Run container serving Express API + static Vite SPA<br>• Server-side API protection for `GEMINI_API_KEY`<br>• Extremely lean build footprint and sub-second cold starts | None for hackathon scope | **SELECTED** |
| **Option B** | Next.js 14 App Router | Unified meta-framework | Heavier node server bundle, potential cold-start lag | Excluded |
| **Option C** | FastAPI (Python) + React Frontend | Strong Python scientific tooling | Multi-language container layers, slower Docker build time | Excluded |

### Stack Specifications
- **Monorepo Structure**: npm workspaces (`shared/`, `server/`, `client/`)
- **Backend API**: Node 22, Express 4.19, Helmet 7, Compression, CORS, Zod 3.23
- **Frontend SPA**: React 18.3, Vite 5.2, Tailwind CSS 3.4, React Router 6.23
- **Design System**: Swiss Minimalism x Playful Geometry (`05_UI_UX_SYSTEM.md`), 100% inline SVG
- **GenAI Client**: Google AI Studio API (`@google/generative-ai` with configurable `GEMINI_MODEL`) + offline heuristic fallback
- **Testing**: Vitest 1.6 + Supertest 7 (server) and Vitest + Testing Library (client)
- **Deployment**: Single container Google Cloud Run (`PORT=8080`) serving API and built SPA

---

## 2. Technical Dependencies & Justification

Every dependency in the repository serves a concrete architectural purpose:

| Package | Workspace | Justification / Role |
| :--- | :--- | :--- |
| `zod` | `shared`, `server` | Single source of truth for runtime validation and static TypeScript types |
| `express` | `server` | Lightweight, robust HTTP router for API endpoints and static SPA hosting |
| `helmet` | `server` | Production security headers and Content Security Policy |
| `cors` | `server` | Controlled cross-origin resource sharing |
| `compression` | `server` | Gzip compression for API payloads and client assets |
| `pino` | `server` | Structured, low-overhead logging |
| `@google/generative-ai` | `server` | Server-side Gemini 1.5/Flash model integration |
| `react`, `react-dom` | `client` | Core UI component model |
| `react-router-dom` | `client` | Client-side routing for the 8 core screens |
| `tailwindcss` | `client` | Utility-first CSS implementing the Swiss design tokens |
| `vitest`, `supertest` | Root, `server`, `client` | Unit, integration, and invariant testing |

## 3. System Components & Architecture Boundaries

```mermaid
graph TD
    Client[Browser / Evaluator] -->|HTTPS Requests| CloudRun[Google Cloud Run Container]
    subgraph "Next.js Full-Stack App (Port 8080)"
        UI[App Router UI Pages]
        DemoSwitch[Demo Role Switcher: Student | Faculty | Admin]
        UI --> DemoSwitch
        
        subgraph "Server API Handlers (/api/*)"
            MatchAPI["/api/ai/match<br>(Project to Resource Parser)"]
            ConflictAPI["/api/scheduling/arbitrate<br>(Fairness & Conflict Engine)"]
            BookingsAPI["/api/bookings<br>(CRUD & Status Lifecycle)"]
            ResourcesAPI["/api/resources<br>(Catalog & Availability)"]
        end
        
        UI --> MatchAPI
        UI --> ConflictAPI
        UI --> BookingsAPI
        UI --> ResourcesAPI
        
        subgraph "Engines & Services"
            GeminiClient[Google Gemini 1.5 Flash Service]
            FallbackNLP[Rule-Based Heuristic Matcher]
            Scheduler[Deterministic Multi-Objective Fair Allocator]
            DataStore[(InMemory / Seeded Multi-Dept State Store)]
        end
        
        MatchAPI --> GeminiClient
        GeminiClient -.->|On Key Missing / RateLimit| FallbackNLP
        MatchAPI --> FallbackNLP
        ConflictAPI --> Scheduler
        Scheduler --> DataStore
        BookingsAPI --> DataStore
        ResourcesAPI --> DataStore
    end
```

---

## 4. Key Engineering Standards & Guardrails

### 4.1 Security Principles
- **Credential Protection**: Server-side only handling of `GEMINI_API_KEY`. No API keys or tokens baked into frontend JavaScript bundles or committed to git.
- **Input Sanitization**: All incoming request payloads validated against strict Zod schemas with character length limits and string escaping to block XSS and prompt injection attempts.
- **Safe State Fallbacks**: If external AI APIs fail or credentials are omitted, the application degrades gracefully to deterministic heuristic matching with a clear indicator banner, preventing 500 errors.

### 4.2 Accessibility & Performance (Platform Scoring Signals)
- **Keyboard Trapping & Tab Ordering**: Modals (booking modal, conflict resolution popup) feature complete keyboard navigation (`Escape` to close, `Tab` focus cycle).
- **ARIA Semantics**: All interactive buttons, calendar slots, role switches, and status pills contain explicit `aria-label`, `aria-expanded`, and `role` indicators.
- **Color Contrast**: Dark/Light accessible palette exceeding WCAG 2.1 AA ratio ($>4.5:1$ for body, $>3:1$ for headers).

---

## 5. Deployment & Cloud Run Specifications

- **Container Runtime**: `Dockerfile` using multi-stage build:
  1. `builder`: Installs all dependencies, compiles Next.js with `output: 'standalone'`.
  2. `runner`: Minimal `node:20-alpine` production image containing only compiled `.next/standalone`, public static assets, and minimal node binaries.
- **Environment Variables**:
  - `PORT=8080` (Standard Cloud Run requirement)
  - `NODE_ENV=production`
  - `GEMINI_API_KEY` (Optional; system functions identically with built-in heuristic fallback)
- **Health Check Endpoint**: `/api/health` returning `{ status: "ok", timestamp: ISOString, uptime: number }`.
