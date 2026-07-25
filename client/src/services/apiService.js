/**
 * Backend API Client Service
 * Encapsulates all server endpoint communications.
 * NEVER calls Groq API directly from browser.
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
    throw new Error(errorData.error || `Server returned error status: ${response.status}`);
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
    throw new Error(`Server returned status: ${response.status}`);
  }

  return response.json();
}

export const apiService = {
  // Check backend server health and Groq config status
  async checkHealth() {
    try {
      return await getJSON('/api/health');
    } catch (err) {
      console.warn('Backend server connection issue:', err.message);
      return { status: 'offline', groqConfigured: false };
    }
  },

  // Crisis Mode request
  async sendCrisisInput(text, type = 'voice') {
    return await postJSON('/api/crisis', { text, type });
  },

  // Caregiver AI advice query
  async askCaregiverAdvisor(query, patientState = 'calm') {
    return await postJSON('/api/caregiver/query', { query, patientState });
  },

  // Learn Tab educational query
  async queryLearnHub(query, topic = 'Mental Health') {
    return await postJSON('/api/learn/query', { query, topic });
  },

  // Safety plan getters & setters
  async getSafetyPlan() {
    return await getJSON('/api/caregiver/safety-plan');
  },

  async updateSafetyPlan(planData) {
    return await postJSON('/api/caregiver/safety-plan', planData);
  }
};
