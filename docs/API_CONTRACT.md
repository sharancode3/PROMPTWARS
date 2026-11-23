# API Contract Specification: Versioned P0 API (`/api/v1`)
## Project: LabLink — Campus Laboratory Resource-Sharing Platform
**Status:** FROZEN & CANONICAL (Stage 1)  
**Standard:** RESTful JSON with Strict Zod Validation & Stateless Cloud Run Operation

---

## 1. Architectural Philosophy: Stateless Cloud Run & Client Snapshot

Because Google Cloud Run is an ephemeral, autoscaling, serverless container environment, **process memory is never durable**.
1. **Catalog vs. State**:
   - The laboratory catalog (Departments, Labs, Resources) is static and seeded.
   - Mutable user state (Bookings, Requests, Approvals) is versioned and persisted in the user's browser `localStorage` as a `DemoScenario` snapshot.
2. **Stateless Operations**:
   - Endpoints requiring or mutating user state accept the current `DemoScenario` snapshot in the request body.
   - Mutations validate constraints statelessly, apply pure domain state reducers, and return the updated `DemoScenario` snapshot.
   - `POST /api/v1/demo/reset` returns the fresh, pristine canonical seed scenario.

---

## 2. Canonical Endpoint Specifications

### 2.1 System & Demo Control

#### `GET /api/v1/healthz`
- **Purpose**: Liveness and readiness probe for Cloud Run container monitoring.
- **Role**: Public
- **Request**: Empty
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "lablink-api",
    "uptime": 128.4,
    "timestamp": "2026-11-23T08:45:00.000Z"
  }
  ```
- **Status Codes**: `200`

#### `POST /api/v1/demo/reset`
- **Purpose**: Returns the pristine canonical seed scenario (departments, 8-12 resources, 4 students, 1 faculty, default bookings).
- **Role**: Public
- **Request**: `{}` (Optional overrides)
- **Response**: `DemoScenarioSchema`
- **Status Codes**: `200`

---

### 2.2 Resource Discovery & Equipment

#### `GET /api/v1/resources`
- **Purpose**: Retrieves cross-department laboratory equipment catalog.
- **Role**: Public
- **Query Parameters**:
  - `q` (string, optional): Search query (e.g., "GPU", "FPGA", "Analyzer")
  - `department` (string, optional): Department ID filter
  - `category` (ResourceCategory, optional): e.g., `compute`, `embedded`, `instrumentation`
  - `capability` (CapabilityTag, optional): Specific capability tag filter
- **Response**: `Array<ResourceSchema>`
- **Status Codes**: `200`

#### `GET /api/v1/resources/:id`
- **Purpose**: Retrieves full technical specifications, safety prerequisites, and operating hours for a specific equipment unit.
- **Role**: Public
- **Parameters**: `id` (string)
- **Response**: `ResourceSchema`
- **Status Codes**: `200`, `404 Not Found`

#### `POST /api/v1/resources/:id/availability`
- **Purpose**: Evaluates slot availability for a resource within a date range, reflecting the current browser snapshot state.
- **Role**: Public
- **Request Body**:
  ```json
  {
    "from": "2026-11-23",
    "to": "2026-11-30",
    "snapshot": "<DemoScenarioSnapshot>"
  }
  ```
- **Response**:
  ```json
  {
    "resourceId": "res_jetson_orin_01",
    "bookedSlots": [
      {
        "date": "2026-11-25",
        "startTime": "14:00",
        "endTime": "16:00",
        "status": "confirmed"
      }
    ],
    "operatingHours": { "open": "08:00", "close": "20:00" }
  }
  ```
- **Status Codes**: `200`, `400 Bad Request`, `404 Not Found`

---

### 2.3 AI Intake & Semantic Matching

#### `POST /api/v1/ai/match`
- **Purpose**: Interprets a natural language project description into an editable, schema-validated request draft matching real catalog resources.
- **Role**: Public / Student
- **Request Body**:
  ```json
  {
    "projectPrompt": "Need high-speed logic analyzer for FPGA timing verification before Friday",
    "departmentFilter": "ECE"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "source": "gemini_flash" | "heuristic_fallback",
    "matchedCapabilities": ["logic-analyzer", "fpga-synthesis", "signal-measurement"],
    "suggestedResourceId": "res_keysight_la_01",
    "draftRequest": {
      "title": "FPGA Timing Verification",
      "justification": "Requires 16-channel logic analysis for sub-nanosecond clock skew validation.",
      "durationMinutes": 120
    },
    "reasoning": "Matched high-speed digital timing analysis requirements to Keysight 500MHz Analyzer."
  }
  ```
- **Status Codes**: `200`, `400 Bad Request`

---

### 2.4 Access Requests & Browser Snapshot Query

#### `POST /api/v1/requests`
- **Purpose**: Submits a new project-linked equipment access request into the browser's demo snapshot.
- **Role**: Student (Demo view)
- **Request Body**:
  ```json
  {
    "request": "<NewAccessRequestPayload>",
    "snapshot": "<DemoScenarioSnapshot>"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "createdRequest": "<AccessRequest>",
    "updatedSnapshot": "<DemoScenarioSnapshot>"
  }
  ```
- **Status Codes**: `201 Created`, `400 Bad Request`

#### `POST /api/v1/requests/query`
- **Purpose**: Filters and returns requests for the active demo user from the browser snapshot.
- **Role**: Student / Faculty (Demo view)
- **Request Body**:
  ```json
  {
    "userId": "user_student_alex",
    "role": "student",
    "statusFilter": "all" | "pending" | "confirmed",
    "snapshot": "<DemoScenarioSnapshot>"
  }
  ```
- **Response**:
  ```json
  {
    "requests": "Array<AccessRequest>"
  }
  ```
- **Status Codes**: `200`, `400 Bad Request`

---

### 2.5 Deterministic Conflict Arbitration & Scheduling

#### `POST /api/v1/scheduling/arbitrate`
- **Purpose**: Deterministically evaluates competing requests on contested slots, calculates auditable priority scores ($0-100$), and generates alternative slot recommendations. Does NOT mutate state.
- **Role**: Faculty / Admin / Public Demo
- **Request Body**:
  ```json
  {
    "resourceId": "res_jetson_orin_01",
    "date": "2026-11-25",
    "slot": "14:00 - 16:00",
    "snapshot": "<DemoScenarioSnapshot>"
  }
  ```
- **Response**:
  ```json
  {
    "hasConflict": true,
    "proposals": [
      {
        "requestId": "req_alex_capstone",
        "studentName": "Alex Rivera",
        "projectTitle": "Autonomous Obstacle Avoidance Drone",
        "strategy": "exact-slot",
        "score": 88.5,
        "breakdown": {
          "urgency": 90.0,
          "scarceResourceAccess": 90.0,
          "waitingTime": 80.0,
          "requirementFit": 100.0,
          "total": 88.5
        },
        "assignments": [{ "resourceId": "res_jetson_orin_01", "start": "14:00", "end": "16:00" }],
        "alternatives": [],
        "explanation": "Awarded priority due to urgent capstone deadline in 3 days.",
        "aiAssisted": false
      },
      {
        "requestId": "req_jordan_coursework",
        "studentName": "Jordan Lee",
        "projectTitle": "Robotics Lab Practice",
        "strategy": "nearest-slot",
        "score": 52.0,
        "breakdown": {
          "urgency": 25.0,
          "scarceResourceAccess": 60.0,
          "waitingTime": 70.0,
          "requirementFit": 80.0,
          "total": 52.0
        },
        "assignments": [],
        "alternatives": [
          {
            "slotId": "alt_1",
            "resourceId": "res_jetson_orin_01",
            "resourceName": "NVIDIA Jetson AGX Orin 64GB",
            "date": "2026-11-25",
            "startTime": "16:00",
            "endTime": "18:00",
            "feasibilityScore": 95,
            "reason": "Adjacent available window on identical hardware."
          }
        ],
        "explanation": "Recommended reassignment to adjacent slot at 16:00.",
        "aiAssisted": false
      }
    ]
  }
  ```
- **Status Codes**: `200`, `400 Bad Request`

#### `POST /api/v1/scheduling/apply`
- **Purpose**: Atomically revalidates and applies chosen allocation proposals into the snapshot, setting status to `pending_faculty`.
- **Role**: Faculty / Admin
- **Request Body**:
  ```json
  {
    "appliedProposals": "Array<AllocationProposal>",
    "snapshot": "<DemoScenarioSnapshot>"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "appliedCount": 2,
    "updatedSnapshot": "<DemoScenarioSnapshot>"
  }
  ```
- **Status Codes**: `200`, `400 Bad Request`, `409 Conflict`

---

### 2.6 Faculty Approvals Workflow

#### `POST /api/v1/faculty/approvals/:id`
- **Purpose**: Faculty advisor approves, rejects, or requests rescheduling for an access request.
- **Role**: Faculty / Admin
- **Parameters**: `id` (Request ID)
- **Request Body**:
  ```json
  {
    "decision": "approve" | "reject" | "request-changes",
    "reason": "Verified prerequisite lab safety certification and capstone alignment.",
    "suggestedSlot": null,
    "snapshot": "<DemoScenarioSnapshot>"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "updatedRequest": "<AccessRequest>",
    "updatedSnapshot": "<DemoScenarioSnapshot>"
  }
  ```
- **Status Codes**: `200`, `400 Bad Request`, `404 Not Found`
