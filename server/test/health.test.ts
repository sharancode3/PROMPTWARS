import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('GET /api/v1/healthz', () => {
  it('should return status ok and HTTP 200', async () => {
    const res = await request(app).get('/api/v1/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('lablink-api');
    expect(res.body.timestamp).toBeDefined();
  });
});
