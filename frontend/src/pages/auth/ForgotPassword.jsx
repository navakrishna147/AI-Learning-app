import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Sparkles, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');

    // Validation
    if (!email) {
      setError('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending forgot password request for:', email);
      const { data } = await api.post('/auth/forgot-password', { email });

      console.log('Forgot password response:', data);

      if (data.success) {
        setSubmitted(true);
        setEmail('');
        setDebugInfo(`Email sent to: ${data.email || email}`);
      } else {
        setError(data.message || 'Failed to send reset email');
        setDebugInfo(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.message || error.message || 'An error occurred. Please try again.';
      setError(message);
      setDebugInfo(`Error details: ${JSON.stringify(error.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">
              Check Your Email
            </h1>

            {/* Success Message */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-emerald-800 text-sm text-center">
                We've sent a password reset link to <strong>{email || 'your email'}</strong>
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 font-bold">
                    1
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Check your inbox</p>
                  <p className="text-gray-600 text-sm">Look for an email from us</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 font-bold">
                    2
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Click the reset link</p>
                  <p className="text-gray-600 text-sm">Opens in a new window</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 font-bold">
                    3
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 font-medium">Create a new password</p>
                  <p className="text-gray-600 text-sm">At least 6 characters</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <p className="text-amber-800 text-sm">
                <strong>⏰ Note:</strong> The reset link expires in 30 minutes. If you don't see the email, check your spam folder.
              </p>
            </div>

            {/* Back to Login */}
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </Link>

            {/* Resend Link */}
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
              className="w-full mt-3 text-emerald-600 hover:text-emerald-700 font-medium py-2 transition-colors"
            >
              Try Another Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your email to receive a password reset link
          </p>

          {/* Error Message - Fixed Height to Prevent Shift */}
          <div className="h-14 mb-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll send you an email with instructions to reset your password.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>

          {/* Security Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>🔒 Security:</strong> We take your security seriously. This link is valid for only 30 minutes and can only be used once.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
