import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

/**
 * Altruist AI Backend API Test Suite
 * Asserts standardized response envelope shape: { success: boolean, data: any, error: string | null }
 * Tests Zod request payload validation layer & endpoint status codes.
 */

describe('Altruist AI Express Backend API Endpoints & Validation Suite', () => {
  let authenticatedUserId = null;

  // 1. Standardized Envelope & Health Check
  it('GET /api/health should return 200 with standard response envelope shape', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('error', null);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.app).toBe('Altruist AI');
  });

  // 2. Demo Auth Endpoint
  it('POST /api/auth/demo-login should return valid response envelope', async () => {
    const res = await request(app).post('/api/auth/demo-login');
    expect([200, 401]).toContain(res.status);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('error');

    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('demo@altruist.ai');
      authenticatedUserId = res.body.data.id;
    } else {
      expect(res.body.success).toBe(false);
      expect(typeof res.body.error).toBe('string');
    }
  });

  // 3. Zod Input Validation Tests
  describe('Zod Input Validation Layer', () => {
    it('POST /api/auth/register should return 400 on malformed email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: '123' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('email');
    });

    it('POST /api/crisis should return 400 when userId is missing', async () => {
      const res = await request(app)
        .post('/api/crisis')
        .send({ text: 'Experiencing craving surge' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('userId');
    });

    it('POST /api/pulse should return 400 when score is out of bounds (> 5)', async () => {
      const res = await request(app)
        .post('/api/pulse')
        .send({ userId: 'user_123', score: 10 });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Score must be an integer');
    });

    it('POST /api/caregiver/invite should return 400 without userId', async () => {
      const res = await request(app).post('/api/caregiver/invite').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/caregiver-tip should return 400 without userId', async () => {
      const res = await request(app).post('/api/caregiver-tip').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/caregiver/patient-trends should return 400 without userId query param', async () => {
      const res = await request(app).get('/api/caregiver/patient-trends');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // 4. Authenticated Protected Endpoints
  describe('Protected Endpoints (with User Session)', () => {
    const testUserId = 'test_uuid_user_123';

    it('POST /api/crisis should return standardized recovery grounding response', async () => {
      const res = await request(app)
        .post('/api/crisis')
        .send({ userId: testUserId, text: 'Experiencing intense craving surge' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('response');
      expect(res.body.data.mode).toBe('crisis');
    });

    it('POST /api/pulse should record pulse entry in envelope shape', async () => {
      const res = await request(app)
        .post('/api/pulse')
        .send({ userId: testUserId, score: 4, voiceNote: 'Feeling steady after meeting' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.pulse.score).toBe(4);
    });

    it('POST /api/caregiver/invite should generate 6-char invite code', async () => {
      const res = await request(app)
        .post('/api/caregiver/invite')
        .send({ userId: testUserId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invite.invite_code).toHaveLength(6);
    });

    it('POST /api/caregiver-tip should return AI caregiver guidance', async () => {
      const res = await request(app)
        .post('/api/caregiver-tip')
        .send({ userId: testUserId, query: 'How to support loved one experiencing withdrawal' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('guidance');
    });

    it('GET /api/caregiver/patient-trends should return patient trend history', async () => {
      const res = await request(app)
        .get(`/api/caregiver/patient-trends?userId=${testUserId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('recentCrises');
    });

    it('POST /api/learn/query should return educational recovery response', async () => {
      const res = await request(app)
        .post('/api/learn/query')
        .send({ query: 'What are the three stages of relapse?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('content');
    });
  });
});
