import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from '../services/emailService.js';

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    // Password match validation
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Passwords do not match' 
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email format' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists. Please login instead.' 
      });
    }

    // Check if username is taken
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Username is already taken' 
      });
    }

    // Create user
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase(),
      password,
      role: 'student'
    });

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ New user registered:', user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Registration failed' 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user and include password field for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'Your account has been deactivated' 
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('✅ User logged in:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        fullName: user.fullName
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Login failed' 
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to get profile' 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update allowed fields
    const allowedFields = ['username', 'fullName', 'bio', 'phoneNumber', 'avatar', 'email'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Handle email change (check for duplicates)
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ 
          success: false,
          message: 'Email is already in use' 
        });
      }
    }

    // Handle password update
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ 
          success: false,
          message: 'Current password is required to change password' 
        });
      }

      // Verify current password
      const isPasswordMatch = await user.matchPassword(req.body.currentPassword);
      if (!isPasswordMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Current password is incorrect' 
        });
      }

      // Validate new password
      if (req.body.newPassword.length < 6) {
        return res.status(400).json({ 
          success: false,
          message: 'New password must be at least 6 characters' 
        });
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return res.status(400).json({ 
          success: false,
          message: 'Passwords do not match' 
        });
      }

      user.password = req.body.newPassword;
    }

    const updatedUser = await user.save();

    console.log('✅ Profile updated:', updatedUser.email);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phoneNumber: updatedUser.phoneNumber,
        bio: updatedUser.bio
      },
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Profile update failed' 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    console.log('✅ User logged out:', req.user.email);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Logout failed' 
    });
  }
};

// @desc    Verify email
// @route   PUT /api/auth/verify-email
// @access  Private
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { isEmailVerified: true },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        _id: user._id,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Email verification failed' 
    });
  }
};

// @desc    Forgot password - Send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🔐 FORGOT PASSWORD REQUEST');
    console.log('═'.repeat(80));
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Email: ${email}`);

    // Find user by the email they submitted
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User not found for: ${emailToUse}`);
      console.log('═'.repeat(80) + '\n');
      // For security, don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset email'
      });
    }

    console.log(`✅ User found:`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log(`\n🔑 TOKEN GENERATED:`);
    console.log(`   Plain Token: ${resetToken}`);
    console.log(`   Token Length: ${resetToken.length} characters`);

    // Hash token and save to database with expiration (30 minutes)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    const expiryTime = new Date(Date.now() + 30 * 60 * 1000);
    user.resetPasswordExpire = expiryTime;

    console.log(`   Hashed Token: ${hashedToken}`);
    console.log(`   Token Expires: ${expiryTime.toISOString()} (in 30 minutes)`);

    // Save to database
    await user.save();
    console.log(`✅ Token saved to database`);

    // Verify it was saved
    const savedUser = await User.findById(user._id);
    console.log(`\n📋 DATABASE VERIFICATION:`);
    console.log(`   resetPasswordToken stored: ${savedUser.resetPasswordToken ? '✅ YES' : '❌ NO'}`);
    console.log(`   resetPasswordExpire stored: ${savedUser.resetPasswordExpire ? '✅ YES' : '❌ NO'}`);
    console.log(`   resetPasswordExpire time: ${savedUser.resetPasswordExpire}`);

    // Get frontend URL from environment or default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.log(`\n🌐 FRONTEND URL: ${frontendUrl}`);
    console.log(`   Reset Link: ${frontendUrl}/reset-password/${resetToken}`);

    // Send reset email
    console.log(`\n📧 SENDING EMAIL...`);
    let emailSent = false;

    try {
      const emailResult = await sendPasswordResetEmail(user.email, resetToken, frontendUrl);
      emailSent = true;
      console.log(`✅ Email service returned successfully`);
      if (emailResult.messageId) {
        console.log(`   Message ID: ${emailResult.messageId}`);
        console.log(`   Request ID: ${emailResult.requestId}`);
      }
    } catch (emailError) {
      console.error(`❌ Email send failed: ${emailError.message}`);
      
      // Clear reset token if email fails
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      console.log('═'.repeat(80) + '\n');
      return res.status(500).json({
        success: false,
        message: `Failed to send reset email: ${emailError.message}. Please check email configuration in backend .env file (EMAIL_USER and EMAIL_PASSWORD must be set).`
      });
    }

    console.log('\n✅ PASSWORD RESET FLOW COMPLETE');
    console.log('═'.repeat(80));
    console.log('SUMMARY:');
    console.log(`  ✅ User found: ${user.email}`);
    console.log(`  ✅ Token generated: ${resetToken.substring(0, 10)}...`);
    console.log(`  ✅ Token hashed and stored`);
    console.log(`  ✅ Email sent successfully`);
    console.log('');
    console.log('NEXT STEPS:');
    console.log(`  1. User checks inbox at: ${user.email}`);
    console.log(`  2. User clicks reset link with token`);
    console.log(`  3. Token validated (must match hashed version)`);
    console.log(`  4. User sets new password`);
    console.log(`  5. User logs in with new password`);
    console.log('═'.repeat(80) + '\n');

    res.json({
      success: true,
      message: 'Password reset email has been sent to your email address. Please check your inbox and spam folder.',
      email: user.email,
      token: resetToken // For debugging only - in production, don't return token
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    console.error('═'.repeat(80) + '\n');
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process forgot password request'
    });
  }
};

// @desc    Validate reset token
// @route   GET /api/auth/reset-password/:token
// @access  Public
export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    // Hash the token to match what was saved
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      email: user.email
    });
  } catch (error) {
    console.error('❌ Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate token'
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validation
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and password confirmation are required'
      });
    }

    // Password match validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Password length validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash the token to match what was saved
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    console.log('✅ Password reset successfully for:', user.email);

    // Send confirmation email (non-critical)
    try {
      await sendPasswordResetConfirmationEmail(user.email, user.username);
    } catch (emailError) {
      console.warn('Failed to send confirmation email:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
};

