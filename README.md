# 🛡️ CrisisCare AI - Immediate De-escalation & Caregiver Support System

A modern, accessible full-stack web application designed for immediate crisis intervention, sensory grounding, caregiver management, and mental health education. Powered by an **Express backend** communicating securely with **Groq LLM** (`llama-3.3-70b-versatile`) and integrated with browser-native **Web Speech API** for hands-free speech-to-text and soothing voice readout.

---

## 🌟 Key Features & Modes

### 1. 🚨 Crisis Mode (Panic & De-escalation)
- **One Large Tap / Voice Pulse Button**: Designed for high accessibility under stress. Instant single-tap or voice activation.
- **Web Speech API Integration**:
  - Hands-free **Speech-to-Text** recognition (`window.SpeechRecognition`).
  - Natural **Text-to-Speech** audio readout (`window.speechSynthesis`) with calm cadence settings and voice toggle.
- **Immediate Grounding Response**: Receives bulleted, soothing 5-4-3-2-1 sensory steps generated via backend Groq LLM.
- **Emergency Shortcuts**: Quick tap to dial 988 Crisis Lifeline or notify emergency contact.
- **Interactive Box Breathing Guide & Audio Wave Visualizer**.

### 2. 🤝 Caregiver Mode (Dashboard & AI Advisor)
- **Patient Status Monitor**: Track current stress level (Calm, Anxious, Crisis Active) and review incident logs.
- **Editable Emergency Safety Plan**: Customizable contact details, calm anchor phrases, and medical sensory notes synced with backend storage.
- **Ask Groq AI Caregiver Advisor**: Clinical de-escalation tips, dementia agitation management, and caregiver burnout advice.

### 3. 📚 Learn Tab (Educational Knowledge Hub)
- **AI Mental Health Assistant**: Search bar allowing patients and caregivers to ask health questions answered by Express API -> Groq.
- **Interactive Topic Guides**: Panic Attacks vs Anxiety, Sensory Overload Management, Dementia Communication, 5-4-3-2-1 Grounding.
- **Guided 4-4-4 Box Breathing Companion**.

---

## 🔒 Built-in Security Controls

1. **Zero Client-Side LLM API Calls**:
   - The Groq API key is kept **strictly on the Express backend**. The frontend browser only calls backend REST endpoints (`/api/crisis`, `/api/caregiver/query`, `/api/learn/query`).
2. **Rate Limiting (`express-rate-limit`)**:
   - Endpoints are protected with a rate limit of 30 requests/minute per IP to prevent spamming and LLM quota exhaustion.
3. **Security Headers (`helmet`)**:
   - HTTP response headers configured to block XSS, clickjacking, and MIME sniffing attacks.
4. **CORS Restrictions**:
   - Configurable `ALLOWED_ORIGIN` environment variable ensures only trusted frontend domains can access the API.
5. **Input Length Limits & Sanitization**:
   - Request payloads are limited to `10kb` and strings are sanitized to block injection or DoS attacks.
6. **Graceful Fallbacks**:
   - If `GROQ_API_KEY` is not supplied or fails, the backend seamlessly returns soothing pre-formatted grounding guidance without breaking or exposing internal stack traces.

---

## 📁 Repository Structure

```
warmup-challenge/
├── .gitignore               # Root gitignore excluding secrets & build files
├── package.json             # Root workspace runner
├── README.md                # Comprehensive documentation
├── server/                  # Node.js / Express Backend
│   ├── .env.example         # Environment template for backend
│   ├── .env                 # Server configuration (contains GROQ_API_KEY)
│   ├── package.json         # Server dependencies (express, cors, helmet, groq-sdk)
│   └── server.js            # Express server logic & endpoints
└── client/                  # Vite + React Frontend
    ├── .env.example         # Client environment template
    ├── .env                 # Frontend configuration (VITE_API_BASE_URL)
    ├── package.json         # React dependencies (lucide-react, vite)
    ├── index.html           # HTML entry point with fonts
    ├── vite.config.js       # Vite configuration with local proxy
    └── src/
        ├── index.css        # Design system, glassmorphism & pulse animations
        ├── App.jsx          # Shell with tab navigation & theme state
        ├── services/
        │   ├── speechService.js   # Web Speech API wrapper (STT & TTS)
        │   └── apiService.js      # Backend REST client wrapper
        └── components/
            ├── Navbar.jsx         # Accessible navigation & theme toggle
            ├── CrisisMode.jsx     # Giant voice/tap crisis button screen
            ├── CaregiverMode.jsx  # Caregiver dashboard & AI advisor
            ├── LearnTab.jsx       # Educational hub & AI search
            └── BreathingWidget.jsx# Guided box breathing & sensory tool
```

---

## 🛠️ Quick Setup & Local Running

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Groq API Key**: Get a key from [Groq Console](https://console.groq.com/) (optional, fallbacks included).

### Step 1: Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Configure Environment Variables
In `server/.env`:
```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173,http://localhost:3000
GROQ_API_KEY=your_actual_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

In `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### Step 3: Run Server & Client Locally

**Start Server:**
```bash
cd server
npm start
# Express runs on http://localhost:5000
```

**Start Client (in a separate terminal):**
```bash
cd client
npm run dev
# Vite runs on http://localhost:5173
```

---

## 🚀 Deployment Instructions

### Option A: Push to GitHub Repository
```bash
git add .
git commit -m "Initial commit: Crisis Care React app with Express Groq backend and Web Speech API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

### Option B: Deploy Backend to Render / Railway / Vercel Serverless
1. Connect your GitHub repository to **Render** or **Railway**.
2. Set Root Directory to `server`.
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Add Environment Variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `ALLOWED_ORIGIN`: URL of your deployed frontend (e.g. `https://your-app.vercel.app`)

### Option C: Deploy Frontend to Vercel / Netlify
1. Connect your GitHub repository to **Vercel** or **Netlify**.
2. Set Framework Preset to **Vite**.
3. Set Root Directory to `client`.
4. Set Build Command: `npm run build`
5. Set Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_BASE_URL`: Full URL of your deployed backend (e.g. `https://your-backend.onrender.com`).
