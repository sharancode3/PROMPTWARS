import { describe, it, expect } from 'vitest';
import { calculatePriorityScore, compareRequestsForPriority } from '../src/domain/fairness.js';

describe('Fairness Engine: Transparent Policy Scoring', () => {
  const refDate = new Date('2026-11-23T12:00:00.000Z');

  it('awards higher urgency to imminent project deadlines', () => {
    // Request A: Deadline in 2 days
    const scoreUrgent = calculatePriorityScore({
      deadlineIso: '2026-11-25T12:00:00.000Z',
      submittedAtIso: '2026-11-23T10:00:00.000Z',
      recentHoursOnResourceGroup: 0,
      referenceDate: refDate
    });

    // Request B: Deadline in 25 days
    const scoreRelaxed = calculatePriorityScore({
      deadlineIso: '2026-12-18T12:00:00.000Z', // Far away deadline
      submittedAtIso: '2026-11-23T10:00:00.000Z',
      recentHoursOnResourceGroup: 0,
      referenceDate: refDate
    });

    expect(scoreUrgent.breakdown.urgency).toBeGreaterThan(scoreRelaxed.breakdown.urgency);
    expect(scoreUrgent.total).toBeGreaterThan(scoreRelaxed.total);
  });

  it('rewards students with lower prior usage of scarce hardware', () => {
    // Student with 0 prior hours
    const freshUser = calculatePriorityScore({
      deadlineIso: '2026-11-28T12:00:00.000Z',
      submittedAtIso: '2026-11-23T10:00:00.000Z',
      recentHoursOnResourceGroup: 0,
      referenceDate: refDate
    });

    // Student with 12 prior hours (heavy user)
    const heavyUser = calculatePriorityScore({
      deadlineIso: '2026-11-28T12:00:00.000Z',
      submittedAtIso: '2026-11-23T10:00:00.000Z',
      recentHoursOnResourceGroup: 12,
      referenceDate: refDate
    });

    expect(freshUser.breakdown.fairShare).toBe(100);
    expect(heavyUser.breakdown.fairShare).toBe(0);
    expect(freshUser.total).toBeGreaterThan(heavyUser.total);
  });

  it('awards aging boost to older waiting requests to prevent starvation', () => {
    // Submitted 48 hours ago
    const older = calculatePriorityScore({
      deadlineIso: '2026-11-30T12:00:00.000Z',
      submittedAtIso: '2026-11-21T12:00:00.000Z',
      recentHoursOnResourceGroup: 4,
      referenceDate: refDate
    });

    // Submitted 1 hour ago
    const recent = calculatePriorityScore({
      deadlineIso: '2026-11-30T12:00:00.000Z',
      submittedAtIso: '2026-11-23T11:00:00.000Z',
      recentHoursOnResourceGroup: 4,
      referenceDate: refDate
    });

    expect(older.breakdown.waitAge).toBeGreaterThan(recent.breakdown.waitAge);
  });

  it('breaks ties deterministically by submission timestamp, then request ID', () => {
    const list = [
      { score: 80, submittedAt: '2026-11-23T10:00:00.000Z', id: 'req_b' },
      { score: 90, submittedAt: '2026-11-23T12:00:00.000Z', id: 'req_c' },
      { score: 80, submittedAt: '2026-11-23T08:00:00.000Z', id: 'req_a' },
      { score: 80, submittedAt: '2026-11-23T10:00:00.000Z', id: 'req_alpha' }
    ];

    list.sort(compareRequestsForPriority);

    // Highest score first (90)
    expect(list[0].id).toBe('req_c');
    // Among score 80, earlier submittedAt (08:00 vs 10:00)
    expect(list[1].id).toBe('req_a');
    // Among same score and same timestamp, lexicographical ID (req_alpha before req_b)
    expect(list[2].id).toBe('req_alpha');
    expect(list[3].id).toBe('req_b');
  });
});
