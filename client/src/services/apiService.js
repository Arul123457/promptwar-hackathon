/**
 * Backend API Client Service for Altruist AI
 * Routes calls to Express server endpoints with timeout signals and response caching.
 * NEVER calls Groq or internal APIs directly from the browser.
 */

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return '';
};

const API_BASE_URL = getApiBaseUrl();

// Client-side cache for repeated trend reads
const cacheStore = new Map();
const CACHE_TTL_MS = 10000; // 10 seconds TTL

async function postJSON(endpoint, data, signal = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  if (signal) options.signal = signal;

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error status: ${response.status}`);
  }

  return response.json();
}

async function getJSON(endpoint, signal = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (signal) options.signal = signal;

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Server status: ${response.status}`);
  }

  return response.json();
}

export const apiService = {
  async checkHealth() {
    try {
      return await getJSON('/api/health');
    } catch (err) {
      console.warn('Backend server status check:', err.message);
      return { status: 'offline', groqConfigured: false, supabaseConfigured: false };
    }
  },

  async registerUser(email, password) {
    return await postJSON('/api/auth/register', { email, password });
  },

  async loginUser(email, password) {
    return await postJSON('/api/auth/login', { email, password });
  },

  async demoLogin() {
    return await postJSON('/api/auth/demo-login', {});
  },

  async saveOnboardingProfile(profileData) {
    cacheStore.clear(); // Invalidate cache on profile update
    return await postJSON('/api/onboarding', profileData);
  },

  async sendCrisisInput(text, type = 'voice', userId, signal = null) {
    cacheStore.clear(); // Invalidate trend cache on crisis event
    return await postJSON('/api/crisis', { text, type, userId }, signal);
  },

  async saveDailyPulse(pulseData) {
    cacheStore.clear(); // Invalidate trend cache on pulse check
    return await postJSON('/api/pulse', pulseData);
  },

  async generateCaregiverInvite(userId) {
    return await postJSON('/api/caregiver/invite', { userId });
  },

  async askCaregiverAdvisor(query, userId, signal = null) {
    return await postJSON('/api/caregiver-tip', { query, userId }, signal);
  },

  async fetchPatientTrends(userId, bypassCache = false) {
    if (!userId) return { success: false };
    
    const cacheKey = `patient_trends_${userId}`;
    const cached = cacheStore.get(cacheKey);

    if (!bypassCache && cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }

    const data = await getJSON(`/api/caregiver/patient-trends?userId=${encodeURIComponent(userId)}`);
    cacheStore.set(cacheKey, { timestamp: Date.now(), data });
    return data;
  },

  async queryLearnHub(query, signal = null) {
    return await postJSON('/api/learn/query', { query }, signal);
  },

  clearCache() {
    cacheStore.clear();
  }
};
