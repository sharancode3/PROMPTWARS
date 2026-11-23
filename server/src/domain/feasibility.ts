import { Resource, User, Booking } from 'shared';

export interface TimeInterval {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
}

/**
 * Converts a time string "HH:MM" into minutes since midnight.
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Converts minutes since midnight back into "HH:MM".
 */
export function minutesToTime(minutes: number): number {
  return minutes;
}

/**
 * Checks if two intervals overlap using half-open intervals: [startA, endA) and [startB, endB).
 * Intervals on different dates never overlap.
 * Adjacent intervals where endA === startB DO NOT overlap.
 */
export function intervalsOverlap(
  aDate: string,
  aStart: string,
  aEnd: string,
  bDate: string,
  bStart: string,
  bEnd: string,
  bufferMinutes: number = 0
): boolean {
  if (aDate !== bDate) return false;

  const startA = timeToMinutes(aStart);
  const endA = timeToMinutes(aEnd) + bufferMinutes;
  const startB = timeToMinutes(bStart);
  const endB = timeToMinutes(bEnd) + bufferMinutes;

  // Half-open interval collision: startA < endB && startB < endA
  return startA < endB && startB < endA;
}

export interface FeasibilityResult {
  feasible: boolean;
  reason?: string;
  code?: 'CAPABILITY_MISMATCH' | 'MAINTENANCE' | 'OUT_OF_HOURS' | 'CERTIFICATION_MISSING' | 'DURATION_EXCEEDED' | 'DEADLINE_PASSED' | 'SLOT_COLLISION';
}

/**
 * Validates hard feasibility constraints before prioritization.
 */
export function checkSlotFeasibility(params: {
  resource: Resource;
  user: User;
  slot: TimeInterval;
  deadlineIso: string;
  existingBookings: Booking[];
  requiredCapabilities?: string[];
  referenceDate?: Date;
}): FeasibilityResult {
  const { resource, user, slot, deadlineIso, existingBookings, requiredCapabilities = [] } = params;

  // 1. Check capability match (if specified)
  if (requiredCapabilities.length > 0) {
    const hasAll = requiredCapabilities.every((cap) =>
      resource.capabilityTags.includes(cap as any)
    );
    if (!hasAll) {
      return {
        feasible: false,
        code: 'CAPABILITY_MISMATCH',
        reason: `Resource ${resource.name} lacks required capabilities: ${requiredCapabilities.join(', ')}`
      };
    }
  }

  // 2. Resource maintenance status check
  if (resource.status === 'maintenance') {
    return {
      feasible: false,
      code: 'MAINTENANCE',
      reason: `Resource ${resource.name} is currently offline for maintenance.`
    };
  }

  // 3. Operating hours check (08:00 to 20:00)
  const slotStartMins = timeToMinutes(slot.startTime);
  const slotEndMins = timeToMinutes(slot.endTime);
  const openMins = timeToMinutes(resource.operatingHours.open);
  const closeMins = timeToMinutes(resource.operatingHours.close);

  if (slotStartMins < openMins || slotEndMins > closeMins || slotStartMins >= slotEndMins) {
    return {
      feasible: false,
      code: 'OUT_OF_HOURS',
      reason: `Requested time [${slot.startTime}, ${slot.endTime}) falls outside lab operating hours (${resource.operatingHours.open} - ${resource.operatingHours.close}).`
    };
  }

  // 4. Safety & certification prerequisites check
  if (resource.requiresCertification.length > 0) {
    const missingCerts = resource.requiresCertification.filter(
      (cert) => !user.certifications.includes(cert)
    );
    if (missingCerts.length > 0) {
      return {
        feasible: false,
        code: 'CERTIFICATION_MISSING',
        reason: `Student lacks mandatory safety certifications: ${missingCerts.join(', ')}`
      };
    }
  }

  // 5. Duration limit check
  const durationMins = slotEndMins - slotStartMins;
  if (durationMins > resource.maxSessionMinutes) {
    return {
      feasible: false,
      code: 'DURATION_EXCEEDED',
      reason: `Requested duration of ${durationMins} minutes exceeds maximum allowed session of ${resource.maxSessionMinutes} minutes.`
    };
  }

  // 6. Deadline feasibility: slot must end before the project deadline
  const slotEndIso = `${slot.date}T${slot.endTime}:00.000Z`;
  if (new Date(slotEndIso).getTime() > new Date(deadlineIso).getTime()) {
    return {
      feasible: false,
      code: 'DEADLINE_PASSED',
      reason: `Requested slot ends at ${slot.endTime} on ${slot.date}, which is after project deadline ${deadlineIso}.`
    };
  }

  // 7. No-overlap with existing confirmed/held bookings (half-open [start, end) with buffer)
  const collidingBooking = existingBookings.find(
    (b) =>
      b.resourceId === resource.id &&
      b.status !== 'cancelled' &&
      intervalsOverlap(
        slot.date,
        slot.startTime,
        slot.endTime,
        b.date,
        b.startTime,
        b.endTime,
        resource.bufferMinutes
      )
  );

  if (collidingBooking) {
    return {
      feasible: false,
      code: 'SLOT_COLLISION',
      reason: `Slot [${slot.startTime}, ${slot.endTime}) collides with confirmed booking (${collidingBooking.startTime} - ${collidingBooking.endTime}) on ${resource.name}.`
    };
  }

  return { feasible: true };
}
