import {
  DemoScenario,
  Resource,
  AccessRequest,
  AllocationProposal,
  createSeedScenario
} from 'shared';

const API_BASE = '/api/v1';

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
  const res = await fetch(`${API_BASE}/scheduling/arbitrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to arbitrate slot conflict');
  }
  return await res.json();
}

/**
 * Apply Allocation Proposals
 */
export async function applyProposals(
  appliedProposals: AllocationProposal[],
  snapshot: DemoScenario
): Promise<{ success: boolean; appliedCount: number; updatedSnapshot: DemoScenario }> {
  const res = await fetch(`${API_BASE}/scheduling/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appliedProposals, snapshot })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to apply proposals');
  }
  return await res.json();
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
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to record faculty decision');
  }
  return await res.json();
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
