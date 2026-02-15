import { useState, useEffect } from 'react';
import { User, Mail, Lock, Check, LogOut } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    bio: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || '',
        bio: user.bio || '',
        phoneNumber: user.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.username || !formData.email) {
      setMessage({ type: 'error', text: 'Username and email are required' });
      return;
    }

    // Password change validation
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setMessage({ 
          type: 'error', 
          text: 'Current password is required to change password' 
        });
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ 
          type: 'error', 
          text: 'New passwords do not match' 
        });
        return;
      }

      if (formData.newPassword.length < 6) {
        setMessage({ 
          type: 'error', 
          text: 'New password must be at least 6 characters' 
        });
        return;
      }
    }

    setLoading(true);

    const updateData = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      bio: formData.bio,
      phoneNumber: formData.phoneNumber
    };

    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
      updateData.confirmPassword = formData.confirmPassword;
    }

    const result = await updateProfile(updateData);
    
    if (result.success) {
      setMessage({ 
        type: 'success', 
        text: result.message || 'Profile updated successfully!' 
      });
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      setMessage({ 
        type: 'error', 
        text: result.message 
      });
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="section-header mb-8 flex-col sm:flex-row justify-between items-start">
          <div className="mb-4 sm:mb-0">
            <h1 className="section-title">👤 Profile Settings</h1>
            <p className="section-subtitle">Manage your account information and preferences</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-danger justify-center w-full sm:w-auto"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        {message.text && (
          <div className={`mb-6 alert ${
            message.type === 'success' 
              ? 'alert-success' 
              : 'alert-error'
          } flex items-center gap-2`}>
            {message.type === 'success' && <Check className="w-5 h-5 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Main Form Card */}
        <div className="card">
          <h2 className="heading-3 mb-6 pb-4 border-b border-gray-200">Account Information</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid-responsive-2">
              {/* Username */}
              <div className="form-group">
                <label className="label">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Your username"
                    className="input pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="input pl-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="label">Full Name <span className="text-xs text-gray-500">(Optional)</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="input"
                  disabled={loading}
                />
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="label">Phone Number <span className="text-xs text-gray-500">(Optional)</span></label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  className="input"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="label">Bio <span className="text-xs text-gray-500">(Optional)</span></label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows="3"
                maxLength="500"
                className="textarea"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Password Change Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="heading-4 mb-2">🔐 Change Password</h3>
              <p className="text-sm text-gray-600 mb-6">
                Leave password fields blank if you don't want to change your password
              </p>

              <div className="grid-responsive-2 gap-4">
                {/* Current Password */}
                <div className="form-group">
                  <label className="label">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter your current password"
                      className="input pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="form-group">
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password (min 6 characters)"
                      className="input pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="input pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-lg justify-center"
              >
                {loading ? '⏳ Updating...' : '✓ Update Profile'}
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-secondary-lg justify-center"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Account Details Card */}
        <div className="card-elevated mt-6">
          <h3 className="heading-4 mb-4 pb-3 border-b border-gray-200">📋 Account Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">User ID</span>
              <span className="text-gray-900 font-mono text-xs truncate">{user?._id}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Role</span>
              <span className="badge badge-blue capitalize">{user?.role || 'student'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Member Since</span>
              <span className="text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-medium">Last Login</span>
              <span className="text-gray-900">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
