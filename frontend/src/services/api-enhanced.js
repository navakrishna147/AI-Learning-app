import axios from 'axios';

/**
 * ============================================================================
 * PRODUCTION-READY API SERVICE - ENHANCED
 * ============================================================================
 * 
 * Improvements over original:
 * 1. Better disconnection detection and recovery
 * 2. Comprehensive error categorization
 * 3. Proper backoff strategies
 * 4. Pre-request backend availability check
 * 5. Detailed connectivity diagnostics
 * 
 * Key Features:
 * - Uses Vite proxy for development (/api)
 * - Absolute URLs for production
 * - Automatic health check before login
 * - Circuit breaker pattern
 * - Exponential backoff retry
 */

/**
 * Get backend configuration from environment
 */
const getBackendConfig = () => {
  const isProduction = import.meta.env.MODE === 'production';
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';
  const apiPath = import.meta.env.VITE_API_URL || '/api';
  const timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '60000');
  const debug = import.meta.env.VITE_DEBUG_API === 'true' || import.meta.env.VITE_DEBUG_MODE === 'true';

  return {
    backendUrl,
    apiPath,
    timeout,
    debug,
    isProduction,
    // In development, Vite proxy means same-origin requests
    isUsingProxy: !isProduction && apiPath.startsWith('/'),
  };
};

/**
 * Create production-grade Axios instance
 */
const createApiInstance = () => {
  const config = getBackendConfig();

  const instance = axios.create({
    baseURL: config.apiPath,
    timeout: config.timeout,
    // Using proxy: same-origin, no credentials needed
    // Direct URL: may need withCredentials
    withCredentials: !config.isUsingProxy,
  });

  // ========== REQUEST INTERCEPTOR ==========
  instance.interceptors.request.use(
    (requestConfig) => {
      // Attach JWT token if available
      const token = localStorage.getItem('token');
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }

      // Handle FormData - don't set Content-Type for FormData
      if (requestConfig.data instanceof FormData) {
        delete requestConfig.headers['Content-Type'];
      } else {
        requestConfig.headers['Content-Type'] = 'application/json';
      }

      if (config.debug) {
        console.log(`📤 API: ${requestConfig.method.toUpperCase()} ${requestConfig.url}`);
      }

      return requestConfig;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // ========== RESPONSE INTERCEPTOR ==========
  instance.interceptors.response.use(
    (response) => {
      if (config.debug) {
        console.log(`📥 API Response: ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error) => {
      // ===== HANDLE 401 UNAUTHORIZED =====
      if (error.response?.status === 401) {
        console.warn('⚠️  Session expired (401 Unauthorized)');
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login?reason=expired';
        }

        return Promise.reject({
          ...error,
          message: 'Session expired. Please login again.',
          code: 'AUTH_EXPIRED',
          isAuthError: true,
        });
      }

      // ===== HANDLE NETWORK ERRORS (NO RESPONSE) =====
      if (!error.response) {
        const code = error.code;

        // Timeout
        if (code === 'ECONNABORTED') {
          return Promise.reject({
            ...error,
            message: 'Request timeout. Backend server is slow or unresponsive.',
            code: 'REQUEST_TIMEOUT',
            isNetworkError: true,
            diagnostic: {
              cause: 'Network request exceeded timeout',
              timeout: error.config?.timeout || 'unknown',
              solution: 'Check MongoDB connection and backend logs',
            }
          });
        }

        // Network error
        if (code === 'ERR_NETWORK' || code === 'ENOTFOUND') {
          return Promise.reject({
            ...error,
            message: 'Network error. Cannot reach backend server.',
            code: 'NETWORK_ERROR',
            isNetworkError: true,
            isConnectivityIssue: true,
            diagnostic: {
              cause: 'Network layer failed',
              solution: 'Check backend is running on correct port',
              debugSteps: [
                'Verify backend is running: npm run dev',
                'Verify PORT in backend/.env is 5000',
                'Check: http://127.0.0.1:5000/health',
                'Verify frontend VITE_BACKEND_URL matches backend',
              ]
            }
          });
        }

        // Connection refused (most common for stopped backend)
        if (code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
          return Promise.reject({
            ...error,
            message: 'Backend server connection refused. Server may not be running.',
            code: 'CONNECTION_REFUSED',
            isNetworkError: true,
            isConnectivityIssue: true,
            critical: true,
            diagnostic: {
              cause: 'Backend server is not listening on the specified port',
              port: config.backendUrl.match(/:(\d+)/)?.[1] || 5000,
              solution: 'Start the backend server',
              debugSteps: [
                '1. Open new terminal and navigate to backend directory',
                '2. Run: npm run dev',
                '3. Wait for "✅ APPLICATION STARTED SUCCESSFULLY" message',
                '4. Verify you see "🚀 Server Port: 5000"',
                '5. Test health endpoint: http://127.0.0.1:5000/health',
                '6. Refresh frontend and retry',
              ],
              mongoCheck: 'Ensure MongoDB is also running (mongod)',
              corsCheck: 'Backend CORS_ORIGINS should include http://localhost:5173',
            }
          });
        }

        // Generic network error
        return Promise.reject({
          ...error,
          message: `Network error (${code}): Cannot connect to backend.`,
          code: 'NETWORK_ERROR',
          isNetworkError: true,
          rawCode: code,
        });
      }

      // ===== HANDLE 5xx SERVER ERRORS =====
      if (error.response?.status >= 500) {
        console.error('❌ Backend server error:', error.response.status);
        return Promise.reject({
          ...error,
          message: error.response.data?.message || 'Backend server error. Please try again.',
          code: 'SERVER_ERROR',
          status: error.response.status,
        });
      }

      // ===== HANDLE 4xx CLIENT ERRORS =====
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return Promise.reject({
          ...error,
          message: error.response.data?.message || 'Invalid request.',
          code: 'CLIENT_ERROR',
          status: error.response.status,
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

/**
 * ============================================================================
 * HEALTH CHECK MANAGER - CIRCUIT BREAKER PATTERN
 * ============================================================================
 */
class HealthCheckManager {
  constructor() {
    this.isAvailable = true;
    this.isChecking = false;
    this.consecutiveFailures = 0;
    this.maxFailures = 3;
    this.backoffDelay = 1000; // Start at 1 second
    this.maxBackoffDelay = 30000; // Max 30 seconds
    this.lastCheckTime = null;
    this.checkInterval = null;
  }

  /**
   * Check if backend is available
   */
  async checkHealth(force = false) {
    // Prevent concurrent checks
    if (this.isChecking && !force) {
      return this.isAvailable;
    }

    // Rate limit checks - don't check more than once per 2 seconds
    if (!force && this.lastCheckTime && Date.now() - this.lastCheckTime < 2000) {
      return this.isAvailable;
    }

    this.isChecking = true;
    this.lastCheckTime = Date.now();

    try {
      const config = getBackendConfig();

      // Build health check URL
      let healthUrl;
      if (config.isUsingProxy) {
        healthUrl = '/api/health';
      } else {
        healthUrl = `${config.backendUrl}/api/health`;
      }

      if (config.debug) {
        console.log(`🔍 Health check: ${healthUrl}`);
      }

      // Use raw fetch for health check (bypass interceptors)
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
        credentials: config.isUsingProxy ? 'same-origin' : 'omit',
      });

      this.isAvailable = response.ok;

      if (this.isAvailable) {
        this.consecutiveFailures = 0;
        if (config.debug) {
          console.log('✅ Backend health check passed');
        }
      } else {
        this.consecutiveFailures++;
        console.warn(`⚠️  Backend health check failed (${this.consecutiveFailures}/${this.maxFailures})`);
      }
    } catch (error) {
      this.consecutiveFailures++;
      this.isAvailable = this.consecutiveFailures < this.maxFailures;

      if (this.consecutiveFailures >= this.maxFailures) {
        console.error('❌ Backend unavailable - circuit breaker OPEN');
      }
    } finally {
      this.isChecking = false;
    }

    return this.isAvailable;
  }

  /**
   * Start periodic health monitoring
   */
  startMonitoring(intervalMs = 5000) {
    if (this.checkInterval) clearInterval(this.checkInterval);

    this.checkInterval = setInterval(() => {
      this.checkHealth().catch(err => console.error('Monitoring error:', err));
    }, intervalMs);
  }

  /**
   * Stop periodic monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Global health check manager (singleton)
const healthCheckManager = new HealthCheckManager();

// ============================================================================
// EXPORTED API FUNCTIONS
// ============================================================================

/**
 * Make HTTP request with automatic health check
 * Rejects with detailed error info if backend unreachable
 */
export const makeRequest = async (method, path, data = null, options = {}) => {
  // Pre-flight: Check backend availability
  const isHealthy = await healthCheckManager.checkHealth();

  if (!isHealthy) {
    throw {
      message: 'Backend is not responding. Retrying automatically...',
      code: 'BACKEND_UNAVAILABLE',
      isConnectivityIssue: true,
      canRetry: true,
    };
  }

  // Make the actual request
  try {
    let response;
    if (method === 'GET' || method === 'DELETE') {
      response = await api[method.toLowerCase()](path, options);
    } else {
      response = await api[method.toLowerCase()](path, data, options);
    }
    return response.data;
  } catch (error) {
    // Propagate enhanced error
    throw error;
  }
};

/**
 * Authentication endpoints
 */
export const loginUser = async (email, password) => {
  return makeRequest('POST', '/auth/login', { email, password });
};

export const registerUser = async (userData) => {
  return makeRequest('POST', '/auth/signup', userData);
};

export const logoutUser = async () => {
  return makeRequest('POST', '/auth/logout');
};

export const getProfile = async () => {
  return makeRequest('GET', '/auth/profile');
};

/**
 * Health check endpoint for frontend
 */
export const checkBackendHealth = async () => {
  return healthCheckManager.checkHealth(true);
};

/**
 * Start/stop health monitoring
 */
export const startHealthMonitoring = (intervalMs = 5000) => {
  healthCheckManager.startMonitoring(intervalMs);
};

export const stopHealthMonitoring = () => {
  healthCheckManager.stopMonitoring();
};

/**
 * Get backend availability status
 */
export const isBackendAvailable = () => {
  return healthCheckManager.isAvailable;
};

/**
 * Retry a failed request with exponential backoff
 */
export const retryRequest = async (
  requestFn,
  maxRetries = 3,
  initialDelayMs = 1000
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's not a connectivity issue
      if (!error.isConnectivityIssue && !error.isNetworkError) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1);
        console.log(`⏳ Retry ${attempt}/${maxRetries} in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
};

/**
 * Default axios instance
 */
export default api;
