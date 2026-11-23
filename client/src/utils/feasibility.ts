import { Resource, User, Booking } from 'shared';

export interface TimeInterval {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

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

  return startA < endB && startB < endA;
}

export interface FeasibilityResult {
  feasible: boolean;
  reason?: string;
  code?: 'CAPABILITY_MISMATCH' | 'MAINTENANCE' | 'OUT_OF_HOURS' | 'CERTIFICATION_MISSING' | 'DURATION_EXCEEDED' | 'DEADLINE_PASSED' | 'SLOT_COLLISION';
}

export function checkSlotFeasibility(params: {
  resource: Resource;
  user: User;
  slot: TimeInterval;
  deadlineIso?: string;
  existingBookings: Booking[];
  requiredCapabilities?: string[];
}): FeasibilityResult {
  const { resource, user, slot, deadlineIso, existingBookings, requiredCapabilities = [] } = params;

  // 1. Capability match check
  if (requiredCapabilities.length > 0) {
    const hasAll = requiredCapabilities.every((cap) =>
      (resource.capabilityTags as readonly string[]).includes(cap)
    );
    if (!hasAll) {
      return {
        feasible: false,
        code: 'CAPABILITY_MISMATCH',
        reason: `Resource lacks required capabilities: ${requiredCapabilities.join(', ')}`
      };
    }
  }

  // 2. Maintenance status check
  if (resource.status === 'maintenance') {
    return {
      feasible: false,
      code: 'MAINTENANCE',
      reason: `Resource ${resource.name} is currently offline for maintenance.`
    };
  }

  // 2. Operating hours check
  const slotStartMins = timeToMinutes(slot.startTime);
  const slotEndMins = timeToMinutes(slot.endTime);
  const openMins = timeToMinutes(resource.operatingHours.open);
  const closeMins = timeToMinutes(resource.operatingHours.close);

  if (slotStartMins < openMins || slotEndMins > closeMins || slotStartMins >= slotEndMins) {
    return {
      feasible: false,
      code: 'OUT_OF_HOURS',
      reason: `Slot [${slot.startTime}, ${slot.endTime}) falls outside operating hours (${resource.operatingHours.open} - ${resource.operatingHours.close}).`
    };
  }

  // 3. Safety certification prerequisites check
  if (resource.requiresCertification && resource.requiresCertification.length > 0) {
    const missingCerts = resource.requiresCertification.filter(
      (cert) => !user.certifications || !user.certifications.includes(cert)
    );
    if (missingCerts.length > 0) {
      return {
        feasible: false,
        code: 'CERTIFICATION_MISSING',
        reason: `User lacks required safety certification: ${missingCerts.join(', ')}`
      };
    }
  }

  // 4. Duration limit check
  const durationMins = slotEndMins - slotStartMins;
  if (durationMins > resource.maxSessionMinutes) {
    return {
      feasible: false,
      code: 'DURATION_EXCEEDED',
      reason: `Slot duration (${durationMins}m) exceeds max session length (${resource.maxSessionMinutes}m).`
    };
  }

  // 5. Deadline check (if provided)
  if (deadlineIso) {
    const slotEndIso = `${slot.date}T${slot.endTime}:00.000Z`;
    if (new Date(slotEndIso).getTime() > new Date(deadlineIso).getTime()) {
      return {
        feasible: false,
        code: 'DEADLINE_PASSED',
        reason: `Slot ends after project deadline ${deadlineIso}.`
      };
    }
  }

  // 6. Confirmed booking collisions with buffer
  const collidingBooking = existingBookings.find(
    (b) =>
      b.resourceId === resource.id &&
      b.status !== 'cancelled' &&
      b.status !== 'no-show' &&
      intervalsOverlap(
        slot.date,
        slot.startTime,
        slot.endTime,
        b.date,
        b.startTime,
        b.endTime,
        resource.bufferMinutes || 0
      )
  );

  if (collidingBooking) {
    return {
      feasible: false,
      code: 'SLOT_COLLISION',
      reason: `Collides with confirmed session (${collidingBooking.startTime} - ${collidingBooking.endTime}) on ${resource.name}.`
    };
  }

  return { feasible: true };
}
