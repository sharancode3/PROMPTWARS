import {
  DemoScenario,
  AccessRequest,
  AllocationProposal,
  Booking
} from 'shared';

export interface ReducerResult<T> {
  success: boolean;
  error?: string;
  code?: 'NOT_FOUND' | 'STALE_CONFLICT' | 'VALIDATION_ERROR';
  updatedScenario: DemoScenario;
  data?: T;
}

/**
 * Pure reducer: Applies selected allocation proposals to the scenario snapshot.
 * Revalidates against current bookings to prevent stale overwrite (409 Conflict).
 */
export function applyAllocationProposals(
  scenario: DemoScenario,
  proposals: AllocationProposal[]
): ReducerResult<{ appliedCount: number }> {
  const updatedRequests = [...scenario.requests];
  let appliedCount = 0;

  for (const prop of proposals) {
    const reqIndex = updatedRequests.findIndex((r) => r.id === prop.requestId);
    if (reqIndex === -1) continue;

    const req = updatedRequests[reqIndex];

    // Revalidate if assignments don't collide with existing confirmed bookings
    if (prop.assignments && prop.assignments.length > 0) {
      for (const assign of prop.assignments) {
        const collision = scenario.bookings.find(
          (b) =>
            b.resourceId === assign.resourceId &&
            b.status === 'confirmed' &&
            b.date === req.requestedSlot.date &&
            b.startTime === assign.start &&
            b.endTime === assign.end &&
            b.requestId !== req.id
        );

        if (collision) {
          return {
            success: false,
            code: 'STALE_CONFLICT',
            error: `Stale proposal: Slot [${assign.start}, ${assign.end}) on resource ${assign.resourceId} was already confirmed.`,
            updatedScenario: scenario
          };
        }
      }
    }

    // Update request state: marked as under-review awaiting faculty final approval
    updatedRequests[reqIndex] = {
      ...req,
      status: 'under-review'
    };
    appliedCount++;
  }

  const updatedScenario: DemoScenario = {
    ...scenario,
    requests: updatedRequests
  };

  return {
    success: true,
    updatedScenario,
    data: { appliedCount }
  };
}

/**
 * Pure reducer: Applies a faculty decision to an access request.
 * If approved, creates a confirmed booking in scenario.bookings.
 * If rejected or changes requested, records reason and updates status.
 */
export function applyFacultyDecision(
  scenario: DemoScenario,
  params: {
    requestId: string;
    decision: 'approve' | 'reject' | 'request-changes';
    reason: string;
    suggestedSlot?: { date: string; startTime: string; endTime: string } | null;
  }
): ReducerResult<AccessRequest> {
  const { requestId, decision, reason, suggestedSlot } = params;

  const reqIndex = scenario.requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) {
    return {
      success: false,
      code: 'NOT_FOUND',
      error: `Access request with id ${requestId} not found.`,
      updatedScenario: scenario
    };
  }

  const targetReq = scenario.requests[reqIndex];
  const updatedBookings = [...scenario.bookings];

  let nextStatus: 'approved' | 'rejected' | 'changes-requested' = 'approved';
  if (decision === 'reject') nextStatus = 'rejected';
  if (decision === 'request-changes') nextStatus = 'changes-requested';

  const updatedRequest: AccessRequest = {
    ...targetReq,
    status: nextStatus,
    justification: `${targetReq.justification}\n[Faculty Note]: ${reason}`
  };

  // If approved, create a confirmed booking
  if (decision === 'approve') {
    const bookingDate = suggestedSlot?.date || targetReq.requestedSlot.date;
    const startTime = suggestedSlot?.startTime || targetReq.requestedSlot.startTime;
    const endTime = suggestedSlot?.endTime || targetReq.requestedSlot.endTime;
    const resourceId = targetReq.items[0]?.resourceId || 'res_default';

    const newBooking: Booking = {
      id: `book_${Date.now()}_${targetReq.id}`,
      resourceId,
      requestId: targetReq.id,
      studentId: targetReq.studentId,
      studentName: targetReq.studentName,
      date: bookingDate,
      startTime,
      endTime,
      status: 'confirmed'
    };

    updatedBookings.push(newBooking);
  }

  const updatedRequests = [...scenario.requests];
  updatedRequests[reqIndex] = updatedRequest;

  const updatedScenario: DemoScenario = {
    ...scenario,
    requests: updatedRequests,
    bookings: updatedBookings
  };

  return {
    success: true,
    updatedScenario,
    data: updatedRequest
  };
}

/**
 * Pure reducer: Submits a new project access request into the demo scenario.
 */
export function submitProjectRequest(
  scenario: DemoScenario,
  newRequest: AccessRequest
): ReducerResult<AccessRequest> {
  const updatedRequests = [newRequest, ...scenario.requests];

  const updatedScenario: DemoScenario = {
    ...scenario,
    requests: updatedRequests
  };

  return {
    success: true,
    updatedScenario,
    data: newRequest
  };
}
