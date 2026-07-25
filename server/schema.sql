-- ====================================================
-- Altruist AI - Database Schema for Supabase PostgreSQL
-- ====================================================

-- 1. Profiles Table (User settings, triggers, tone)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  triggers TEXT DEFAULT 'General anxiety, high noise',
  coping_strategies TEXT DEFAULT 'Box breathing, 5-4-3-2-1 sensory grounding',
  persona_tone TEXT DEFAULT 'Empathetic & Gentle',
  emergency_contact TEXT DEFAULT 'Primary Caregiver (988)',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crisis Events Table (Logged whenever Crisis Mode is activated)
CREATE TABLE IF NOT EXISTS public.crisis_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  transcript TEXT,
  ai_response TEXT NOT NULL,
  emergency_message TEXT,
  severity TEXT DEFAULT 'moderate',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Pulse Checks Table (Daily 1-5 mood & voice note score)
CREATE TABLE IF NOT EXISTS public.pulse_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  score INT CHECK (score >= 1 AND score <= 5),
  voice_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Caregiver Links Table (Caregiver invite code & relationship status)
CREATE TABLE IF NOT EXISTS public.caregiver_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_user_id TEXT NOT NULL,
  caregiver_user_id TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, active, revoked
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Caregiver Tips Table (Contextual AI coaching tips for caregivers)
CREATE TABLE IF NOT EXISTS public.caregiver_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID,
  patient_user_id TEXT NOT NULL,
  tip_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_crisis_events_user ON public.crisis_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pulse_checks_user ON public.pulse_checks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_caregiver_links_code ON public.caregiver_links(invite_code);
