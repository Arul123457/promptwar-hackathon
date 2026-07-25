/**
 * Application Constants for Altruist AI Backend
 */

export const GROQ_MODELS = {
  // Ultra-low latency model for high-stress crisis grounding
  CRISIS: 'llama-3.1-8b-instant',
  // High-capacity reasoning model for caregiver coaching and educational Q&A
  REASONING: 'llama-3.3-70b-versatile'
};

export const TABLES = {
  PROFILES: 'profiles',
  CRISIS_EVENTS: 'crisis_events',
  PULSE_CHECKS: 'pulse_checks',
  CAREGIVER_LINKS: 'caregiver_links',
  CAREGIVER_TIPS: 'caregiver_tips'
};

export const ROUTES = {
  HEALTH: '/api/health',
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  DEMO_LOGIN: '/api/auth/demo-login',
  ONBOARDING: '/api/onboarding',
  CRISIS: '/api/crisis',
  PULSE: '/api/pulse',
  INVITE: '/api/caregiver/invite',
  CAREGIVER_TIP: '/api/caregiver-tip',
  PATIENT_TRENDS: '/api/caregiver/patient-trends',
  LEARN_QUERY: '/api/learn/query'
};

export const TIMEOUTS = {
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
  RATE_LIMIT_MAX: 60
};
