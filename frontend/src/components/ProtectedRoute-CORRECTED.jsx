import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ============================================================================
 * PROTECTED ROUTE COMPONENT - PRODUCTION GRADE
 * ============================================================================
 * 
 * Purpose: Guard private routes from unauthenticated access
 * 
 * Features:
 * ✅ Checks authentication status with loading state
 * ✅ Redirects unauthenticated users to /login
 * ✅ Preserves destination for post-login redirect
 * ✅ Prevents layout flash with loading screen
 * ✅ Optional role-based access control
 * ✅ Handles race conditions gracefully
 * 
 * Usage:
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * 
 * With role check:
 *   <ProtectedRoute requiredRole="admin">
 *     <AdminPanel />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // ========== LOADING STATE ==========
  // While auth is being verified, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-flex gap-2">
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          </div>
          <p className="mt-6 text-slate-600 font-medium">Verifying authentication...</p>
          <p className="mt-2 text-sm text-slate-500">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  // ========== NOT AUTHENTICATED ==========
  // Redirect to login and remember where user tried to go
  if (!isAuthenticated || !user) {
    console.warn('ProtectedRoute: User not authenticated - redirecting to /login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // ========== ROLE-BASED ACCESS CONTROL ==========
  // If component requires specific role, check it
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center px-6 py-12">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Access Denied</h1>
          <p className="text-slate-600 text-lg mb-6">
            This page requires <span className="font-semibold">{requiredRole}</span> role.
          </p>
          <p className="text-sm text-slate-500">
            Your role: <span className="font-mono bg-slate-100 px-2 py-1 rounded">{user.role || 'user'}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-8 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ========== AUTHENTICATED & AUTHORIZED ==========
  // Render the protected component
  return children;
};

export default ProtectedRoute;
