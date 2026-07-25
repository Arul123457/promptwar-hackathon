import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Altruist AI Express Backend API Endpoints', () => {
  it('GET /api/health should return ok status and app name', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.app).toBe('Altruist AI');
  });

  it('POST /api/auth/demo-login should return demo profile and credentials', async () => {
    const res = await request(app).post('/api/auth/demo-login');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('demo@altruist.ai');
    expect(res.body.profile).toBeDefined();
  });

  it('POST /api/crisis should return crisis response and log event', async () => {
    const res = await request(app)
      .post('/api/crisis')
      .send({ text: 'I feel a sudden panic attack starting' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.mode).toBe('crisis');
    expect(res.body.response).toBeDefined();
  });

  it('POST /api/pulse should record a daily 1-5 pulse check score', async () => {
    const res = await request(app)
      .post('/api/pulse')
      .send({ score: 4, voiceNote: 'Feeling calm after breathing exercise' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pulse.score).toBe(4);
  });

  it('POST /api/caregiver/invite should generate a 6-character invite code', async () => {
    const res = await request(app).post('/api/caregiver/invite').send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.invite.invite_code).toHaveLength(6);
  });
});
