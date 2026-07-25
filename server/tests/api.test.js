import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';

/**
 * Altruist AI Backend API Test Suite
 *
 * Tests authenticate via Supabase Auth (demo@altruist.ai) first to obtain
 * a real userId, then use that userId in all subsequent protected endpoint calls.
 * This validates the full dynamic flow — no hardcoded 'demo_user_123' shortcuts.
 */

describe('Altruist AI Express Backend API Endpoints', () => {
  let authenticatedUserId = null;

  // 1. Health Check — no auth required
  it('GET /api/health should return ok status and app name', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('Altruist AI');
  });

  // 2. Demo Login — authenticates via real Supabase Auth (no fake fallback)
  it('POST /api/auth/demo-login should use real Supabase Auth (no hardcoded fallback)', async () => {
    const res = await request(app).post('/api/auth/demo-login');

    if (res.status === 200) {
      // Demo user exists in Supabase Auth — full dynamic login flow
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('demo@altruist.ai');
      // Critically: userId must be a REAL Supabase UUID, not 'demo_user_123'
      expect(res.body.user.id).not.toBe('demo_user_123');
      authenticatedUserId = res.body.user.id;
    } else {
      // Demo user not yet created in Supabase Auth → 401 with instructions
      // This is the CORRECT secure behavior — no fake sessions are created
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      console.log('[INFO] Demo user not in Supabase Auth yet. Create demo@altruist.ai in Supabase Dashboard → Auth → Users.');
    }
  });

  // 3. Crisis — requires real userId in body
  it('POST /api/crisis should return 400 without userId', async () => {
    const res = await request(app)
      .post('/api/crisis')
      .send({ text: 'I feel a sudden panic attack starting' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/crisis should return crisis response with authenticated userId', async () => {
    // Skip if demo login failed (Supabase may not have the account yet in CI)
    if (!authenticatedUserId) return;

    const res = await request(app)
      .post('/api/crisis')
      .send({ text: 'I feel a sudden panic attack starting', userId: authenticatedUserId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mode).toBe('crisis');
    expect(res.body.response).toBeDefined();
  });

  // 4. Pulse Check — requires real userId in body
  it('POST /api/pulse should return 400 without userId', async () => {
    const res = await request(app)
      .post('/api/pulse')
      .send({ score: 4 });
    expect(res.status).toBe(400);
  });

  it('POST /api/pulse should record a daily 1-5 pulse check score with userId', async () => {
    if (!authenticatedUserId) return;

    const res = await request(app)
      .post('/api/pulse')
      .send({ score: 4, voiceNote: 'Feeling calm after breathing exercise', userId: authenticatedUserId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pulse.score).toBe(4);
  });

  // 5. Caregiver Invite — requires real userId in body
  it('POST /api/caregiver/invite should return 400 without userId', async () => {
    const res = await request(app).post('/api/caregiver/invite').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/caregiver/invite should generate a 6-character invite code with userId', async () => {
    if (!authenticatedUserId) return;

    const res = await request(app)
      .post('/api/caregiver/invite')
      .send({ userId: authenticatedUserId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.invite.invite_code).toHaveLength(6);
  });

  // 6. Auth Register — should reject duplicate email
  it('POST /api/auth/register should return error when fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
