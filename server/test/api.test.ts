import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { createSeedScenario } from 'shared';

describe('Server API Endpoints (/api/v1/*)', () => {
  const seed = createSeedScenario(new Date('2026-11-23T12:00:00.000Z'));

  it('GET /api/v1/healthz returns healthy status with Asia/Kolkata timezone', async () => {
    const res = await request(app).get('/api/v1/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timeZone).toBe('Asia/Kolkata');
    expect(res.body.version).toBe('1.0.0');
  });

  it('GET /api/v1/resources returns full catalog and supports filtering', async () => {
    const resAll = await request(app).get('/api/v1/resources');
    expect(resAll.status).toBe(200);
    expect(Array.isArray(resAll.body)).toBe(true);
    expect(resAll.body.length).toBe(10);

    const resMech = await request(app).get('/api/v1/resources?department=dept_mech');
    expect(resMech.status).toBe(200);
    expect(resMech.body.every((r: { departmentId: string }) => r.departmentId === 'dept_mech')).toBe(true);
  });

  it('GET /api/v1/resources/:id returns individual resource or 404', async () => {
    const res = await request(app).get('/api/v1/resources/res_jetson_orin_01');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('res_jetson_orin_01');
    expect(res.body.name).toContain('NVIDIA Jetson AGX Orin');

    const resNotFound = await request(app).get('/api/v1/resources/res_non_existent');
    expect(resNotFound.status).toBe(404);
  });

  it('GET /api/v1/resources/:id/availability returns daily grid slots', async () => {
    const testDate = seed.requests[0].requestedSlot.date;
    const res = await request(app).get(`/api/v1/resources/res_jetson_orin_01/availability?date=${testDate}`);
    expect(res.status).toBe(200);
    expect(res.body.resourceId).toBe('res_jetson_orin_01');
    expect(Array.isArray(res.body.bookedSlots)).toBe(true);
  });

  it('POST /api/v1/ai/match performs capability extraction with fallback', async () => {
    const res = await request(app)
      .post('/api/v1/ai/match')
      .send({
        projectPrompt: 'Need to analyze digital bus signals on an FPGA at 500MHz.'
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.source).toBeDefined();
    expect(Array.isArray(res.body.matchedCapabilities)).toBe(true);
    expect(res.body.matchedCapabilities.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/requests submits a new project access request', async () => {
    const newReq = {
      id: 'req_test_001',
      projectId: 'proj_test_001',
      studentId: 'user_alex',
      studentName: 'Alex Rivera',
      advisorId: 'user_radhika',
      title: 'Real-Time Edge Testing',
      justification: 'Senior Capstone testing pipeline',
      items: [
        {
          resourceId: 'res_jetson_orin_01',
          capabilityNeed: 'edge-ai',
          minutes: 120
        }
      ],
      requestedSlot: {
        date: seed.requests[0].requestedSlot.date,
        startTime: '10:00',
        endTime: '12:00'
      },
      deadline: seed.requests[0].deadline,
      flexibility: 0.5,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };

    const res = await request(app)
      .post('/api/v1/requests')
      .send({
        request: newReq,
        snapshot: seed
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.createdRequest.id).toBe('req_test_001');
    expect(res.body.updatedSnapshot.requests.some((r: { id: string }) => r.id === 'req_test_001')).toBe(true);
  });

  it('POST /api/v1/requests/query filters requests by role and user', async () => {
    const res = await request(app)
      .post('/api/v1/requests/query')
      .send({
        role: 'student',
        userId: 'user_alex',
        snapshot: seed
      });

    expect(res.status).toBe(200);
    expect(res.body.requests.every((r: { studentId: string }) => r.studentId === 'user_alex')).toBe(true);
  });

  it('POST /api/v1/scheduling/arbitrate returns conflict resolution proposals', async () => {
    const targetSlot = seed.requests[0].requestedSlot;

    const res = await request(app)
      .post('/api/v1/scheduling/arbitrate')
      .send({
        resourceId: 'res_jetson_orin_01',
        date: targetSlot.date,
        slot: {
          startTime: targetSlot.startTime,
          endTime: targetSlot.endTime
        },
        snapshot: seed
      });

    expect(res.status).toBe(200);
    expect(res.body.hasConflict).toBe(true);
    expect(res.body.proposals.length).toBeGreaterThanOrEqual(2);

    const winner = res.body.proposals.find((p: { strategy: string }) => p.strategy === 'exact-slot');
    expect(winner).toBeDefined();
    expect(winner.score).toBeGreaterThan(0);
  });

  it('POST /api/v1/scheduling/apply applies proposals to under-review status', async () => {
    const targetSlot = seed.requests[0].requestedSlot;

    // First arbitrate
    const arbRes = await request(app)
      .post('/api/v1/scheduling/arbitrate')
      .send({
        resourceId: 'res_jetson_orin_01',
        date: targetSlot.date,
        slot: {
          startTime: targetSlot.startTime,
          endTime: targetSlot.endTime
        },
        snapshot: seed
      });

    // Then apply
    const applyRes = await request(app)
      .post('/api/v1/scheduling/apply')
      .send({
        appliedProposals: arbRes.body.proposals,
        snapshot: seed
      });

    expect(applyRes.status).toBe(200);
    expect(applyRes.body.success).toBe(true);
    expect(applyRes.body.appliedCount).toBeGreaterThanOrEqual(1);
    expect(
      applyRes.body.updatedSnapshot.requests.some(
        (r: { status: string }) => r.status === 'under-review'
      )
    ).toBe(true);
  });

  it('POST /api/v1/approvals/decide records faculty approval and creates booking', async () => {
    const targetReq = seed.requests[0];

    const res = await request(app)
      .post('/api/v1/approvals/decide')
      .send({
        decision: {
          requestId: targetReq.id,
          decision: 'approve',
          reason: 'Meets capstone requirements and all safety checks pass.'
        },
        snapshot: seed
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.updatedSnapshot.requests.find((r: { id: string }) => r.id === targetReq.id).status).toBe('approved');
    expect(res.body.updatedSnapshot.bookings.some((b: { requestId?: string }) => b.requestId === targetReq.id)).toBe(true);
  });

  it('POST /api/v1/demo/reset generates a fresh seeded scenario', async () => {
    const res = await request(app).post('/api/v1/demo/reset');
    expect(res.status).toBe(200);
    expect(res.body.departments.length).toBe(3);
    expect(res.body.resources.length).toBe(10);
  });
});
