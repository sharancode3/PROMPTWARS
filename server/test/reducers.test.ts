import { describe, it, expect } from 'vitest';
import {
  applyAllocationProposals,
  applyFacultyDecision,
  submitProjectRequest
} from '../src/domain/reducers.js';
import { createSeedScenario, AllocationProposal, AccessRequest } from 'shared';

describe('Stateless Reducers & Invariants', () => {
  const scenario = createSeedScenario(new Date('2026-11-23T12:00:00.000Z'));

  it('rejects stale proposal at apply when slot is already booked', () => {
    // Add existing confirmed booking on [14:00, 16:00) on day 2
    const date = scenario.requests[0].requestedSlot.date;
    const scenarioWithCollision = {
      ...scenario,
      bookings: [
        ...scenario.bookings,
        {
          id: 'existing_book_1',
          resourceId: 'res_jetson_orin_01',
          requestId: 'prior_req',
          studentId: 'user_prior',
          studentName: 'Prior Student',
          date,
          startTime: '14:00',
          endTime: '16:00',
          status: 'confirmed' as const
        }
      ]
    };

    const staleProposal: AllocationProposal = {
      requestId: 'req_alex_capstone',
      studentName: 'Alex Rivera',
      projectTitle: 'Drone',
      strategy: 'exact-slot',
      assignments: [
        {
          resourceId: 'res_jetson_orin_01',
          resourceName: 'Jetson Orin',
          start: '14:00',
          end: '16:00'
        }
      ],
      score: 85,
      breakdown: { urgency: 80, fairShare: 90, waitAge: 85, total: 85 },
      alternatives: [],
      explanation: 'Stale slot assignment',
      aiAssisted: false
    };

    const result = applyAllocationProposals(scenarioWithCollision, [staleProposal]);
    expect(result.success).toBe(false);
    expect(result.code).toBe('STALE_CONFLICT');
  });

  it('transitions request to approved and creates a confirmed booking upon faculty approval', () => {
    const targetReqId = scenario.requests[0].id;
    const initialBookingCount = scenario.bookings.length;

    const result = applyFacultyDecision(scenario, {
      requestId: targetReqId,
      decision: 'approve',
      reason: 'Project verified with capstone advisor.'
    });

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('approved');
    expect(result.updatedScenario.bookings.length).toBe(initialBookingCount + 1);

    const newBooking = result.updatedScenario.bookings.find((b) => b.requestId === targetReqId);
    expect(newBooking).toBeDefined();
    expect(newBooking?.status).toBe('confirmed');
  });

  it('transitions request to rejected with recorded note upon faculty rejection', () => {
    const targetReqId = scenario.requests[1].id;
    const initialBookingCount = scenario.bookings.length;

    const result = applyFacultyDecision(scenario, {
      requestId: targetReqId,
      decision: 'reject',
      reason: 'Equipment overbooked for non-essential lab practice.'
    });

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('rejected');
    expect(result.data?.justification).toContain('[Faculty Note]: Equipment overbooked');
    // No new booking should be created
    expect(result.updatedScenario.bookings.length).toBe(initialBookingCount);
  });
});
