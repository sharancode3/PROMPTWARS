import { describe, it, expect } from 'vitest';
import { createSeedScenario, DemoScenarioSchema } from '../src/index.js';

describe('Shared Seed Scenario & Schema', () => {
  it('creates a valid DemoScenario matching DemoScenarioSchema', () => {
    const fixedDate = new Date('2026-11-23T12:00:00.000Z');
    const scenario = createSeedScenario(fixedDate);
    
    // Validate against Zod schema
    const parsed = DemoScenarioSchema.safeParse(scenario);
    expect(parsed.success).toBe(true);

    // Verify departments
    expect(scenario.departments.length).toBe(4);
    expect(scenario.labs?.length).toBe(6);
    expect(scenario.resources.length).toBe(12);
    expect(scenario.projects?.length).toBe(5);
    expect(scenario.requests.length).toBe(3);
    expect(scenario.bookings.length).toBe(1);

    // Verify contested scenario exists
    const jetsonRequests = scenario.requests.filter(
      (r) => r.items[0]?.resourceId === 'res_jetson_orin_01'
    );
    expect(jetsonRequests.length).toBe(2);

    // Verify half-open slot equality
    expect(jetsonRequests[0].requestedSlot.date).toBe(jetsonRequests[1].requestedSlot.date);
    expect(jetsonRequests[0].requestedSlot.startTime).toBe(jetsonRequests[1].requestedSlot.startTime);
  });
});
