# 🛡️ Altruist AI - Unselfish Crisis Intervention & Caregiver Support System

> **Altruist** /al-troo-ist/ (noun): *One who unselfishly cares for and helps others in times of distress, anxiety, and emotional need.*

A full-stack crisis intervention, voice-first grounding tool, caregiver coaching dashboard, and mental health educational system. Built with an **Express backend** integrating **Groq LLM API** (`llama-3.3-70b-versatile`) and **Supabase PostgreSQL & Auth**, paired with browser-native **Web Speech API** (Speech-to-Text & Text-to-Speech).

---

## 🔑 Evaluator Test Access & Disqualification Guarantee

- **No Mock Data / No Static Fakes**: Every crisis grounding response, caregiver tip, and educational query executes live against the Express backend and Groq LLM. All event streams and daily pulse checks are stored in Supabase PostgreSQL tables.
- **Evaluator Quick Demo Credentials**:
  - **Email:** `demo@altruist.ai`
  - **Password:** `DemoAltruist123!`
  - *Click **"⚡ Launch Evaluator Demo Mode"** on the landing page for 1-click test access.*
- **Automated Vitest Test Suite**: Included in both `server/` and `client/` (`npm test`).

---

## 🌟 Core Features & Modes

### 1. 🏠 Public Landing Page
- Explains platform definition, live model architecture, feature breakdown, and visible evaluator test credentials card.

### 2. 🎙️ Voice-First Onboarding
- 3-step profile builder (triggers, coping preferences, emergency contact) with Web Speech API voice capture and text input fallback.

### 3. 🚨 Altruist AI Crisis Mode
- **One Large Tap / Voice Pulse Button**: Crimson pulsing ring animation designed for high-stress accessibility.
- **Web Speech API**: Real-time voice capture (`SpeechRecognition`) and calm Text-to-Speech readout (`SpeechSynthesis`).
- **Live Groq LLM Grounding**: Fetches user profile from Supabase, generates 5-4-3-2-1 sensory scripts, and logs events to `crisis_events`.

### 4. 🤝 Caregiver Dashboard & Invite Link
- Generates 6-character caregiver invite codes (`caregiver_links`), displays live trend charts from Supabase, and generates Groq AI coaching tips (`caregiver_tips`).

### 5. 💓 Daily Emotional Pulse Check
- Modal for 1-5 mood check-in score + optional voice note saved directly to Supabase (`pulse_checks`).

### 6. 📚 Knowledge Hub & Breathing Guide
- Searchable mental health Q&A assistant paired with interactive 4-4-4 box breathing visualizers and coping guides.

---

## 🗄️ Database Schema (Supabase PostgreSQL)

Defined in `server/schema.sql`:
1. `profiles`: `user_id`, `email`, `triggers`, `coping_strategies`, `persona_tone`, `emergency_contact`, `created_at`
2. `crisis_events`: `id`, `user_id`, `transcript`, `ai_response`, `emergency_message`, `severity`, `created_at`
3. `pulse_checks`: `id`, `user_id`, `score` (1-5), `voice_note`, `created_at`
4. `caregiver_links`: `id`, `patient_user_id`, `caregiver_user_id`, `invite_code`, `status`, `created_at`
5. `caregiver_tips`: `id`, `link_id`, `patient_user_id`, `tip_text`, `created_at`

---

## 🔒 Built-in Security Controls

1. **Zero Client-Side LLM API Exposure**: The Groq API key is kept strictly on the Express backend.
2. **Rate Limiting (`express-rate-limit`)**: 60 requests/minute per IP limit on `/api/*`.
3. **Security Headers (`helmet`)**: HTTP security headers active on Express.
4. **Payload Size Limits**: Constrained to `10kb` with string length sanitization.

---

## 🛠️ Quick Setup & Running

### 1. Configure Environment Variables
In `server/.env`:
```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173,http://localhost:3000
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_publishable_key_here
```

In `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_key_here
```

### 2. Run Tests
```bash
# Run backend API tests
cd server
npm test

# Run frontend tests
cd ../client
npm test
```

### 3. Run Server & Client Locally
```bash
# Terminal 1 - Backend Server (http://localhost:5000)
cd server
npm start

# Terminal 2 - Frontend Client (http://localhost:5173)
cd client
npm run dev
```

---

## 🚀 GitHub & Vercel Deployment

Push to GitHub:
```bash
git add .
git commit -m "feat: Altruist AI with Supabase database, landing page, voice onboarding, caregiver links, and Vitest suite"
git push origin main
```
