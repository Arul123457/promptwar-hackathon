/**
 * Backend API Client Service for Altruist AI
 * Routes calls to Express server endpoints.
 * NEVER calls Groq or internal APIs directly from the browser.
 */

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  // If running locally in dev mode
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  // Production single-deployment Vercel rewrite
  return '';
};

const API_BASE_URL = getApiBaseUrl();

async function postJSON(endpoint, data) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error status: ${response.status}`);
  }

  return response.json();
}

async function getJSON(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

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
    return await postJSON('/api/onboarding', profileData);
  },

  async sendCrisisInput(text, type = 'voice', userId) {
    return await postJSON('/api/crisis', { text, type, userId });
  },

  async saveDailyPulse(pulseData) {
    return await postJSON('/api/pulse', pulseData);
  },

  async generateCaregiverInvite(userId) {
    return await postJSON('/api/caregiver/invite', { userId });
  },

  async askCaregiverAdvisor(query, userId) {
    return await postJSON('/api/caregiver-tip', { query, userId });
  },

  async fetchPatientTrends(userId) {
    if (!userId) return { success: false };
    return await getJSON(`/api/caregiver/patient-trends?userId=${encodeURIComponent(userId)}`);
  },

  async queryLearnHub(query) {
    return await postJSON('/api/learn/query', { query });
  }
};
