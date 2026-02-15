/**
 * Backend Connection Utility
 * Uses the Vite proxy so no hardcoded URLs are needed.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const checkBackendConnection = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return { connected: true, message: 'Backend is running', data };
    }
    return { connected: false, message: `Backend returned ${res.status}` };
  } catch (err) {
    return {
      connected: false,
      message: 'Unable to reach backend. Is the server running?',
      error: err.message,
    };
  }
};

export const getBackendUrl = () => API_BASE;

