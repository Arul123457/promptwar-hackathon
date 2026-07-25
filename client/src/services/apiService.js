/**
 * Backend API Client Service for Altruist AI
 * Routes calls to Express server endpoints.
 * NEVER calls Groq or internal APIs directly from the browser.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

  async demoLogin() {
    return await postJSON('/api/auth/demo-login', {});
  },

  async saveOnboardingProfile(profileData) {
    return await postJSON('/api/onboarding', profileData);
  },

  async sendCrisisInput(text, type = 'voice') {
    return await postJSON('/api/crisis', { text, type });
  },

  async saveDailyPulse(pulseData) {
    return await postJSON('/api/pulse', pulseData);
  },

  async generateCaregiverInvite() {
    return await postJSON('/api/caregiver/invite', {});
  },

  async askCaregiverAdvisor(query) {
    return await postJSON('/api/caregiver-tip', { query });
  },

  async fetchPatientTrends() {
    return await getJSON('/api/caregiver/patient-trends');
  },

  async queryLearnHub(query) {
    return await postJSON('/api/learn/query', { query });
  }
};
