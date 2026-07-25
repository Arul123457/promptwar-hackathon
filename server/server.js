import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Groq } from 'groq-sdk';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// ----------------------------------------------------
// Security Controls
// ----------------------------------------------------

// 1. Helmet for Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for REST API server
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. CORS Configuration with whitelist/environment fallback
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser calls (like curl or postman) or matching origins
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy check failed: Origin not allowed'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. Body Parsing with Payload Size Limits (Security against DoS)
app.use(express.json({ limit: '10kb' }));

// 4. Rate Limiting (Prevent abuse of endpoints and LLM costs)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 30, // Limit each IP to 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please pause for a moment.' }
});

app.use('/api/', apiLimiter);

// ----------------------------------------------------
// Groq Client Initialization
// ----------------------------------------------------
let groqClient = null;
const isGroqConfigured = Boolean(GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here');

if (isGroqConfigured) {
  try {
    groqClient = new Groq({ apiKey: GROQ_API_KEY });
  } catch (err) {
    console.warn('Groq client initialization warning:', err.message);
  }
} else {
  console.log('Notice: GROQ_API_KEY is missing or set to placeholder. Using soothing intelligent fallback responses.');
}

// Helper: Call Groq or return graceful grounding fallback
async function generateGroqCompletion(systemPrompt, userPrompt, fallbackResponse) {
  if (!groqClient) {
    return fallbackResponse;
  }
  try {
    const completion = await groqClient.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: GROQ_MODEL,
      temperature: 0.5,
      max_tokens: 450,
    });
    const text = completion.choices[0]?.message?.content;
    return text ? text.trim() : fallbackResponse;
  } catch (error) {
    console.error('Groq API Error:', error.message);
    return fallbackResponse;
  }
}

// ----------------------------------------------------
// Input Validation Helper
// ----------------------------------------------------
function sanitizeInput(input, maxLength = 1000) {
  if (!input || typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

// ----------------------------------------------------
// API Endpoints
// ----------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    groqConfigured: isGroqConfigured,
    model: GROQ_MODEL
  });
});

// 1. CRISIS MODE ENDPOINT
app.post('/api/crisis', async (req, res) => {
  try {
    const text = sanitizeInput(req.body.text);
    const triggerType = req.body.type || 'voice';

    const systemPrompt = `You are a calm, gentle, empathetic crisis intervention assistant. 
Your goal is to immediately de-escalate anxiety, panic attacks, or sensory overload using brief, soothing, bulleted grounding statements.
Keep answers short (3-4 concise sentences max), extremely warm, easy to understand when spoken out loud by text-to-speech, and include a simple grounding instruction (e.g. "Take a slow deep breath in... 1... 2... 3...").`;

    const userPrompt = text
      ? `The user tapped the crisis button and said/typed: "${text}". Provide immediate calm grounding response.`
      : `The user activated the crisis button without speaking. Provide an immediate soothing grounding message and 5-4-3-2-1 breathing prompt.`;

    const fallbackResponse = `You are safe right now. Let's take a slow, calm breath together. Breathe in through your nose for 4 seconds... hold... and gently breathe out. Look around you and notice 3 things you can see. You are not alone, and this feeling will pass.`;

    const responseText = await generateGroqCompletion(systemPrompt, userPrompt, fallbackResponse);

    res.json({
      success: true,
      mode: 'crisis',
      triggerType,
      response: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'An internal server error occurred while processing crisis assistance.'
    });
  }
});

// 2. CAREGIVER MODE ENDPOINT
app.post('/api/caregiver/query', async (req, res) => {
  try {
    const query = sanitizeInput(req.body.query);
    const patientState = sanitizeInput(req.body.patientState || 'calm');

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const systemPrompt = `You are a professional caregiver advisor and clinical de-escalation expert. 
Provide concise, practical, empathetic advice to help caregivers manage panic attacks, dementia agitation, sensory overload, or emotional distress.
Structure your response into:
1. Immediate Action (1-2 sentences)
2. Soft De-escalation Strategy
3. Self-Care Reminder for Caregiver.`;

    const userPrompt = `Patient current state: ${patientState}. Caregiver asks: "${query}"`;

    const fallbackResponse = `**1. Immediate Action:** Create a quiet, low-sensory environment. Reduce loud noises and dim harsh lights.\n\n**2. De-escalation Strategy:** Speak in a slow, low pitch with simple phrases. Validate their emotions (e.g., "I am here with you, you are safe").\n\n**3. Caregiver Note:** Take a moment to relax your own shoulders and breathe. Your calm tone is their anchor.`;

    const guidanceText = await generateGroqCompletion(systemPrompt, userPrompt, fallbackResponse);

    res.json({
      success: true,
      mode: 'caregiver',
      guidance: guidanceText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred while generating caregiver advice.'
    });
  }
});

// 3. LEARN TAB ENDPOINT
app.post('/api/learn/query', async (req, res) => {
  try {
    const query = sanitizeInput(req.body.query);
    const topic = sanitizeInput(req.body.topic || 'Mental Health & Grounding');

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const systemPrompt = `You are an educational mental health specialist. 
Provide clear, uplifting, evidence-based educational insights regarding anxiety management, grounding exercises, panic coping strategies, and caregiver support.
Keep explanations clear, engaging, and structured with bullet points.`;

    const userPrompt = `Topic area: ${topic}. Question: "${query}"`;

    const fallbackResponse = `Grounding techniques engage your senses to pull your mind away from panic and bring you back to the present moment.\n\nKey Strategy - 5-4-3-2-1 Technique:\n- 5 things you can SEE\n- 4 things you can TOUCH\n- 3 things you can HEAR\n- 2 things you can SMELL\n- 1 thing you can TASTE\n\nPracticing this regularly builds calm muscle memory for stressful situations.`;

    const responseText = await generateGroqCompletion(systemPrompt, userPrompt, fallbackResponse);

    res.json({
      success: true,
      mode: 'learn',
      topic,
      content: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'An error occurred while processing educational search.'
    });
  }
});

// 4. Emergency Contacts & Safety Plan Endpoint (Dynamic in-memory storage)
let safetyPlanData = {
  emergencyContactName: 'Primary Caregiver',
  emergencyPhone: '988',
  calmAnchorPhrase: 'I am safe, this moment will pass.',
  medicalNotes: 'Sensory sensitivity to bright flashing lights.'
};

app.get('/api/caregiver/safety-plan', (req, res) => {
  res.json({ success: true, data: safetyPlanData });
});

app.post('/api/caregiver/safety-plan', (req, res) => {
  const { emergencyContactName, emergencyPhone, calmAnchorPhrase, medicalNotes } = req.body;
  safetyPlanData = {
    emergencyContactName: sanitizeInput(emergencyContactName, 100) || safetyPlanData.emergencyContactName,
    emergencyPhone: sanitizeInput(emergencyPhone, 30) || safetyPlanData.emergencyPhone,
    calmAnchorPhrase: sanitizeInput(calmAnchorPhrase, 200) || safetyPlanData.calmAnchorPhrase,
    medicalNotes: sanitizeInput(medicalNotes, 500) || safetyPlanData.medicalNotes
  };
  res.json({ success: true, data: safetyPlanData, message: 'Safety plan updated successfully.' });
});

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Crisis Care Backend Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Groq LLM Status: ${isGroqConfigured ? 'CONNECTED' : 'FALLBACK MODE'}`);
  console.log(`====================================================`);
});
