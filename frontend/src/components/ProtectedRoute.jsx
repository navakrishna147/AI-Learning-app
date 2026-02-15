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
 * - Checks authentication status with proper loading state
 * - Redirects unauthenticated users to login
 * - Preserves redirect path for better UX
 * - Prevents layout flash with loading screen
 * - Handles race conditions gracefully
 * 
 * Usage:
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // ========== LOADING STATE ==========
  // Show loading screen while auth is being verified
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // ========== UNAUTHENTICATED ==========
  // Redirect to login with return path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ========== ROLE CHECKING (OPTIONAL) ==========
  // If component requires specific role, check it
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // ========== AUTHENTICATED ==========
  // Render protected component
  return children;
};

export default ProtectedRoute;
