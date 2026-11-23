import { FAIRNESS_POLICY, ScoreBreakdown } from 'shared';

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export interface PriorityInput {
  deadlineIso: string;
  submittedAtIso: string;
  recentHoursOnResourceGroup: number;
  referenceDate?: Date;
}

/**
 * Computes deterministic priority score and breakdown according to the transparent demo policy.
 */
export function calculatePriorityScore(input: PriorityInput): {
  total: number;
  breakdown: ScoreBreakdown;
} {
  const now = input.referenceDate ? input.referenceDate.getTime() : Date.now();
  const deadlineTime = new Date(input.deadlineIso).getTime();
  const submittedTime = new Date(input.submittedAtIso).getTime();

  // Days until deadline
  const daysUntilDeadline = Math.max(0, (deadlineTime - now) / (1000 * 60 * 60 * 24));
  // Hours waiting since submission
  const hoursWaiting = Math.max(0, (now - submittedTime) / (1000 * 60 * 60));

  // Policy calculation
  const urgency = Math.round(
    100 * clamp(1 - daysUntilDeadline / FAIRNESS_POLICY.THRESHOLDS.MAX_DEADLINE_DAYS, 0, 1)
  );
  const fairShare = Math.round(
    100 * clamp(1 - input.recentHoursOnResourceGroup / FAIRNESS_POLICY.THRESHOLDS.MAX_SCARCE_HOURS, 0, 1)
  );
  const waitAge = Math.round(
    100 * clamp(hoursWaiting / FAIRNESS_POLICY.THRESHOLDS.MAX_WAIT_HOURS, 0, 1)
  );

  const total = Math.round(
    FAIRNESS_POLICY.WEIGHTS.URGENCY * urgency +
    FAIRNESS_POLICY.WEIGHTS.FAIR_SHARE * fairShare +
    FAIRNESS_POLICY.WEIGHTS.WAIT_AGE * waitAge
  );

  const breakdown: ScoreBreakdown = {
    urgency,
    fairShare,
    waitAge,
    total
  };

  return { total, breakdown };
}

/**
 * Deterministic tie-breaking comparator:
 * 1. Priority score descending
 * 2. Earlier submission timestamp ascending
 * 3. Stable request ID lexicographical ascending
 */
export function compareRequestsForPriority(
  a: { score: number; submittedAt: string; id: string },
  b: { score: number; submittedAt: string; id: string }
): number {
  if (b.score !== a.score) {
    return b.score - a.score;
  }
  const timeA = new Date(a.submittedAt).getTime();
  const timeB = new Date(b.submittedAt).getTime();
  if (timeA !== timeB) {
    return timeA - timeB;
  }
  return a.id.localeCompare(b.id);
}
