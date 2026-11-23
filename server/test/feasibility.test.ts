import { describe, it, expect } from 'vitest';
import { intervalsOverlap, checkSlotFeasibility, timeToMinutes } from '../src/domain/feasibility.js';
import { Resource, User, Booking } from 'shared';

describe('Feasibility Engine: Interval Math & Boundaries', () => {
  it('handles half-open intervals [start, end) where adjacent slots do not collide', () => {
    // Slot 1: [14:00, 16:00), Slot 2: [16:00, 18:00) on same date
    const overlaps = intervalsOverlap('2026-11-25', '14:00', '16:00', '2026-11-25', '16:00', '18:00', 0);
    expect(overlaps).toBe(false);
  });

  it('detects collisions when intervals overlap', () => {
    // Slot 1: [14:00, 16:00), Slot 2: [15:00, 17:00)
    const overlaps = intervalsOverlap('2026-11-25', '14:00', '16:00', '2026-11-25', '15:00', '17:00', 0);
    expect(overlaps).toBe(true);
  });

  it('enforces buffer minutes between consecutive sessions', () => {
    // With 15 min buffer on Slot 1: [14:00, 16:00 + 15m), Slot 2 starts at 16:10
    const overlapsWithBuffer = intervalsOverlap('2026-11-25', '14:00', '16:00', '2026-11-25', '16:10', '18:00', 15);
    expect(overlapsWithBuffer).toBe(true);

    const safeWithBuffer = intervalsOverlap('2026-11-25', '14:00', '16:00', '2026-11-25', '16:15', '18:00', 15);
    expect(safeWithBuffer).toBe(false);
  });
});

describe('Feasibility Engine: Hard Constraint Gates', () => {
  const mockResource: Resource = {
    id: 'res_test',
    name: 'Precision Test Rig',
    departmentId: 'dept_ece',
    category: 'instrumentation',
    capabilityTags: ['signal-measurement', 'oscilloscope-high-speed'],
    location: 'Lab 101',
    description: 'Test instrument',
    requiresCertification: ['LASER_SAFETY_L1'],
    maxSessionMinutes: 120,
    bufferMinutes: 15,
    operatingHours: { open: '08:00', close: '20:00' },
    status: 'available',
    specs: {}
  };

  const mockUser: User = {
    id: 'user_1',
    name: 'Test Student',
    email: 'student@campus.edu',
    role: 'student',
    departmentId: 'dept_ece',
    departmentName: 'ECE',
    priorUsageHours: 0,
    certifications: ['LASER_SAFETY_L1']
  };

  it('rejects candidate if resource is in maintenance', () => {
    const maintenanceResource = { ...mockResource, status: 'maintenance' as const };
    const result = checkSlotFeasibility({
      resource: maintenanceResource,
      user: mockUser,
      slot: { date: '2026-11-25', startTime: '10:00', endTime: '12:00' },
      deadlineIso: '2026-11-30T17:00:00.000Z',
      existingBookings: []
    });

    expect(result.feasible).toBe(false);
    expect(result.code).toBe('MAINTENANCE');
  });

  it('rejects candidate outside operating hours', () => {
    // Before 08:00
    const early = checkSlotFeasibility({
      resource: mockResource,
      user: mockUser,
      slot: { date: '2026-11-25', startTime: '07:00', endTime: '09:00' },
      deadlineIso: '2026-11-30T17:00:00.000Z',
      existingBookings: []
    });
    expect(early.feasible).toBe(false);
    expect(early.code).toBe('OUT_OF_HOURS');

    // After 20:00
    const late = checkSlotFeasibility({
      resource: mockResource,
      user: mockUser,
      slot: { date: '2026-11-25', startTime: '19:00', endTime: '21:00' },
      deadlineIso: '2026-11-30T17:00:00.000Z',
      existingBookings: []
    });
    expect(late.feasible).toBe(false);
    expect(late.code).toBe('OUT_OF_HOURS');
  });

  it('rejects candidate when user lacks required certification', () => {
    const uncertifiedUser: User = { ...mockUser, certifications: [] };
    const result = checkSlotFeasibility({
      resource: mockResource,
      user: uncertifiedUser,
      slot: { date: '2026-11-25', startTime: '10:00', endTime: '12:00' },
      deadlineIso: '2026-11-30T17:00:00.000Z',
      existingBookings: []
    });

    expect(result.feasible).toBe(false);
    expect(result.code).toBe('CERTIFICATION_MISSING');
  });

  it('rejects candidate when required capability is missing', () => {
    const result = checkSlotFeasibility({
      resource: mockResource,
      user: mockUser,
      slot: { date: '2026-11-25', startTime: '10:00', endTime: '12:00' },
      deadlineIso: '2026-11-30T17:00:00.000Z',
      existingBookings: [],
      requiredCapabilities: ['cnc-milling'] // Resource does not have cnc-milling
    });

    expect(result.feasible).toBe(false);
    expect(result.code).toBe('CAPABILITY_MISMATCH');
  });

  it('rejects candidate when slot completes after project deadline', () => {
    const result = checkSlotFeasibility({
      resource: mockResource,
      user: mockUser,
      slot: { date: '2026-11-28', startTime: '14:00', endTime: '16:00' },
      deadlineIso: '2026-11-27T17:00:00.000Z', // Deadline was yesterday
      existingBookings: []
    });

    expect(result.feasible).toBe(false);
    expect(result.code).toBe('DEADLINE_PASSED');
  });

  it('rejects candidate that collides with confirmed booking', () => {
    const existingBookings: Booking[] = [
      {
        id: 'book_1',
        resourceId: 'res_test',
        studentId: 'other_user',
        studentName: 'Other Student',
        date: '2026-11-25',
        startTime: '10:00',
        endTime: '12:00',
        status: 'confirmed'
      }
    ];

    const result = checkSlotFeasibility({
      resource: mockResource,
      user: mockUser,
      slot: { date: '2026-11-25', startTime: '11:00', endTime: '13:00' },
      deadlineIso: '2026-11-30T17:00:00.000Z',
      existingBookings
    });

    expect(result.feasible).toBe(false);
    expect(result.code).toBe('SLOT_COLLISION');
  });
});
