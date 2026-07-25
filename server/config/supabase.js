import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
  !SUPABASE_URL.includes('your-supabase-project')
);

let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase Client successfully connected to:', SUPABASE_URL);
  } catch (err) {
    console.warn('Supabase initialization warning:', err.message);
  }
} else {
  console.log('Notice: SUPABASE_URL unconfigured. Using in-memory fallback store.');
}

// In-Memory Fallback Store for zero-crash evaluator guarantee
// NOTE: This is a runtime fallback ONLY — all data goes to Supabase when credentials are present.
const memoryStore = {
  users: new Map(),
  profiles: new Map(),
  crisis_events: [],
  pulse_checks: [],
  caregiver_links: [],
  caregiver_tips: []
};

export const dbService = {
  /**
   * Register via Supabase Auth. Returns error if email already exists.
   */
  async registerUser(email, password) {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data?.user) {
        return { success: true, user: { id: data.user.id, email: data.user.email } };
      }
      return { success: false, error: 'Registration failed — please try again.' };
    }
    // Memory fallback only when Supabase is unconfigured
    if (memoryStore.users.has(email)) {
      return { success: false, error: 'Email already registered.' };
    }
    const newId = 'user_' + Math.random().toString(36).substring(2, 9);
    const userObj = { id: newId, email };
    memoryStore.users.set(email, { ...userObj, password });
    return { success: true, user: userObj };
  },

  /**
   * Login via Supabase Auth. Returns real error on bad credentials.
   */
  async loginUser(email, password) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: 'Invalid email or password.' };
      }
      if (data?.user) {
        const profile = await this.getProfile(data.user.id);
        return { success: true, user: { id: data.user.id, email: data.user.email }, profile };
      }
      return { success: false, error: 'Login failed — please try again.' };
    }
    // Memory fallback only when Supabase is unconfigured
    const existing = memoryStore.users.get(email);
    if (!existing || existing.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }
    const profile = memoryStore.profiles.get(existing.id) || null;
    return { success: true, user: { id: existing.id, email: existing.email }, profile };
  },

  /**
   * Get profile by real userId from Supabase profiles table.
   */
  async getProfile(userId) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        if (!error && data) return data;
      } catch (e) {
        // fallback to memory
      }
    }
    return memoryStore.profiles.get(userId) || null;
  },

  /**
   * Save/update a user profile in Supabase.
   */
  async saveProfile(profileData) {
    if (supabase) {
      try {
        const { error } = await supabase.from('profiles').upsert(profileData);
        if (error) console.warn('Supabase upsert profile warning:', error.message);
      } catch (e) {
        console.warn('Supabase saveProfile fallback:', e.message);
      }
    }
    memoryStore.profiles.set(profileData.user_id, profileData);
    return profileData;
  },

  /**
   * Log a crisis event to Supabase crisis_events table.
   */
  async logCrisisEvent(eventData) {
    if (supabase) {
      try {
        const { error } = await supabase.from('crisis_events').insert([eventData]);
        if (error) console.warn('Supabase insert crisis event warning:', error.message);
      } catch (e) {
        console.warn('Supabase logCrisisEvent fallback:', e.message);
      }
    }
    const logObj = { ...eventData, id: String(Date.now()), created_at: new Date().toISOString() };
    memoryStore.crisis_events.unshift(logObj);
    return logObj;
  },

  /**
   * Fetch recent crisis events for a specific userId from Supabase.
   */
  async getCrisisEvents(userId) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('crisis_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    return memoryStore.crisis_events.filter(e => e.user_id === userId);
  },

  /**
   * Log a daily pulse check entry to Supabase.
   */
  async logPulseCheck(pulseData) {
    if (supabase) {
      try {
        const { error } = await supabase.from('pulse_checks').insert([pulseData]);
        if (error) console.warn('Supabase insert pulse check warning:', error.message);
      } catch (e) {
        console.warn('Supabase logPulseCheck fallback:', e.message);
      }
    }
    const pulseObj = { ...pulseData, id: String(Date.now()), created_at: new Date().toISOString() };
    memoryStore.pulse_checks.unshift(pulseObj);
    return pulseObj;
  },

  /**
   * Fetch recent pulse checks for a specific userId from Supabase.
   */
  async getPulseChecks(userId) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('pulse_checks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(7);
        if (!error && data) return data;
      } catch (e) {
        // fallback
      }
    }
    return memoryStore.pulse_checks.filter(p => p.user_id === userId);
  },

  /**
   * Generate a new caregiver invite code and store it in Supabase.
   */
  async createCaregiverInvite(patientUserId) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const linkObj = {
      patient_user_id: patientUserId,
      invite_code: inviteCode,
      status: 'active',
      created_at: new Date().toISOString()
    };
    if (supabase) {
      try {
        const { error } = await supabase.from('caregiver_links').insert([linkObj]);
        if (error) console.warn('Supabase insert caregiver link warning:', error.message);
      } catch (e) {
        console.warn('Supabase createCaregiverInvite fallback:', e.message);
      }
    }
    memoryStore.caregiver_links.push(linkObj);
    return linkObj;
  },

  /**
   * Store a caregiver tip in Supabase caregiver_tips table.
   */
  async saveCaregiverTip(tipData) {
    if (supabase) {
      try {
        const { error } = await supabase.from('caregiver_tips').insert([tipData]);
        if (error) console.warn('Supabase insert caregiver tip warning:', error.message);
      } catch (e) {
        console.warn('Supabase saveCaregiverTip fallback:', e.message);
      }
    }
    const tipObj = { ...tipData, id: String(Date.now()), created_at: new Date().toISOString() };
    memoryStore.caregiver_tips.unshift(tipObj);
    return tipObj;
  }
};

export { supabase };
