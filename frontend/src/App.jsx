import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EnhancedDashboard from './pages/EnhancedDashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import Flashcards from './pages/Flashcards';
import Profile from './pages/Profile';

/**
 * ============================================================================
 * PUBLIC ROUTE - Allow access only to unauthenticated users
 * ============================================================================
 * Redirects authenticated users to dashboard
 */
const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return !isAuthenticated || !user ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* ========== ROOT ROUTE - REDIRECT TO LOGIN ========== */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ========== AUTHENTICATION ROUTES - PUBLIC ========== */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* ========== PROTECTED ROUTES - REQUIRE AUTHENTICATION ========== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <EnhancedDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <Documents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <DocumentDetail />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/flashcards"
        element={
          <ProtectedRoute>
            <Flashcards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ========== FALLBACK - CATCH ALL UNDEFINED ROUTES ========== */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
