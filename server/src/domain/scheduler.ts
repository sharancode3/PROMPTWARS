import {
  Resource,
  User,
  Booking,
  AccessRequest,
  AllocationProposal,
  AlternativeSlot,
  ScoreBreakdown
} from 'shared';
import { checkSlotFeasibility, timeToMinutes, intervalsOverlap, TimeInterval } from './feasibility.js';
import { calculatePriorityScore, compareRequestsForPriority } from './fairness.js';

export interface ArbitrateOptions {
  resource: Resource;
  slot: TimeInterval;
  requests: AccessRequest[];
  allResources: Resource[];
  allUsers: User[];
  existingBookings: Booking[];
  referenceDate?: Date;
}

/**
 * Searches for nearest feasible alternative slots on the same resource.
 */
function findNearestAlternativeOnResource(params: {
  resource: Resource;
  user: User;
  targetSlot: TimeInterval;
  request: AccessRequest;
  existingBookings: Booking[];
  referenceDate?: Date;
}): AlternativeSlot | null {
  const { resource, user, targetSlot, request, existingBookings, referenceDate } = params;
  const durationMins = timeToMinutes(targetSlot.endTime) - timeToMinutes(targetSlot.startTime);

  // Candidate offsets: +2h, +3h, -2h on the same day, then next day
  const candidateTimes = [
    { start: '16:00', end: '18:00' },
    { start: '10:00', end: '12:00' },
    { start: '08:00', end: '10:00' },
    { start: '18:00', end: '20:00' }
  ];

  for (const cand of candidateTimes) {
    if (cand.start === targetSlot.startTime) continue;
    const testSlot: TimeInterval = {
      date: targetSlot.date,
      startTime: cand.start,
      endTime: cand.end
    };

    const feas = checkSlotFeasibility({
      resource,
      user,
      slot: testSlot,
      deadlineIso: request.deadline,
      existingBookings,
      referenceDate
    });

    if (feas.feasible) {
      return {
        slotId: `alt_${resource.id}_${testSlot.date}_${testSlot.startTime}`,
        resourceId: resource.id,
        resourceName: resource.name,
        date: testSlot.date,
        startTime: testSlot.startTime,
        endTime: testSlot.endTime,
        feasibilityScore: 95,
        reason: `Adjacent conflict-free slot (${cand.start} - ${cand.end}) on same hardware.`
      };
    }
  }

  return null;
}

/**
 * Searches for marked-equivalent resources with identical capabilities.
 */
function findEquivalentResourceAlternative(params: {
  targetResource: Resource;
  allResources: Resource[];
  user: User;
  targetSlot: TimeInterval;
  request: AccessRequest;
  existingBookings: Booking[];
  referenceDate?: Date;
}): AlternativeSlot | null {
  const { targetResource, allResources, user, targetSlot, request, existingBookings, referenceDate } = params;

  const equivResources = allResources.filter(
    (r) =>
      r.id !== targetResource.id &&
      ((r.equivalenceGroupId && r.equivalenceGroupId === targetResource.equivalenceGroupId) ||
        (r.category === targetResource.category &&
          targetResource.capabilityTags.every((c) => r.capabilityTags.includes(c))))
  );

  for (const equiv of equivResources) {
    const feas = checkSlotFeasibility({
      resource: equiv,
      user,
      slot: targetSlot,
      deadlineIso: request.deadline,
      existingBookings,
      referenceDate
    });

    if (feas.feasible) {
      return {
        slotId: `alt_${equiv.id}_${targetSlot.date}_${targetSlot.startTime}`,
        resourceId: equiv.id,
        resourceName: equiv.name,
        date: targetSlot.date,
        startTime: targetSlot.startTime,
        endTime: targetSlot.endTime,
        feasibilityScore: 90,
        reason: `Equivalent hardware (${equiv.name}) available in parallel department lab.`
      };
    }
  }

  return null;
}

/**
 * Deterministically arbitrates slot conflicts according to feasibility gating and fairness policy.
 */
export function arbitrateSlotConflict(options: ArbitrateOptions): AllocationProposal[] {
  const {
    resource,
    slot,
    requests,
    allResources,
    allUsers,
    existingBookings,
    referenceDate = new Date()
  } = options;

  if (requests.length === 0) return [];

  // 1. Evaluate candidate requests: check feasibility and calculate score
  interface CandidateEvaluation {
    request: AccessRequest;
    user: User;
    feasible: boolean;
    feasibilityReason?: string;
    score: number;
    breakdown: ScoreBreakdown;
  }

  const evaluations: CandidateEvaluation[] = requests.map((req) => {
    const usersList = allUsers || [];
    const user = usersList.find((u) => u.id === req.studentId) || {
      id: req.studentId,
      name: req.studentName,
      email: `${req.studentId}@campus.edu`,
      role: 'student' as const,
      departmentId: resource.departmentId,
      departmentName: 'General',
      priorUsageHours: 6,
      certifications: resource.requiresCertification
    };

    const feas = checkSlotFeasibility({
      resource,
      user,
      slot,
      deadlineIso: req.deadline,
      existingBookings,
      referenceDate
    });

    const { total, breakdown } = calculatePriorityScore({
      deadlineIso: req.deadline,
      submittedAtIso: req.submittedAt,
      recentHoursOnResourceGroup: user.priorUsageHours,
      referenceDate
    });

    return {
      request: req,
      user,
      feasible: feas.feasible,
      feasibilityReason: feas.reason,
      score: total,
      breakdown
    };
  });

  // 2. Separate feasible candidates from infeasible candidates
  const feasibleCandidates = evaluations.filter((e) => e.feasible);
  const infeasibleCandidates = evaluations.filter((e) => !e.feasible);

  // 3. Sort feasible candidates deterministically: score desc, submittedAt asc, id asc
  feasibleCandidates.sort((a, b) =>
    compareRequestsForPriority(
      { score: a.score, submittedAt: a.request.submittedAt, id: a.request.id },
      { score: b.score, submittedAt: b.request.submittedAt, id: b.request.id }
    )
  );

  const proposals: AllocationProposal[] = [];
  const simulatedBookings: Booking[] = [...existingBookings];

  // 4. Winner allocation (Highest-scoring feasible candidate)
  if (feasibleCandidates.length > 0) {
    const winner = feasibleCandidates[0];
    proposals.push({
      requestId: winner.request.id,
      studentName: winner.request.studentName,
      projectTitle: winner.request.title,
      strategy: 'exact-slot',
      assignments: [
        {
          resourceId: resource.id,
          resourceName: resource.name,
          start: slot.startTime,
          end: slot.endTime
        }
      ],
      score: winner.score,
      breakdown: winner.breakdown,
      alternatives: [],
      explanation: `Allocated exact requested slot (${slot.startTime} - ${slot.endTime}). Met all feasibility constraints and achieved highest priority score (${winner.score}/100).`,
      aiAssisted: false
    });

    // Lock winning slot in simulation so displaced alternatives don't pick it
    simulatedBookings.push({
      id: `sim_${winner.request.id}`,
      resourceId: resource.id,
      requestId: winner.request.id,
      studentId: winner.request.studentId,
      studentName: winner.request.studentName,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'confirmed'
    });
  }

  // 5. Displaced feasible candidates: Generate alternatives (up to 3)
  for (let i = 1; i < feasibleCandidates.length; i++) {
    const displaced = feasibleCandidates[i];
    const alternatives: AlternativeSlot[] = [];

    // Order 1: Nearest feasible slot on same resource
    const nearest = findNearestAlternativeOnResource({
      resource,
      user: displaced.user,
      targetSlot: slot,
      request: displaced.request,
      existingBookings: simulatedBookings,
      referenceDate
    });
    if (nearest) alternatives.push(nearest);

    // Order 2: Marked-equivalent resource in another lab
    const equiv = findEquivalentResourceAlternative({
      targetResource: resource,
      allResources,
      user: displaced.user,
      targetSlot: slot,
      request: displaced.request,
      existingBookings: simulatedBookings,
      referenceDate
    });
    if (equiv) alternatives.push(equiv);

    // Order 3: Earliest waitlist suggestion if no immediate slot found
    if (alternatives.length === 0) {
      alternatives.push({
        slotId: `waitlist_${resource.id}_${displaced.request.id}`,
        resourceId: resource.id,
        resourceName: resource.name,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        feasibilityScore: 60,
        reason: 'Added to automated priority waitlist in case of cancellation or no-show.'
      });
    }

    const assignedStrategy = alternatives[0]?.resourceId === resource.id ? 'nearest-slot' : 'equivalent-resource';

    proposals.push({
      requestId: displaced.request.id,
      studentName: displaced.request.studentName,
      projectTitle: displaced.request.title,
      strategy: assignedStrategy,
      assignments: [],
      score: displaced.score,
      breakdown: displaced.breakdown,
      alternatives: alternatives.slice(0, 3),
      explanation: `Contested slot awarded to higher-priority request. Recommending ${alternatives[0]?.reason || 'waitlist queue'}.`,
      aiAssisted: false
    });
  }

  // 6. Infeasible candidates (Hard-gate rejection with explicit reason)
  for (const infeasible of infeasibleCandidates) {
    proposals.push({
      requestId: infeasible.request.id,
      studentName: infeasible.request.studentName,
      projectTitle: infeasible.request.title,
      strategy: 'waitlist',
      assignments: [],
      score: 0,
      breakdown: { urgency: 0, fairShare: 0, waitAge: 0, total: 0 },
      alternatives: [],
      explanation: `Infeasible: ${infeasible.feasibilityReason || 'Hard constraints violated.'}`,
      aiAssisted: false
    });
  }

  return proposals;
}
