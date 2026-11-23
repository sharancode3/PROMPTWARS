import { describe, it, expect } from 'vitest';
import { arbitrateSlotConflict } from '../src/domain/scheduler.js';
import { createSeedScenario } from 'shared';

describe('Scheduling Engine: Conflict Arbitration & Invariants', () => {
  const scenario = createSeedScenario(new Date('2026-11-23T12:00:00.000Z'));
  const jetsonResource = scenario.resources.find((r) => r.id === 'res_jetson_orin_01')!;

  const slot = {
    date: scenario.requests[0].requestedSlot.date,
    startTime: '14:00',
    endTime: '16:00'
  };

  const competingRequests = scenario.requests.filter(
    (r) => r.items[0]?.resourceId === 'res_jetson_orin_01'
  );

  it('never assigns overlapping slots to multiple conflicting requests', () => {
    const proposals = arbitrateSlotConflict({
      resource: jetsonResource,
      slot,
      requests: competingRequests,
      allResources: scenario.resources,
      allUsers: scenario.users,
      existingBookings: scenario.bookings,
      referenceDate: new Date('2026-11-23T12:00:00.000Z')
    });

    expect(proposals.length).toBe(competingRequests.length);

    // Only one exact-slot winner
    const exactWinners = proposals.filter((p) => p.strategy === 'exact-slot');
    expect(exactWinners.length).toBe(1);
    expect(exactWinners[0].assignments.length).toBe(1);
    expect(exactWinners[0].assignments[0].start).toBe('14:00');
    expect(exactWinners[0].assignments[0].end).toBe('16:00');

    // The other request receives alternatives, not a colliding exact assignment
    const displaced = proposals.filter((p) => p.strategy !== 'exact-slot');
    expect(displaced.length).toBe(1);
    expect(displaced[0].assignments.length).toBe(0);
    expect(displaced[0].alternatives.length).toBeGreaterThan(0);
  });

  it('produces 100% deterministic results across repeated runs with identical input', () => {
    const run1 = arbitrateSlotConflict({
      resource: jetsonResource,
      slot,
      requests: competingRequests,
      allResources: scenario.resources,
      allUsers: [scenario.currentUser],
      existingBookings: scenario.bookings,
      referenceDate: new Date('2026-11-23T12:00:00.000Z')
    });

    const run2 = arbitrateSlotConflict({
      resource: jetsonResource,
      slot,
      requests: competingRequests,
      allResources: scenario.resources,
      allUsers: [scenario.currentUser],
      existingBookings: scenario.bookings,
      referenceDate: new Date('2026-11-23T12:00:00.000Z')
    });

    expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
  });

  it('awards higher urgency capstone request priority over junior lab exercise', () => {
    const proposals = arbitrateSlotConflict({
      resource: jetsonResource,
      slot,
      requests: competingRequests,
      allResources: scenario.resources,
      allUsers: scenario.users,
      existingBookings: scenario.bookings,
      referenceDate: new Date('2026-11-23T12:00:00.000Z')
    });

    // Alex (Capstone, deadline in 3 days) vs Jordan (Coursework, deadline in 18 days)
    const winner = proposals.find((p) => p.strategy === 'exact-slot');
    expect(winner?.requestId).toBe('req_alex_capstone');
    expect(winner?.studentName).toBe('Alex Rivera');
  });
});
