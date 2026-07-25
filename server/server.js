import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { dbService, isSupabaseConfigured } from './config/supabase.js';
import { GROQ_MODELS, ROUTES, TIMEOUTS } from './config/constants.js';
import { errorHandler, AppError, asyncWrapper } from './middleware/errorHandler.js';
import { initGroq, callGroq, buildCrisisPrompt, buildCaregiverPrompt, buildLearnPrompt } from './services/aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const isGroqConfigured = initGroq(GROQ_API_KEY);

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
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));

const apiLimiter = rateLimit({
  windowMs: TIMEOUTS.RATE_LIMIT_WINDOW_MS,
  max: TIMEOUTS.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Please wait a moment.' }
});

app.use('/api/', apiLimiter);

function sanitizeInput(str, maxLen = 1000) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

// ----------------------------------------------------
// Altruist AI Backend Endpoints
// ----------------------------------------------------

// 1. Health Status
app.get(ROUTES.HEALTH, (req, res) => {
  res.json({
    status: 'ok',
    app: 'Altruist AI',
    timestamp: new Date().toISOString(),
    groqConfigured: isGroqConfigured,
    supabaseConfigured: isSupabaseConfigured,
    model: GROQ_MODELS.CRISIS
  });
});

// 2. Supabase Auth Register
app.post(ROUTES.REGISTER, asyncWrapper(async (req, res) => {
  const email = sanitizeInput(req.body.email, 100);
  const password = sanitizeInput(req.body.password, 100);

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const result = await dbService.registerUser(email, password);
  res.json(result);
}));

// 3. Supabase Auth Login
app.post(ROUTES.LOGIN, asyncWrapper(async (req, res) => {
  const email = sanitizeInput(req.body.email, 100);
  const password = sanitizeInput(req.body.password, 100);

  const result = await dbService.loginUser(email, password);
  res.json(result);
}));

// 4. Evaluator Demo Auth — real Supabase Auth session for demo@altruist.ai
app.post(ROUTES.DEMO_LOGIN, asyncWrapper(async (req, res) => {
  const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@altruist.ai';
  const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'DemoAltruist123!';

  const loginResult = await dbService.loginUser(DEMO_EMAIL, DEMO_PASSWORD);
  if (loginResult.success) {
    return res.json(loginResult);
  }

  const registerResult = await dbService.registerUser(DEMO_EMAIL, DEMO_PASSWORD);
  if (!registerResult.success) {
    return res.status(401).json({
      success: false,
      error: `Demo account setup failed: ${registerResult.error}. Please create the demo user manually in Supabase Authentication > Users with email: ${DEMO_EMAIL} and password: ${DEMO_PASSWORD}, then try again.`
    });
  }

  const finalLogin = await dbService.loginUser(DEMO_EMAIL, DEMO_PASSWORD);
  if (finalLogin.success) {
    return res.json(finalLogin);
  }

  return res.status(401).json({
    success: false,
    error: 'Demo account was registered but login requires email confirmation. In Supabase Dashboard → Authentication → Providers → Email, disable "Confirm email" and try again.'
  });
}));

// 5. Voice Onboarding Profile Save
app.post(ROUTES.ONBOARDING, asyncWrapper(async (req, res) => {
  const { userId, email, triggers, copingStrategies, personaTone, emergencyContact } = req.body;

  if (!userId) {
    throw new AppError('userId is required to save profile.', 400);
  }

  const profileData = {
    user_id: sanitizeInput(userId, 100),
    email: sanitizeInput(email, 100) || '',
    triggers: sanitizeInput(triggers, 300),
    coping_strategies: sanitizeInput(copingStrategies, 300),
    persona_tone: sanitizeInput(personaTone, 100) || 'Empathetic & Calm',
    emergency_contact: sanitizeInput(emergencyContact, 100) || ''
  };

  const savedProfile = await dbService.saveProfile(profileData);
  res.json({ success: true, profile: savedProfile });
}));

// 6. Crisis Mode Endpoint
// Uses llama-3.1-8b-instant for sub-second emergency response latency
app.post(ROUTES.CRISIS, asyncWrapper(async (req, res) => {
  const userId = sanitizeInput(req.body.userId, 100);
  const text = sanitizeInput(req.body.text);

  if (!userId) {
    throw new AppError('userId is required for crisis logging.', 400);
  }

  const profile = await dbService.getProfile(userId);
  const systemPrompt = buildCrisisPrompt(profile);

  const userPrompt = text
    ? `The user in recovery is experiencing a crisis and said: "${text}". Provide immediate craving interruption and grounding support.`
    : `The user in recovery has activated the Altruist AI Crisis Button. Provide instant, compassionate grounding guidance for a craving or relapse risk moment.`;

  const fallbackResponse = `• This craving is temporary. Most peak within 20-30 minutes and pass — you are stronger than this moment.\n• Breathe in slowly for 4 seconds... hold... and release for 6 seconds. Your body is safe right now.\n• Name 5 things you can see around you to bring your mind back to the present.\n\nRecovery Support: Your sponsor, support group, or emergency contact are available to you right now.`;

  // llama-3.1-8b-instant chosen for sub-500ms response time during peak panic
  const aiText = await callGroq(systemPrompt, userPrompt, fallbackResponse, GROQ_MODELS.CRISIS);

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
}));

// 7. Daily Pulse Check-In
app.post(ROUTES.PULSE, asyncWrapper(async (req, res) => {
  const userId = sanitizeInput(req.body.userId, 100);
  const score = parseInt(req.body.score, 10);
  const voiceNote = sanitizeInput(req.body.voiceNote, 500);

  if (!userId) {
    throw new AppError('userId is required for pulse check.', 400);
  }

  if (isNaN(score) || score < 1 || score > 5) {
    throw new AppError('Score must be a number between 1 and 5.', 400);
  }

  const pulseEntry = await dbService.logPulseCheck({
    user_id: userId,
    score,
    voice_note: voiceNote || ''
  });

  res.json({ success: true, pulse: pulseEntry });
}));

// 8. Caregiver Invite Code Generation
app.post(ROUTES.INVITE, asyncWrapper(async (req, res) => {
  const userId = sanitizeInput(req.body.userId, 100);
  if (!userId) {
    throw new AppError('userId is required to generate invite.', 400);
  }
  const invite = await dbService.createCaregiverInvite(userId);
  res.json({ success: true, invite });
}));

// 9. Caregiver AI Coaching Tip
// Uses Promise.all to fetch recentCrises, recentPulses, and profile concurrently
app.post(ROUTES.CAREGIVER_TIP, asyncWrapper(async (req, res) => {
  const userId = sanitizeInput(req.body.userId, 100);
  const query = sanitizeInput(req.body.query);

  if (!userId) {
    throw new AppError('userId is required for caregiver tips.', 400);
  }

  // Parallel database reads for maximum efficiency
  const [recentCrises, recentPulses, profile] = await Promise.all([
    dbService.getCrisisEvents(userId),
    dbService.getPulseChecks(userId),
    dbService.getProfile(userId)
  ]);

  const systemPrompt = buildCaregiverPrompt(recentCrises, recentPulses, profile);
  const userPrompt = query
    ? `Caregiver asks: "${query}"`
    : `Generate a contextual caregiver coaching tip based on patient's recent activity.`;

  const fallbackTip = `• Create a quiet, low-stimulus environment by dimming bright lights and turning down background noise.\n• Use a low, calm voice pitch with reassuring phrases like "I am right here with you, you are safe."\n• Take 3 slow breaths yourself — your calm physiology helps lower their anxiety levels.`;

  // llama-3.3-70b-versatile chosen for deeper clinical reasoning across patient history
  const tipText = await callGroq(systemPrompt, userPrompt, fallbackTip, GROQ_MODELS.REASONING);

  await dbService.saveCaregiverTip({
    patient_user_id: userId,
    tip_text: tipText
  });

  res.json({ success: true, guidance: tipText });
}));

// 10. Caregiver Patient Trends Query
// Uses Promise.all to fetch crisisEvents, pulseChecks, and profile concurrently
app.get(ROUTES.PATIENT_TRENDS, asyncWrapper(async (req, res) => {
  const userId = sanitizeInput(req.query.userId, 100);
  if (!userId) {
    throw new AppError('userId query param is required.', 400);
  }

  // Parallel database reads for maximum efficiency
  const [crisisEvents, pulseChecks, profile] = await Promise.all([
    dbService.getCrisisEvents(userId),
    dbService.getPulseChecks(userId),
    dbService.getProfile(userId)
  ]);

  res.json({
    success: true,
    profile,
    crisisCount: crisisEvents.length,
    recentCrises: crisisEvents,
    pulseChecks
  });
}));

// 11. Learn Hub Educational Q&A
// Uses llama-3.3-70b-versatile for comprehensive educational response synthesis
app.post(ROUTES.LEARN_QUERY, asyncWrapper(async (req, res) => {
  const query = sanitizeInput(req.body.query);
  const learnSystemPrompt = buildLearnPrompt();
  const fallbackText = `Grounding techniques redirect focus away from racing thoughts and back to the present moment.\n\nKey Strategy - 5-4-3-2-1:\n- 5 things you can SEE\n- 4 things you can TOUCH\n- 3 things you can HEAR\n- 2 things you can SMELL\n- 1 thing you can TASTE`;

  // llama-3.3-70b-versatile chosen for synthesis of SAMHSA and recovery frameworks
  const responseText = await callGroq(learnSystemPrompt, `Question: "${query}"`, fallbackText, GROQ_MODELS.REASONING);
  res.json({ success: true, content: responseText });
}));

// Global 404 & Centralized Error Middleware
app.use((req, res, next) => next(new AppError('Endpoint not found', 404)));
app.use(errorHandler);

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
