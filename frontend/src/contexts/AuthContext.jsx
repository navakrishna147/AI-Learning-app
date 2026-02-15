import { createContext, useState, useContext, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, {
  checkBackendHealth,
  startHealthCheckRetry,
  stopHealthCheckRetry,
  getHealthStatus,
  cleanupHealthCheck
} from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backendAvailable, setBackendAvailable] = useState(true);
  const navigate = useNavigate();
  
  // Use ref for navigate to avoid stale closures in useCallback
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        // Non-blocking health check — don't gate the UI on this.
        // If backend is down the login POST will fail and we handle it there.
        console.log('🔍 Background backend health check...');
        const isHealthy = await checkBackendHealth(3000);
        if (!isHealthy) {
          console.warn('⚠️ Backend unavailable on startup — login will auto-retry');
          setBackendAvailable(false);
          startHealthCheckRetry((recovered) => {
            if (recovered) {
              setBackendAvailable(true);
              console.log('✅ Backend recovered, authentication ready');
            }
          });
        }

        // If both user and token exist, validate the token
        if (storedUser && storedToken && isHealthy) {
          try {
            // Validate token by fetching profile
            const { data } = await api.get('/auth/profile');
            if (data.success) {
              const parsedUser = JSON.parse(storedUser);
              const updatedUser = {
                ...parsedUser,
                ...data.user,
                token: storedToken
              };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
              console.log('✅ User session restored from storage');
            } else {
              // Token invalid - clear storage
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              setUser(null);
              console.warn('⚠️ Stored token is invalid');
            }
          } catch (err) {
            // Token validation failed
            if (err.networkError) {
              // Network error during startup - keep cached user
              console.warn('⚠️ Network error during auth validation - keeping cached user');
              try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
              } catch (e) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
              }
            } else {
              // Other error - clear auth
              console.error('❌ Auth validation failed:', err.message);
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              setUser(null);
            }
          }
        } else if (storedUser && storedToken && !isHealthy) {
          // Backend down but user cached - restore from cache temporarily
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log('ℹ️ Backend unavailable - using cached user session');
          } catch (e) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      stopHealthCheckRetry();
      cleanupHealthCheck();
      console.log('🧹 Auth context cleanup completed');
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError('');

      // Attempt login directly — no pre-flight health check needed.
      // If backend is down, the POST itself will fail and we handle it below.
      const { data } = await api.post('/auth/login', { email, password });

      if (data?.success) {
        const userData = {
          ...data.user,
          token: data.token
        };
        setBackendAvailable(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        setUser(userData);
        setError('');
        console.log('✅ Login successful');
        navigateRef.current('/dashboard');
        return { success: true };
      }

      // Backend returned success: false
      const fallbackMsg = data?.message || 'Login failed. Please try again.';
      setError(fallbackMsg);
      return { success: false, message: fallbackMsg };

    } catch (error) {
      let message = 'Login failed. Please try again.';

      // Detailed error handling
      if (error.networkError || !error.response) {
        message = '🔴 Unable to connect to backend. Check that the server is running.';
        console.error('❌ Backend Connection Error:', {
          message: error.message,
          code: error.code,
          requestUrl: error.config?.url,
        });

        setBackendAvailable(false);
        startHealthCheckRetry((recovered) => {
          if (recovered) {
            setBackendAvailable(true);
            setError('✅ Backend recovered! Please try signing in again.');
          }
        });

      } else if (error.response?.status === 401 || error.response?.status === 400) {
        message = 'Invalid email or password.';
        console.warn('⚠️ Invalid credentials provided');
      } else if (error.response?.status === 500) {
        message = 'Server error occurred. Please try again later.';
        console.error('❌ Server error:', error.response.data);
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      setError(message);
      return { success: false, message };
    }
  }, []);

  const signup = useCallback(async (username, email, password, confirmPassword) => {
    try {
      setError('');

      // Check backend availability
      const isAvailable = await checkBackendHealth(2000);
      if (!isAvailable) {
        setBackendAvailable(false);
        startHealthCheckRetry((recovered) => {
          if (recovered) setBackendAvailable(true);
        });
      }

      // Attempt signup regardless — backend may recover between check and POST
      const { data } = await api.post('/auth/signup', { 
        username, 
        email, 
        password,
        confirmPassword 
      });
      
      if (data?.success) {
        const userData = {
          ...data.user,
          token: data.token
        };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', data.token);
        setUser(userData);
        console.log('✅ Signup successful');
        navigateRef.current('/dashboard');
        return { success: true };
      }

      const signupMsg = data?.message || 'Signup failed. Please try again.';
      setError(signupMsg);
      return { success: false, message: signupMsg };

    } catch (error) {
      let message = 'Signup failed. Please try again.';
      
      if (error.networkError || !error.response) {
        message = '❌ Unable to connect to backend server.';
        setBackendAvailable(false);
        console.error('❌ Signup connection error:', error.message);
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      setError(message);
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to notify server
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setError('');
      navigateRef.current('/login');
    }
  }, []);

  const updateProfile = useCallback(async (userData) => {
    try {
      setError('');
      
      const isAvailable = await checkBackendHealth(2000);
      if (!isAvailable) {
        throw new Error('Backend unavailable');
      }

      const { data } = await api.put('/auth/profile', userData);
      
      if (data.success) {
        const updatedUser = {
          ...data.user,
          token: data.token || localStorage.getItem('token')
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        setUser(updatedUser);
        console.log('✅ Profile updated successfully');
        return { 
          success: true,
          message: data.message || 'Profile updated successfully'
        };
      }
      
      return { success: false, message: data?.message || 'Profile update failed' };
    } catch (error) {
      let message = 'Profile update failed';
      
      if (error.networkError || !error.response) {
        message = '❌ Unable to connect to backend server.';
        setBackendAvailable(false);
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      setError(message);
      return { success: false, message };
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      setError('');
      
      const isAvailable = await checkBackendHealth(2000);
      if (!isAvailable) {
        return { success: false, message: '❌ Backend unavailable. Please try again later.' };
      }

      const { data } = await api.post('/auth/forgot-password', { email });
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      let message = 'Failed to send reset email';
      
      if (error.networkError || !error.response) {
        message = '❌ Unable to connect to backend server.';
        setBackendAvailable(false);
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      setError(message);
      return { success: false, message };
    }
  }, []);

  const resetPassword = useCallback(async (token, password, confirmPassword) => {
    try {
      setError('');
      
      const isAvailable = await checkBackendHealth(2000);
      if (!isAvailable) {
        return { success: false, message: '❌ Backend unavailable. Please try again later.' };
      }

      const { data } = await api.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword
      });
      return {
        success: data.success,
        message: data.message
      };
    } catch (error) {
      let message = 'Failed to reset password';
      
      if (error.networkError || !error.response) {
        message = '❌ Unable to connect to backend server.';
        setBackendAvailable(false);
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      setError(message);
      return { success: false, message };
    }
  }, []);

  const validateResetToken = useCallback(async (token) => {
    try {
      setError('');
      
      const isAvailable = await checkBackendHealth(2000);
      if (!isAvailable) {
        return { success: false, message: '❌ Backend unavailable. Please try again later.' };
      }

      const { data } = await api.get(`/auth/reset-password/${token}`);
      return {
        success: data.success,
        email: data.email,
        message: data.message
      };
    } catch (error) {
      let message = 'Invalid or expired token';
      
      if (error.networkError || !error.response) {
        message = '❌ Unable to connect to backend server.';
        setBackendAvailable(false);
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  // Only changes when actual state values change, not on every AuthProvider render
  const value = useMemo(() => ({
    user,
    loading,
    error,
    setError,
    login,
    signup,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    validateResetToken,
    backendAvailable,
    isAuthenticated: !!user
  }), [user, loading, error, backendAvailable, login, signup, logout, updateProfile, forgotPassword, resetPassword, validateResetToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;