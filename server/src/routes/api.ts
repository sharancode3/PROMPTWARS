import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createSeedScenario,
  DemoScenarioSchema,
  AccessRequestSchema,
  AllocationProposalSchema,
  ApprovalDecisionSchema,
  Resource,
  CapabilityTag
} from 'shared';
import { arbitrateSlotConflict } from '../domain/scheduler.js';
import {
  applyAllocationProposals,
  applyFacultyDecision,
  submitProjectRequest
} from '../domain/reducers.js';
import { interpretProjectNeed } from '../services/aiMatcher.js';

export const apiRouter = Router();

// Rate limiter for AI matching endpoint (30 req / min)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Rate limit exceeded on AI endpoint. Please try again shortly.' }
});

// Canonical seed snapshot reference
const canonicalSeed = createSeedScenario();

// Helper to extract or fallback to canonical scenario
function getScenarioFromPayload(snapshotRaw: unknown) {
  const parsed = DemoScenarioSchema.safeParse(snapshotRaw);
  return parsed.success ? parsed.data : canonicalSeed;
}

// 1. Healthcheck
apiRouter.get('/healthz', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'lablink-api',
    timeZone: 'Asia/Kolkata',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 2. Demo Reset
apiRouter.post(['/demo/reset', '/scenario/reset'], (_req: Request, res: Response) => {
  const freshScenario = createSeedScenario(new Date());
  res.json(freshScenario);
});

// 3. Catalog: List Resources
apiRouter.get('/resources', (req: Request, res: Response) => {
  const { q, department, category, capability } = req.query;
  let resources = [...canonicalSeed.resources];

  if (department && typeof department === 'string') {
    resources = resources.filter((r) => r.departmentId === department);
  }
  if (category && typeof category === 'string') {
    resources = resources.filter((r) => r.category === category);
  }
  if (capability && typeof capability === 'string') {
    resources = resources.filter((r) => r.capabilityTags.includes(capability as CapabilityTag));
  }
  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    resources = resources.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.location.toLowerCase().includes(query)
    );
  }

  res.json(resources);
});

// 4. Catalog: Get Resource by ID
apiRouter.get('/resources/:id', (req: Request, res: Response) => {
  const resource = canonicalSeed.resources.find((r) => r.id === req.params.id);
  if (!resource) {
    return res.status(404).json({ error: `Resource ${req.params.id} not found.` });
  }
  res.json(resource);
});

// 5. Resource Availability
apiRouter.all('/resources/:id/availability', (req: Request, res: Response) => {
  const from = req.body?.from || (req.query?.from as string) || (req.query?.date as string);
  const to = req.body?.to || (req.query?.to as string) || (req.query?.date as string);
  const snapshot = req.body?.snapshot;
  const scenario = getScenarioFromPayload(snapshot);
  const resource = scenario.resources.find((r) => r.id === req.params.id);

  if (!resource) {
    return res.status(404).json({ error: `Resource ${req.params.id} not found.` });
  }

  const bookedSlots = scenario.bookings
    .filter((b) => b.resourceId === req.params.id && b.status !== 'cancelled')
    .map((b) => ({
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status
    }));

  res.json({
    resourceId: resource.id,
    bookedSlots,
    operatingHours: resource.operatingHours
  });
});

// 6. AI Semantic Matcher
apiRouter.post('/ai/match', aiLimiter, async (req: Request, res: Response) => {
  const { projectPrompt, departmentFilter } = req.body;

  if (!projectPrompt || typeof projectPrompt !== 'string' || projectPrompt.trim().length < 2) {
    return res.status(400).json({ error: 'projectPrompt is required and must be at least 2 characters.' });
  }

  let catalog = canonicalSeed.resources;
  if (departmentFilter && typeof departmentFilter === 'string') {
    catalog = catalog.filter((r) => r.departmentId === departmentFilter);
  }

  const result = await interpretProjectNeed(projectPrompt, catalog);
  res.json(result);
});

// 7. Submit Request
apiRouter.post('/requests', (req: Request, res: Response) => {
  const { request: rawRequest, snapshot } = req.body;
  const parsedRequest = AccessRequestSchema.safeParse(rawRequest);

  if (!parsedRequest.success) {
    return res.status(400).json({ error: 'Invalid access request payload.', details: parsedRequest.error.issues });
  }

  const scenario = getScenarioFromPayload(snapshot);
  const result = submitProjectRequest(scenario, parsedRequest.data);

  res.status(201).json({
    success: true,
    createdRequest: result.data,
    updatedSnapshot: result.updatedScenario
  });
});

// 8. Query Requests
apiRouter.post('/requests/query', (req: Request, res: Response) => {
  const { userId, role, statusFilter, snapshot } = req.body;
  const scenario = getScenarioFromPayload(snapshot);

  let requests = [...scenario.requests];

  if (role === 'student' && userId) {
    requests = requests.filter((r) => r.studentId === userId);
  }
  if (statusFilter && statusFilter !== 'all') {
    requests = requests.filter((r) => r.status === statusFilter);
  }

  res.json({ requests });
});

// 9. Conflict Arbitration
apiRouter.post('/scheduling/arbitrate', (req: Request, res: Response) => {
  const { resourceId, date, slot, snapshot } = req.body;

  if (!resourceId || !date || !slot || !slot.startTime || !slot.endTime) {
    return res.status(400).json({ error: 'resourceId, date, and slot (startTime, endTime) are required.' });
  }

  const scenario = getScenarioFromPayload(snapshot);
  const resource = scenario.resources.find((r) => r.id === resourceId);

  if (!resource) {
    return res.status(404).json({ error: `Resource ${resourceId} not found.` });
  }

  // Find requests competing for this slot on this resource
  const competingRequests = scenario.requests.filter(
    (r) =>
      r.items.some((i) => i.resourceId === resourceId) &&
      r.requestedSlot.date === date &&
      r.requestedSlot.startTime === slot.startTime
  );

  const proposals = arbitrateSlotConflict({
    resource,
    slot: { date, startTime: slot.startTime, endTime: slot.endTime },
    requests: competingRequests,
    allResources: scenario.resources,
    allUsers: scenario.users && scenario.users.length > 0 ? scenario.users : [scenario.currentUser],
    existingBookings: scenario.bookings
  });

  const hasConflict = competingRequests.length > 1;

  res.json({
    hasConflict,
    proposals
  });
});

// 10. Apply Proposals
apiRouter.post('/scheduling/apply', (req: Request, res: Response) => {
  const { appliedProposals, snapshot } = req.body;

  if (!Array.isArray(appliedProposals) || appliedProposals.length === 0) {
    return res.status(400).json({ error: 'appliedProposals array is required.' });
  }

  const scenario = getScenarioFromPayload(snapshot);
  const result = applyAllocationProposals(scenario, appliedProposals);

  if (!result.success) {
    return res.status(result.code === 'STALE_CONFLICT' ? 409 : 400).json({ error: result.error });
  }

  res.json({
    success: true,
    appliedCount: result.data?.appliedCount,
    updatedSnapshot: result.updatedScenario
  });
});

// 11. Faculty Decision
const handleFacultyDecision = (req: Request, res: Response) => {
  const requestId = req.params.id || req.body?.decision?.requestId || req.body?.requestId;
  const decision = req.body?.decision?.decision || req.body?.decision;
  const reason = req.body?.decision?.reason || req.body?.reason;
  const suggestedSlot = req.body?.decision?.suggestedSlot || req.body?.suggestedSlot;
  const snapshot = req.body?.snapshot;

  const parsedDecision = ApprovalDecisionSchema.safeParse({
    requestId,
    decision,
    reason,
    suggestedSlot
  });

  if (!parsedDecision.success) {
    return res.status(400).json({ error: 'Invalid approval decision payload.', details: parsedDecision.error.issues });
  }

  const scenario = getScenarioFromPayload(snapshot);
  const result = applyFacultyDecision(scenario, {
    requestId,
    decision,
    reason,
    suggestedSlot
  });

  if (!result.success) {
    return res.status(result.code === 'NOT_FOUND' ? 404 : 400).json({ error: result.error });
  }

  res.json({
    success: true,
    updatedRequest: result.data,
    updatedSnapshot: result.updatedScenario
  });
};

apiRouter.post('/faculty/approvals/:id', handleFacultyDecision);
apiRouter.post('/approvals/decide', handleFacultyDecision);
