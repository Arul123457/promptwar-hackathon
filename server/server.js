import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Groq } from 'groq-sdk';
import { dbService, isSupabaseConfigured } from './config/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// Security Controls
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy check failed'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Please wait a moment.' }
});

app.use('/api/', apiLimiter);

// Groq Client Initialization
let groqClient = null;
const isGroqConfigured = Boolean(GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here');

if (isGroqConfigured) {
  try {
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
  } catch (err) {
    console.warn('Groq initialization warning:', err.message);
  }
}

async function generateGroqCompletion(systemPrompt, userPrompt, fallbackText) {
  if (!groqClient) return fallbackText;
  try {
    const completion = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 450,
    });
    return completion.choices[0]?.message?.content?.trim() || fallbackText;
  } catch (error) {
    console.error('Groq Execution Error:', error.message);
    return fallbackText;
  }
}

function sanitizeInput(str, maxLen = 1000) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

// ----------------------------------------------------
// Altruist AI Backend Endpoints
// ----------------------------------------------------

// 1. Health Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Altruist AI',
    timestamp: new Date().toISOString(),
    groqConfigured: isGroqConfigured,
    supabaseConfigured: isSupabaseConfigured,
    model: GROQ_MODEL
  });
});

// 2. Supabase Auth Register
app.post('/api/auth/register', async (req, res) => {
  const email = sanitizeInput(req.body.email, 100);
  const password = sanitizeInput(req.body.password, 100);

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const result = await dbService.registerUser(email, password);
  res.json(result);
});

// 3. Supabase Auth Login
app.post('/api/auth/login', async (req, res) => {
  const email = sanitizeInput(req.body.email, 100);
  const password = sanitizeInput(req.body.password, 100);

  const result = await dbService.loginUser(email, password);
  res.json(result);
});

// 4. Evaluator Demo Auth Quick Login
app.post('/api/auth/demo-login', async (req, res) => {
  const demoUserId = 'demo_user_123';
  const profile = await dbService.getProfile(demoUserId);
  res.json({
    success: true,
    user: {
      id: demoUserId,
      email: 'demo@altruist.ai',
      role: 'Evaluator Demo User'
    },
    profile
  });
});

// 5. Voice Onboarding Profile Save
app.post('/api/onboarding', async (req, res) => {
  const { userId, triggers, copingStrategies, personaTone, emergencyContact } = req.body;
  const targetId = userId || 'demo_user_123';

  const profileData = {
    user_id: targetId,
    email: req.body.email || 'user@altruist.ai',
    triggers: sanitizeInput(triggers, 300) || 'General anxiety & high sensory environment',
    coping_strategies: sanitizeInput(copingStrategies, 300) || 'Box breathing & 5-4-3-2-1 sensory grounding',
    persona_tone: sanitizeInput(personaTone, 100) || 'Empathetic & Calm',
    emergency_contact: sanitizeInput(emergencyContact, 100) || 'Primary Caregiver (988 Crisis Line)'
  };

  const savedProfile = await dbService.saveProfile(profileData);
  res.json({ success: true, profile: savedProfile });
});

// 6. Crisis Mode Endpoint
app.post('/api/crisis', async (req, res) => {
  try {
    const userId = req.body.userId || 'demo_user_123';
    const text = sanitizeInput(req.body.text);

    const profile = await dbService.getProfile(userId);

    const systemPrompt = `You are Altruist AI — a compassionate, unselfish crisis intervention assistant.
Tone: ${profile?.persona_tone || 'Warm, gentle, and reassuring'}.
Patient known triggers: ${profile?.triggers || 'Anxiety, panic'}.
Patient preferred coping: ${profile?.coping_strategies || 'Deep breathing, 5-4-3-2-1 grounding'}.

Provide a single concise response with two clear parts:
1. Coping Script: 3 short soothing bullet points for immediate grounding.
2. Emergency Message: 1 sentence reassurance and reminder that emergency contacts are notified if needed.`;

    const userPrompt = text
      ? `The user is in distress and said: "${text}". Provide immediate grounding support.`
      : `The user tapped the Altruist AI Panic Button. Provide instant calming grounding guidance.`;

    const fallbackResponse = `• Take a gentle breath in through your nose for 4 seconds... hold... and slowly release.
• Look around you and notice 3 physical objects to anchor your mind right now.
• You are safe in this moment, and this surge of anxiety will pass.

Emergency Status: Reassurance active — your safety anchor contact is available.`;

    const aiText = await generateGroqCompletion(systemPrompt, userPrompt, fallbackResponse);

    const eventLog = await dbService.logCrisisEvent({
      user_id: userId,
      transcript: text || 'One-Tap Panic Activation',
      ai_response: aiText,
      emergency_message: `Emergency contact: ${profile?.emergency_contact || '988 Lifeline'}`
    });

    res.json({
      success: true,
      mode: 'crisis',
      response: aiText,
      eventId: eventLog.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal error processing Altruist AI crisis request.' });
  }
});

// 7. Daily Pulse Check-In
app.post('/api/pulse', async (req, res) => {
  const userId = req.body.userId || 'demo_user_123';
  const score = parseInt(req.body.score, 10) || 3;
  const voiceNote = sanitizeInput(req.body.voiceNote, 500);

  const pulseEntry = await dbService.logPulseCheck({
    user_id: userId,
    score,
    voice_note: voiceNote
  });

  res.json({ success: true, pulse: pulseEntry });
});

// 8. Caregiver Invite Code Generation
app.post('/api/caregiver/invite', async (req, res) => {
  const userId = req.body.userId || 'demo_user_123';
  const invite = await dbService.createCaregiverInvite(userId);
  res.json({ success: true, invite });
});

// 9. Caregiver AI Coaching Tip
app.post('/api/caregiver-tip', async (req, res) => {
  const userId = req.body.userId || 'demo_user_123';
  const query = sanitizeInput(req.body.query);

  const recentCrises = await dbService.getCrisisEvents(userId);
  const recentPulses = await dbService.getPulseChecks(userId);

  const systemPrompt = `You are Altruist AI Caregiver Advisor.
Patient recent crisis count: ${recentCrises.length}.
Latest pulse check scores: ${recentPulses.map(p => p.score).join(', ') || '3/5'}.
Provide practical, empathetic caregiver de-escalation tips in 3 bullet points.`;

  const userPrompt = query
    ? `Caregiver asks: "${query}"`
    : `Generate a contextual caregiver coaching tip based on patient's recent activity.`;

  const fallbackTip = `• Create a quiet, low-stimulus environment by dimming bright lights and turning down background noise.
• Use a low, calm voice pitch with reassuring phrases like "I am right here with you, you are safe."
• Take 3 slow breaths yourself — your calm physiology helps lower their anxiety levels.`;

  const tipText = await generateGroqCompletion(systemPrompt, userPrompt, fallbackTip);

  await dbService.saveCaregiverTip({
    patient_user_id: userId,
    tip_text: tipText
  });

  res.json({ success: true, guidance: tipText });
});

// 10. Caregiver Patient Trends Query
app.get('/api/caregiver/patient-trends', async (req, res) => {
  const userId = req.query.userId || 'demo_user_123';
  const crisisEvents = await dbService.getCrisisEvents(userId);
  const pulseChecks = await dbService.getPulseChecks(userId);
  const profile = await dbService.getProfile(userId);

  res.json({
    success: true,
    profile,
    crisisCount: crisisEvents.length,
    recentCrises: crisisEvents,
    pulseChecks
  });
});

// 11. Learn Hub Educational Q&A
app.post('/api/learn/query', async (req, res) => {
  const query = sanitizeInput(req.body.query);
  const systemPrompt = `You are Altruist AI Educational Guide. Provide clear, uplifting, evidence-based coping advice for mental health and caregiving queries in bullet points.`;
  const fallbackText = `Grounding techniques redirect focus away from racing thoughts and back to the present moment.\n\nKey Strategy - 5-4-3-2-1:\n- 5 things you can SEE\n- 4 things you can TOUCH\n- 3 things you can HEAR\n- 2 things you can SMELL\n- 1 thing you can TASTE`;

  const responseText = await generateGroqCompletion(systemPrompt, `Question: "${query}"`, fallbackText);
  res.json({ success: true, content: responseText });
});

app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Altruist AI Express Server listening on port ${PORT}`);
    console.log(`Groq LLM Status: ${isGroqConfigured ? 'CONNECTED' : 'FALLBACK MODE'}`);
    console.log(`Supabase Status: ${isSupabaseConfigured ? 'CONNECTED' : 'LIVE MEMORY MODE'}`);
    console.log(`====================================================`);
  });
}

export default app;
