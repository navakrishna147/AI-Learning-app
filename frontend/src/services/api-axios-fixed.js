import axios from 'axios'

/**
 * ============================================================================
 * AXIOS CONFIGURATION - PRODUCTION-READY API SERVICE
 * ============================================================================
 * 
 * This is the centralized API client for all frontend requests
 * 
 * Configuration:
 * ✅ Vite proxy for development (/api → backend)
 * ✅ Direct URL fallback for production
 * ✅ Automatic JWT token injection
 * ✅ Proper error handling and diagnostics
 * ✅ Request/response logging
 * ✅ Timeout handling
 * 
 * Usage:
 *   import api from '@/services/api-axios-fixed'
 *   api.post('/auth/login', { email, password })
 *   api.get('/documents')
 *   api.delete('/profile')
 */

// ============================================================================
// CONFIGURATION SETUP
// ============================================================================

/**
 * Determine backend URL based on environment
 */
const getApiConfig = () => {
  const isDevelopment = import.meta.env.MODE === 'development'
  const isProduction = import.meta.env.MODE === 'production'

  // In development: Use Vite proxy (starts with /)
  // In production: Use absolute URL from env
  const apiUrl = isDevelopment
    ? '/api'  // Uses Vite proxy
    : (import.meta.env.VITE_API_URL || '/api')

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'

  return {
    apiUrl,
    backendUrl,
    isDevelopment,
    isProduction,
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '60000'),
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  }
}

const config = getApiConfig()

// ============================================================================
// CREATE AXIOS INSTANCE
// ============================================================================

const api = axios.create({
  // Base URL for API requests
  baseURL: config.apiUrl,

  // Request timeout
  timeout: config.timeout,

  // Don't send cookies in cross-origin requests (using proxy)
  withCredentials: false,

  // Default headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
})

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

api.interceptors.request.use(
  (requestConfig) => {
    // Attach JWT token from localStorage if available
    const token = localStorage.getItem('token')
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
      
      if (config.debugMode) {
        console.log('🔑 JWT token attached to request')
      }
    }

    // Handle FormData (don't set Content-Type)
    if (requestConfig.data instanceof FormData) {
      delete requestConfig.headers['Content-Type']
    }

    // Debug logging
    if (config.debugMode) {
      console.log(`📤 API Request:`)
      console.log(`   Method: ${requestConfig.method.toUpperCase()}`)
      console.log(`   URL: ${requestConfig.url}`)
      if (requestConfig.data && !(requestConfig.data instanceof FormData)) {
        console.log(`   Data:`, requestConfig.data)
      }
    }

    return requestConfig
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

api.interceptors.response.use(
  (response) => {
    if (config.debugMode) {
      console.log(`📥 API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    const errorInfo = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
    }

    // ===== 401 UNAUTHORIZED - SESSION EXPIRED =====
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized (401) - Session expired or invalid')
      // Clear auth
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?redirected=true'
      }
      return Promise.reject({
        ...errorInfo,
        message: 'Your session has expired. Please login again.',
        isAuthError: true
      })
    }

    // ===== 403 FORBIDDEN - NO PERMISSION =====
    if (error.response?.status === 403) {
      console.error('❌ Forbidden (403) - No permission')
      return Promise.reject({
        ...errorInfo,
        message: 'You do not have permission to perform this action.',
        isForbidden: true
      })
    }

    // ===== 4xx CLIENT ERRORS =====
    if (error.response?.status >= 400 && error.response?.status < 500) {
      const errMsg = error.response.data?.message || 'Invalid request'
      console.error(`❌ Client Error (${error.response.status}): ${errMsg}`)
      return Promise.reject({
        ...errorInfo,
        message: errMsg,
        isClientError: true
      })
    }

    // ===== 5xx SERVER ERRORS =====
    if (error.response?.status >= 500) {
      const errMsg = error.response.data?.message || 'Server error'
      console.error(`🔴 Server Error (${error.response.status}): ${errMsg}`)
      return Promise.reject({
        ...errorInfo,
        message: errMsg,
        isServerError: true
      })
    }

    // ===== NETWORK ERRORS (NO RESPONSE) =====
    if (!error.response) {
      const code = error.code

      // Connection refused
      if (code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        console.error('\n' + '═'.repeat(70))
        console.error('🔴 CRITICAL: BACKEND CONNECTION REFUSED')
        console.error('═'.repeat(70))
        console.error('URL:', error.config?.url)
        console.error('Target:', config.backendUrl)
        console.error('')
        console.error('❌ PROBLEM: Backend server is not running or not accessible')
        console.error('')
        console.error('✅ SOLUTION:')
        console.error('   1. Open new terminal')
        console.error('   2. cd backend')
        console.error('   3. npm run dev')
        console.error('   4. Wait for: "✅ SERVER STARTED SUCCESSFULLY"')
        console.error('   5. Verify: curl http://localhost:5000/health')
        console.error('   6. Back to browser - REFRESH (F5)')
        console.error('')
        console.error('📋 Checklist:')
        console.error('   ✅ Backend port is 5000 (in backend/.env)')
        console.error('   ✅ MongoDB is running')
        console.error('   ✅ CORS_ORIGINS includes http://localhost:5173')
        console.error('   ✅ No port conflicts on 5000')
        console.error('═'.repeat(70) + '\n')

        return Promise.reject({
          ...errorInfo,
          message: 'Backend server is not responding. Ensure backend is running: npm run dev',
          isConnectionError: true,
          isCritical: true,
          diagnostic: {
            expected: config.backendUrl,
            solution: 'Start backend server: cd backend && npm run dev'
          }
        })
      }

      // Timeout
      if (code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.error('❌ Request timeout - backend is slow')
        return Promise.reject({
          ...errorInfo,
          message: 'Request timeout. Backend server is slow or not responding.',
          isTimeoutError: true
        })
      }

      // Network error
      if (code === 'ERR_NETWORK' || code === 'ENOTFOUND') {
        console.error('❌ Network error - cannot reach backend')
        return Promise.reject({
          ...errorInfo,
          message: 'Network error. Cannot reach backend server.',
          isNetworkError: true
        })
      }

      // Generic network error
      console.error(`❌ Network Error (${code}): ${error.message}`)
      return Promise.reject({
        ...errorInfo,
        message: `Network error: ${error.message}`,
        isNetworkError: true
      })
    }

    // Unknown error
    console.error('❌ Unknown error:', error)
    return Promise.reject({
      ...errorInfo,
      message: error.message || 'An unknown error occurred'
    })
  }
)

// ============================================================================
// EXPORTED API INSTANCE
// ============================================================================

export default api

// ============================================================================
// HELPER FUNCTIONS FOR COMMON REQUESTS
// ============================================================================

/**
 * Login user
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

/**
 * Register user
 */
export const register = async (userData) => {
  const response = await api.post('/auth/signup', userData)
  return response.data
}

/**
 * Logout user
 */
export const logout = async () => {
  const response = await api.post('/auth/logout')
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  return response.data
}

/**
 * Get current user profile
 */
export const getProfile = async () => {
  const response = await api.get('/auth/profile')
  return response.data
}

/**
 * Check if backend is available
 * This can be called before attempting login
 */
export const checkBackendHealth = async () => {
  try {
    const response = await axios.get(`${config.backendUrl}/health`, {
      timeout: 5000
    })
    return response.status === 200
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message)
    return false
  }
}

/**
 * Retry a failed request with exponential backoff
 */
export const retryRequest = async (
  requestFn,
  maxAttempts = 3,
  initialDelayMs = 1000
) => {
  let lastError
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      
      // Only retry network errors
      if (!error.isNetworkError && !error.isConnectionError) {
        throw error
      }

      if (attempt < maxAttempts) {
        const delayMs = initialDelayMs * Math.pow(2, attempt - 1)
        console.log(`⏳ Attempt ${attempt}/${maxAttempts} failed, retrying in ${delayMs}ms...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }
  }

  throw lastError
}

// ============================================================================
// FRONTEND ENVIRONMENT CONFIGURATION (FOR DEBUGGING)
// ============================================================================

if (config.debugMode) {
  console.log('\n' + '═'.repeat(70))
  console.log('🔧 API CONFIGURATION')
  console.log('═'.repeat(70))
  console.log(`Environment: ${config.isDevelopment ? 'Development' : 'Production'}`)
  console.log(`API Base URL: ${config.apiUrl}`)
  console.log(`Backend URL: ${config.backendUrl}`)
  console.log(`Timeout: ${config.timeout}ms`)
  console.log(`Using Proxy: ${config.apiUrl === '/api' ? 'Yes (/api proxy)' : 'No (direct URL)'}`)
  console.log('═'.repeat(70) + '\n')
}
