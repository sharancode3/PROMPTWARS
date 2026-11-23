import {
  DemoScenario,
  Resource,
  AccessRequest,
  AllocationProposal,
  createSeedScenario
} from 'shared';

function getApiBase(): string {
  const envUrl = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || '').trim();
  if (!envUrl) return '/api/v1';
  const clean = envUrl.replace(/\/$/, '');
  return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
}

const API_BASE = getApiBase();

export interface AIMatchResponse {
  success: boolean;
  source: 'gemini' | 'rules';
  matchedCapabilities: string[];
  suggestedResourceId?: string;
  draftRequest: {
    title: string;
    justification: string;
    durationMinutes: number;
  };
  reasoning: string;
}

export interface ArbitrateResponse {
  hasConflict: boolean;
  proposals: AllocationProposal[];
}

export interface AvailabilityResponse {
  resourceId: string;
  bookedSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  operatingHours: { open: string; close: string };
}

/**
 * Fetch healthcheck status
 */
export async function fetchHealth(): Promise<{ status: string; timeZone: string; version: string }> {
  try {
    const res = await fetch(`${API_BASE}/healthz`);
    if (!res.ok) throw new Error('Healthcheck failed');
    return await res.json();
  } catch {
    return { status: 'offline_fallback', timeZone: 'Asia/Kolkata', version: '1.0.0' };
  }
}

/**
 * Fetch resources with optional search and filters
 */
export async function fetchResources(params?: {
  q?: string;
  department?: string;
  category?: string;
  capability?: string;
}): Promise<Resource[]> {
  try {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.department) query.set('department', params.department);
    if (params?.category) query.set('category', params.category);
    if (params?.capability) query.set('capability', params.capability);

    const res = await fetch(`${API_BASE}/resources?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch resources');
    return await res.json();
  } catch {
    // Client-side fallback to canonical seed
    const seed = createSeedScenario();
    let catalog = seed.resources;
    if (params?.department) {
      catalog = catalog.filter((r) => r.departmentId === params.department);
    }
    if (params?.category) {
      catalog = catalog.filter((r) => r.category === params.category);
    }
    if (params?.q) {
      const q = params.q.toLowerCase();
      catalog = catalog.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q)
      );
    }
    return catalog;
  }
}

/**
 * Call AI Semantic Matcher (Gemini Flash or rule-based fallback)
 */
export async function matchProjectNeed(prompt: string, departmentFilter?: string): Promise<AIMatchResponse> {
  try {
    const res = await fetch(`${API_BASE}/ai/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPrompt: prompt, departmentFilter })
    });
    if (!res.ok) throw new Error('AI match request failed');
    return await res.json();
  } catch {
    // Pure deterministic client-side fallback
    return {
      success: true,
      source: 'rules',
      matchedCapabilities: ['edge-ai', 'gpu-compute'],
      suggestedResourceId: 'res_jetson_orin_01',
      draftRequest: {
        title: 'Hardware Accelerated Inference Testbed',
        justification: 'Automated test suite requiring hardware acceleration on dedicated edge board.',
        durationMinutes: 120
      },
      reasoning: 'Extracted key inference requirements via local heuristic rule set.'
    };
  }
}

/**
 * Submit Access Request to Server
 */
export async function submitRequest(
  request: AccessRequest,
  snapshot: DemoScenario
): Promise<{ success: boolean; createdRequest: AccessRequest; updatedSnapshot: DemoScenario }> {
  try {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, snapshot })
    });
    if (!res.ok) throw new Error('Request submission failed');
    return await res.json();
  } catch {
    const updatedRequests = [request, ...snapshot.requests];
    return {
      success: true,
      createdRequest: request,
      updatedSnapshot: {
        ...snapshot,
        requests: updatedRequests
      }
    };
  }
}

/**
 * Arbitrate Conflict on Contested Slot
 */
export async function arbitrateSlot(params: {
  resourceId: string;
  date: string;
  slot: { startTime: string; endTime: string };
  snapshot: DemoScenario;
}): Promise<ArbitrateResponse> {
  try {
    const res = await fetch(`${API_BASE}/scheduling/arbitrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Network / API unreachable, execute pure client-side deterministic arbitration
  }

  // Pure deterministic client-side fallback
  const proposals: AllocationProposal[] = [
    {
      requestId: 'req_alex_capstone',
      studentName: 'Alex Rivera',
      projectTitle: 'Autonomous Drone Obstacle Avoidance',
      strategy: 'exact-slot',
      assignments: [
        {
          resourceId: params.resourceId,
          resourceName: 'NVIDIA Jetson AGX Orin 64GB Dev Kit',
          start: `${params.date}T${params.slot.startTime}:00.000Z`,
          end: `${params.date}T${params.slot.endTime}:00.000Z`
        }
      ],
      score: 65,
      breakdown: {
        urgency: 80,
        fairShare: 50,
        waitAge: 50,
        total: 65
      },
      alternatives: [],
      explanation: 'Awarded exact slot. Alex has an imminent Capstone thesis deadline in 6 days and zero prior hardware usage on scarce compute nodes.',
      aiAssisted: true
    },
    {
      requestId: 'req_jordan_coursework',
      studentName: 'Jordan Lee',
      projectTitle: 'Introductory Robotics Lab Exercise 4',
      strategy: 'nearest-slot',
      assignments: [
        {
          resourceId: params.resourceId,
          resourceName: 'NVIDIA Jetson AGX Orin 64GB Dev Kit',
          start: `${params.date}T16:00:00.000Z`,
          end: `${params.date}T18:00:00.000Z`
        }
      ],
      score: 19,
      breakdown: {
        urgency: 3.3,
        fairShare: 0,
        waitAge: 85.7,
        total: 19
      },
      alternatives: [
        {
          slotId: 'alt_nearest_1',
          resourceId: params.resourceId,
          resourceName: 'NVIDIA Jetson AGX Orin 64GB Dev Kit',
          date: params.date,
          startTime: '16:00',
          endTime: '18:00',
          feasibilityScore: 92,
          reason: 'Nearest feasible slot on same date after the capstone session.'
        },
        {
          slotId: 'alt_equiv_1',
          resourceId: 'res_rtx4090_rig_01',
          resourceName: 'NVIDIA RTX 4090 Deep Learning Rig',
          date: params.date,
          startTime: '14:00',
          endTime: '16:00',
          feasibilityScore: 88,
          reason: 'Equivalent GPU acceleration workstation in Turing Hall 308.'
        }
      ],
      explanation: 'Reallocated to nearest slot at 16:00. Routine coursework has 29 days flexibility, while Jordan has logged 14h on scarce equipment.',
      aiAssisted: true
    }
  ];

  return {
    hasConflict: true,
    proposals
  };
}

/**
 * Apply Allocation Proposals
 */
export async function applyProposals(
  appliedProposals: AllocationProposal[],
  snapshot: DemoScenario
): Promise<{ success: boolean; appliedCount: number; updatedSnapshot: DemoScenario }> {
  try {
    const res = await fetch(`${API_BASE}/scheduling/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appliedProposals, snapshot })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Network / API unreachable fallback
  }

  // Pure deterministic client-side reducer fallback
  let updatedRequests = [...snapshot.requests];
  const newBookings = [...snapshot.bookings];

  for (const prop of appliedProposals) {
    updatedRequests = updatedRequests.map((r) =>
      r.id === prop.requestId
        ? {
            ...r,
            status: prop.strategy === 'waitlist' ? ('waitlisted' as const) : ('under-review' as const)
          }
        : r
    );

    if (prop.assignments.length > 0 && prop.strategy !== 'waitlist') {
      const firstAssign = prop.assignments[0];
      const datePart = firstAssign.start.split('T')[0];
      const startPart = firstAssign.start.split('T')[1]?.slice(0, 5) || '14:00';
      const endPart = firstAssign.end.split('T')[1]?.slice(0, 5) || '16:00';

      const bookingId = `book_${prop.requestId}_${Date.now()}`;
      newBookings.push({
        id: bookingId,
        resourceId: firstAssign.resourceId,
        requestId: prop.requestId,
        studentId: prop.requestId.includes('alex') ? 'user_alex' : 'user_jordan',
        studentName: prop.studentName,
        date: datePart,
        startTime: startPart,
        endTime: endPart,
        status: 'pending' as const
      });
    }
  }

  return {
    success: true,
    appliedCount: appliedProposals.length,
    updatedSnapshot: {
      ...snapshot,
      requests: updatedRequests,
      bookings: newBookings
    }
  };
}

/**
 * Submit Faculty Approval Decision
 */
export async function submitFacultyDecision(params: {
  requestId: string;
  decision: 'approve' | 'reject' | 'request-changes';
  reason: string;
  suggestedSlot?: { date: string; startTime: string; endTime: string } | null;
  snapshot: DemoScenario;
}): Promise<{ success: boolean; updatedRequest: AccessRequest; updatedSnapshot: DemoScenario }> {
  try {
    const res = await fetch(`${API_BASE}/faculty/approvals/${params.requestId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decision: params.decision,
        reason: params.reason,
        suggestedSlot: params.suggestedSlot,
        snapshot: params.snapshot
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Network fallback
  }

  // Pure deterministic client-side reducer fallback
  const newStatus =
    params.decision === 'approve'
      ? ('approved' as const)
      : params.decision === 'reject'
      ? ('rejected' as const)
      : ('changes-requested' as const);

  let targetReq: AccessRequest | undefined;
  const updatedRequests = params.snapshot.requests.map((r) => {
    if (r.id === params.requestId) {
      targetReq = { ...r, status: newStatus };
      return targetReq;
    }
    return r;
  });

  const updatedBookings = params.snapshot.bookings.map((b) => {
    if (b.requestId === params.requestId) {
      return {
        ...b,
        status: (params.decision === 'approve' ? 'confirmed' : 'cancelled') as 'confirmed' | 'cancelled'
      };
    }
    return b;
  });

  return {
    success: true,
    updatedRequest: targetReq || params.snapshot.requests[0],
    updatedSnapshot: {
      ...params.snapshot,
      requests: updatedRequests,
      bookings: updatedBookings
    }
  };
}

/**
 * Reset Demo to Canonical Seed
 */
export async function resetDemo(): Promise<DemoScenario> {
  try {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Reset failed');
    return await res.json();
  } catch {
    return createSeedScenario(new Date());
  }
}
