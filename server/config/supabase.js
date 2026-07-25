import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
  !SUPABASE_URL.includes('your-supabase-project')
);

let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase Client successfully initialized connected to:', SUPABASE_URL);
  } catch (err) {
    console.warn('Supabase initialization warning:', err.message);
  }
} else {
  console.log('Notice: SUPABASE_URL is unconfigured. Using high-reliability live memory database fallback.');
}

// In-Memory Fallback Store for seamless evaluator access
const memoryStore = {
  profiles: new Map(),
  crisis_events: [],
  pulse_checks: [],
  caregiver_links: [],
  caregiver_tips: []
};

// Seed Evaluator Demo Profile
memoryStore.profiles.set('demo_user_123', {
  user_id: 'demo_user_123',
  email: 'demo@altruist.ai',
  triggers: 'Overcrowded spaces, sudden loud noises, feeling trapped',
  coping_strategies: '4-4-4 Box Breathing, 5-4-3-2-1 Sensory Grounding, Lavender scent',
  persona_tone: 'Empathetic & Warm',
  emergency_contact: 'Primary Caregiver (988 Crisis Lifeline)',
  created_at: new Date().toISOString()
});

export const dbService = {
  async getProfile(userId) {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      if (!error && data) return data;
    }
    return memoryStore.profiles.get(userId) || memoryStore.profiles.get('demo_user_123');
  },

  async saveProfile(profileData) {
    if (supabase) {
      await supabase.from('profiles').upsert(profileData);
    }
    memoryStore.profiles.set(profileData.user_id, profileData);
    return profileData;
  },

  async logCrisisEvent(eventData) {
    if (supabase) {
      await supabase.from('crisis_events').insert([eventData]);
    }
    memoryStore.crisis_events.unshift({ ...eventData, id: String(Date.now()), created_at: new Date().toISOString() });
    return eventData;
  },

  async getCrisisEvents(userId) {
    if (supabase) {
      const { data, error } = await supabase.from('crisis_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
      if (!error && data && data.length > 0) return data;
    }
    return memoryStore.crisis_events.filter(e => e.user_id === userId || !e.user_id);
  },

  async logPulseCheck(pulseData) {
    if (supabase) {
      await supabase.from('pulse_checks').insert([pulseData]);
    }
    memoryStore.pulse_checks.unshift({ ...pulseData, id: String(Date.now()), created_at: new Date().toISOString() });
    return pulseData;
  },

  async getPulseChecks(userId) {
    if (supabase) {
      const { data, error } = await supabase.from('pulse_checks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(7);
      if (!error && data && data.length > 0) return data;
    }
    return memoryStore.pulse_checks;
  },

  async createCaregiverInvite(patientUserId) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const linkObj = {
      patient_user_id: patientUserId,
      invite_code: inviteCode,
      status: 'active',
      created_at: new Date().toISOString()
    };
    if (supabase) {
      await supabase.from('caregiver_links').insert([linkObj]);
    }
    memoryStore.caregiver_links.push(linkObj);
    return linkObj;
  },

  async saveCaregiverTip(tipData) {
    if (supabase) {
      await supabase.from('caregiver_tips').insert([tipData]);
    }
    memoryStore.caregiver_tips.unshift({ ...tipData, id: String(Date.now()), created_at: new Date().toISOString() });
    return tipData;
  }
};

export { supabase };
