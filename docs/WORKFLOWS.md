# System Workflows & User Journeys
## Project: LabLink — Campus Laboratory Resource-Sharing Platform
**Status:** DRAFT (Phase 1: Discovery & Planning)

---

## 1. End-to-End User Workflows

### 1.1 Student Discovery to Access Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as LabLink Web App
    participant Matcher as GenAI Matcher / NLP API
    participant Engine as Conflict & Fairness Engine
    participant Store as State Store
    actor Faculty as Faculty Advisor

    Student->>UI: Enters natural language project request<br>("Need high-speed logic analyzer for FPGA timing verification before Friday")
    UI->>Matcher: POST /api/ai/match { prompt, department }
    Matcher-->>UI: Matched Equipment (e.g. Tektronix 500MHz Analyzer in ECE Lab 204)
    Student->>UI: Selects Resource and desired Date/Time Slot
    UI->>Engine: POST /api/scheduling/arbitrate { resourceId, slot, projectData }
    alt No Conflict
        Engine-->>UI: Status: AVAILABLE (Priority Score: 88)
        UI->>Student: Shows Confirmed Slot Preview & Request Form
    else Slot Already Requested / Booked
        Engine-->>UI: Status: CONFLICT_DETECTED<br>Reason: Contested by Coursework Booking<br>Alternatives: [Slot +2h, Alternate Rig in Lab 301]
        UI->>Student: Displays Fair Conflict Explanation & Feasible Alternatives
        Student->>UI: Chooses Feasible Alternative or Requests Priority Overwrite
    end
    Student->>UI: Submits Project Request (Title, Advisor, Deadline, Prereqs)
    UI->>Store: Save Request (status: PENDING_FACULTY)
    UI-->>Student: Displays Tracking Badge & Instant Notification
    Store-->>Faculty: Adds Request to Faculty Review Queue
```

---

### 1.2 Faculty Review and Approval Flow

```mermaid
sequenceDiagram
    autonumber
    actor Faculty as Faculty Approver
    participant Dashboard as Faculty Review Queue
    participant Engine as Scheduling Engine
    participant Store as State Store
    actor Student

    Faculty->>Dashboard: Views Pending Access Queue (Sorted by Priority Score)
    Dashboard->>Faculty: Displays Request Details:<br>• Student: Alex (Senior, Capstone)<br>• Deadline: Nov 27 (4 days)<br>• Urgency Score: 92/100<br>• Safety Prerequisite: Verified
    alt Approves Request
        Faculty->>Dashboard: Clicks "Approve & Grant Pass"
        Dashboard->>Store: Update Request Status: CONFIRMED
        Store->>Engine: Lock Slot on Resource Calendar
        Dashboard-->>Faculty: Green Toast: "Access Granted. Digital Pass Issued."
        Store-->>Student: Status changes to CONFIRMED with Access Pass QR
    else Requests Reschedule / Conflict Adjustment
        Faculty->>Dashboard: Clicks "Suggest Alternate Slot" (e.g. 16:00-18:00)
        Dashboard->>Store: Update Status: RESCHEDULE_OFFERED
        Store-->>Student: Notification: "Faculty recommended alternate slot"
    else Rejects Request
        Faculty->>Dashboard: Inputs Reason (e.g. "Prerequisite lab training incomplete")
        Dashboard->>Store: Update Status: REJECTED
        Store-->>Student: Notification with Faculty Feedback
    end
```

---

## 2. Fair Scheduling & Conflict Resolution Flow

When multiple students seek access to the same equipment window:

```mermaid
flowchart TD
    Start([Slot Booking Requested]) --> CheckOccupied{Is Slot Already Occupied or Requested?}
    CheckOccupied -- No --> DirectSlot[Assign Direct Reservation: PENDING_FACULTY]
    
    CheckOccupied -- Yes --> ConflictDetected[Trigger Multi-Objective Fair Arbitrator]
    
    subgraph "Deterministic Fairness Evaluation"
        ConflictDetected --> CalcScoreA[Calculate Request A Priority Score]
        ConflictDetected --> CalcScoreB[Calculate Request B Priority Score]
        
        CalcScoreA --> ScoreFormula["Priority = (0.4 × DeadlineUrgency) + <br>(0.25 × ProjectWeight) + <br>(0.2 × AcademicSeniority) + <br>(0.15 × FairShareBalance)"]
        CalcScoreB --> ScoreFormula
    end
    
    ScoreFormula --> CompareScores{Score A vs Score B}
    
    CompareScores -- Score A > Score B --> GrantA[Recommend Slot to Request A]
    CompareScores -- Score B > Score A --> GrantB[Recommend Slot to Request B]
    
    GrantA --> GenAltB[Search Adjacent Feasible Slots & Equivalent Hardware for B]
    GrantB --> GenAltA[Search Adjacent Feasible Slots & Equivalent Hardware for A]
    
    GenAltB --> PresentUI[Present Human-Readable Fairness Justification + 1-Click Alternate Rebooking]
    GenAltA --> PresentUI
```

---

## 3. Edge Cases & Exception Handling

| Edge Case | Detection Mechanism | System Action & UX Resolution |
| :--- | :--- | :--- |
| **Simultaneous Slot Collisions** | Two users submit the same slot within milliseconds | Atomic optimistic locking in state layer. First processed gets primary hold; second gets real-time notice with next immediate alternative. |
| **Approaching Hard Deadline** | Request project deadline is $<24\text{ hours}$ away | Priority score gets an urgency boost ($+25\text{ pts}$); highlighted with a red flame badge in the Faculty review queue. |
| **Missing Safety Certification** | Resource requires "Hazardous Chemicals" or "Class 4 Laser" cert | Booking button displays disabled state: *"Safety Prerequisite Required: Laser Module 1"*, with link to clear prerequisite. |
| **Off-Hours Booking Attempt** | Request submitted for 22:00 (Lab hours: 08:00–20:00) | Hard constraint check immediately prevents slot selection: *"Requested time falls outside lab operating hours (08:00–20:00)"*. |
| **External AI API Down / Missing Key** | Gemini API network timeout or absent env key | Silent fallback to built-in keyword/tag-based heuristic matching engine. Banner alerts: *"Running in deterministic offline mode"*. Zero crash or unhandled promise rejection. |
| **Evaluator Demo Switch** | Evaluator tests student submission, then switches to faculty | Role switch header instantly toggles simulated user context (`alex_student` $\leftrightarrow$ `dr_radhika_faculty`), preserving created state so the evaluator sees their newly created request immediately in the faculty queue. |
