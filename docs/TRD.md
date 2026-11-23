# Technical Requirements Document (TRD)
## Project: LabLink — Campus Laboratory Resource-Sharing Platform
**Status:** DRAFT (Phase 1: Discovery & Planning)  
**Target Deployment:** Google Cloud Run (Containerized, Port 8080)  
**Code Quality Target:** 95%+ Platform Automated Assessment Score

---

## 1. Stack Evaluation & Recommendation

To ensure the fastest maintainable delivery, zero build bloat, and full compliance with Cloud Run and evaluator standards, we evaluated three architecture options:

| Option | Stack | Pros | Cons | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Option A** *(Recommended)* | **Next.js 14+ (App Router, TypeScript, Tailwind CSS, Zod, Vitest)** | • Single cohesive repository and unified build<br>• Zero CORS/multi-service failure points<br>• Server-side API routes protect `GEMINI_API_KEY`<br>• Standalone output mode runs on native Node.js in Cloud Run (<100MB image)<br>• Instant cold-starts | None for this scope | **SELECTED** |
| **Option B** | Vite + React Frontend + Express / Node API | Clean separation of concerns | Requires dual build pipelines, port proxying, and extra container orchestration | Excluded (unnecessary overhead) |
| **Option C** | FastAPI (Python) + React Frontend | Strong scientific ecosystem in Python | Dual language runtime, heavy container layers, slower Docker build time on Cloud Run | Excluded (violates lean footprint rule) |

### Recommended Stack Specifications
- **Core Framework**: Next.js 14.2+ (App Router, React 18/19, TypeScript 5.x)
- **Styling & UI**: Tailwind CSS, PostCSS, Lucide-React icons, `class-variance-authority` (CVA)
- **Validation**: Zod (Schema-first validation for API payloads and form inputs)
- **GenAI SDK**: `@google/genai` or `@google/generative-ai` (Gemini 1.5 Flash) with fallback rule-based NLP parser
- **Testing**: Vitest + `@testing-library/react` + `jsdom` (fast, modern, zero-config Jest replacement)
- **Containerization**: Multi-stage `Dockerfile` (`node:20-alpine`, `standalone` Next.js output, exposes `PORT=8080`)
- **Package Manager**: `npm` (clean lockfile, universal Cloud Run compatibility)

---

## 2. Technical Dependencies & Budget

To maintain a lean repository (<10 MB strict rule) and rapid CI/CD build cycles, we maintain strict dependency governance:

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "lucide-react": "^0.400.0",
    "zod": "^3.23.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0",
    "@google/generative-ai": "^0.14.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.0",
    "jsdom": "^24.0.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

*Estimated repo source size (excluding `node_modules` via `.gitignore`): **< 2.5 MB** (well below the 10 MB limit).*

---

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
