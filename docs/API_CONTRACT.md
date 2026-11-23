# API Contract Specification: `/api/v1`
## Project: LabLink — Campus Laboratory Resource-Sharing Platform
**Status:** COMPLETE (Phase 1 Scaffold)  
**Standard:** RESTful JSON with Strict Zod Validation & Role-Based Access Control

---

## 1. System & Demo Control Endpoints

| Method | Path | Required Role | Request Schema | Response Schema | Status / Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/healthz` | Public | None | `{ status: "ok", uptime: number, timestamp: string }` | `200` |
| `GET` | `/api/v1/me` | Public (Demo) | None | `UserSchema` | `200` |
| `POST` | `/api/v1/demo/role` | Public | `{ role: "student" \| "faculty" \| "admin" }` | `UserSchema` | `200`, `400` |
| `POST` | `/api/v1/demo/scenario/conflict` | Public | None | `{ success: boolean, scenario: string, count: number }` | `200` |
| `POST` | `/api/v1/demo/reset` | Public | None | `{ success: boolean, message: string }` | `200` |

---

## 2. Resource Discovery & Equipment Endpoints

| Method | Path | Required Role | Request Schema / Query Params | Response Schema | Status / Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/resources` | Public | Query: `q`, `department`, `category`, `availableOnly` | `Array<ResourceSchema>` | `200` |
| `GET` | `/api/v1/resources/:id` | Public | Params: `id` | `ResourceSchema` | `200`, `404` |
| `GET` | `/api/v1/resources/:id/availability` | Public | Query: `from`, `to` (ISO dates) | `{ resourceId: string, bookedSlots: Array<{ date: string, start: string, end: string }> }` | `200`, `404` |
| `GET` | `/api/v1/resources/:id/suggestions` | Public | Query: `minutes`, `deadline` | `Array<AlternativeSlotSchema>` | `200`, `400` |
| `POST` | `/api/v1/search/interpret` | Public | `NLSearchInterpretRequestSchema` | `NLSearchInterpretResponseSchema` | `200`, `400`, `500` |

---

## 3. Project & Access Request Endpoints

| Method | Path | Required Role | Request Schema | Response Schema | Status / Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects/mine` | Student | None | `Array<ProjectSchema>` | `200` |
| `POST` | `/api/v1/projects` | Student | `ProjectSchema.omit({ id, createdAt })` | `ProjectSchema` | `201`, `400` |
| `POST` | `/api/v1/requests/interpret` | Student | `{ prompt: string }` | `AccessRequestSchema.partial()` | `200`, `400` |
| `POST` | `/api/v1/requests` | Student | `AccessRequestSchema.omit({ id, submittedAt })` | `AccessRequestSchema` | `201`, `400` |
| `GET` | `/api/v1/requests/mine` | Student | None | `Array<AccessRequestSchema>` | `200` |
| `GET` | `/api/v1/requests/:id` | Student / Faculty | Params: `id` | `AccessRequestSchema` | `200`, `404` |

---

## 4. Faculty & Admin Approvals Endpoints

| Method | Path | Required Role | Request Schema | Response Schema | Status / Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/approvals/queue` | Faculty / Admin | None | `Array<AccessRequestSchema & { priorityScore: number }>` | `200`, `403` |
| `POST` | `/api/v1/approvals/:requestId/decision` | Faculty / Admin | `ApprovalDecisionSchema` | `{ success: boolean, updatedStatus: string }` | `200`, `400`, `404` |
| `GET` | `/api/v1/approvals/:requestId/brief` | Faculty / Admin | Params: `requestId` | `{ brief: string, bulletPoints: string[], riskAlerts: string[] }` | `200`, `404` |

---

## 5. Conflict Resolution & Arbitration Endpoints

| Method | Path | Required Role | Request Schema | Response Schema | Status / Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/conflicts` | Faculty / Admin | None | `Array<ConflictCluster>` | `200`, `403` |
| `POST` | `/api/v1/conflicts/resolve` | Faculty / Admin | `{ clusterId?: string }` | `Array<AllocationProposalSchema>` | `200`, `400` |
| `POST` | `/api/v1/conflicts/apply` | Faculty / Admin | `{ chosenProposals: Array<{ requestId: string, strategy: string, slot: object }> }` | `{ success: boolean, confirmedBookings: Array<BookingSchema> }` | `200`, `400` |

---

## 6. Bookings & Analytics Endpoints

| Method | Path | Required Role | Request Schema | Response Schema | Status / Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/bookings/mine` | Student | None | `Array<BookingSchema>` | `200` |
| `POST` | `/api/v1/bookings` | Student / Admin | `BookingSchema.omit({ id })` | `BookingSchema` | `201`, `400`, `409` |
| `DELETE` | `/api/v1/bookings/:id` | Student / Admin | Params: `id` | `{ success: boolean, cancelledId: string }` | `200`, `404` |
| `POST` | `/api/v1/bookings/:id/check-in` | Student / Admin | Params: `id` | `BookingSchema` | `200`, `400`, `404` |
| `GET` | `/api/v1/analytics/utilisation` | Public | None | `{ overallRate: number, departmentRates: Record<string, number>, hourlyHeatmap: number[][] }` | `200` |
| `GET` | `/api/v1/analytics/insights` | Public | None | `Array<{ id: string, title: string, description: string, severity: "info" \| "warning" }>` | `200` |
