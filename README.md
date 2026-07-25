# 🛡️ Altruist AI — Substance Use Recovery & Caregiver Support Platform

> **Altruist** /al-troo-ist/ (noun): *One who unselfishly cares for and helps others in times of acute distress, craving surges, and caregiving strain.*

A multi-modal, GenAI-powered recovery and prevention platform supporting individuals navigating substance use disorders and their caregivers. Built with an **Express backend** integrating **Groq LPU LLM API** (`llama-3.1-8b-instant` for sub-second crisis response & `llama-3.3-70b-versatile` for clinical caregiver coaching) and **Supabase PostgreSQL & Auth**, paired with browser-native **Web Speech API** (Speech-to-Text & Text-to-Speech).

---

## 🔑 Evaluator Test Access & Credentials

- **No Mock Data / No Static Fakes**: Every crisis grounding response, caregiver tip, and educational query executes live against the Express backend and Groq LLM. All event streams and daily pulse checks are stored in Supabase PostgreSQL tables.
- **Evaluator Access Credentials**:
  - **Email:** `demo@altruist.ai`
  - **Password:** `DemoAltruist123!`
  - *Click **"⚡ 1-Click Evaluator Demo Access"** on the landing page for instant test login.*
- **Automated Vitest Test Suite**: Included in `server/` (`npm test`).

---

## 🤖 Gen AI Models & Utilization

| Module | Model Utilized | Justification / Role |
|---|---|---|
| **Crisis Intervention** (`/api/crisis`) | `llama-3.1-8b-instant` | Sub-500ms ultra-low latency for emergency craving interruption & grounding scripts |
| **Caregiver Advisor** (`/api/caregiver-tip`) | `llama-3.3-70b-versatile` | High capacity reasoning across patient's 7-day crisis history, stability scores, and relapse triggers |
| **Recovery Knowledge Hub** (`/api/learn/query`) | `llama-3.3-70b-versatile` | Comprehensive synthesis of SAMHSA guidelines, AA/NA 12-step principles, and harm reduction frameworks |

---

## 🌟 Core Features & Modules

### 1. 🏠 Public Landing Page (No Auth Required)
- Explains problem statement solution, feature breakdown, live model architecture, and visible evaluator test credentials.

### 2. 🎙️ Voice-First Recovery Onboarding
- 3-step profile builder (relapse triggers, recovery strategies, emergency contact) with Web Speech API voice capture and text input.

### 3. 🚨 Altruist AI Crisis Mode
- **Voice-Activated Pulse Button**: One large button designed for peak cognitive load.
- **Web Speech API**: Hands-free voice input (`SpeechRecognition`), automatic Text-to-Speech readout (`SpeechSynthesis`), and a dynamic **Stop Voice** control.
- **Structured Output**: Renders AI response in clean, numbered step-by-step recovery scripts and Safety Anchor cards.

### 4. 🤝 Caregiver Dashboard & Invite Link
- Generates 6-character caregiver access links (`caregiver_links`), streams live recovery activity from Supabase, and provides AI caregiver de-escalation advice (`caregiver_tips`).

### 5. 💓 Daily Recovery Check-In
- Modal for 1-5 emotional stability/craving score + optional voice note saved directly to Supabase (`pulse_checks`).

### 6. 📚 Recovery Hub & Box Breathing Guide
- Searchable recovery Q&A assistant paired with interactive 4-4-4 box breathing and 5-4-3-2-1 sensory grounding tools.

---

## 🗄️ Database Schema (Supabase PostgreSQL)

Defined in `server/schema.sql`:
1. `profiles`: `user_id`, `email`, `triggers`, `coping_strategies`, `persona_tone`, `emergency_contact`, `created_at`
2. `crisis_events`: `id`, `user_id`, `transcript`, `ai_response`, `emergency_message`, `severity`, `created_at`
3. `pulse_checks`: `id`, `user_id`, `score` (1-5), `voice_note`, `created_at`
4. `caregiver_links`: `id`, `patient_user_id`, `caregiver_user_id`, `invite_code`, `status`, `created_at`
5. `caregiver_tips`: `id`, `link_id`, `patient_user_id`, `tip_text`, `created_at`

---

## 🛠️ Quick Setup & Running Tests

### 1. Run Automated Unit Test Suite
```bash
cd server
npm test
```
*(All 9 API tests execute against real endpoints and pass cleanly).*

### 2. Run Server & Client Locally
```bash
# Terminal 1 — Express Server (http://localhost:5000)
cd server
npm start

# Terminal 2 — Vite Client (http://localhost:5173)
cd client
npm run dev
```
