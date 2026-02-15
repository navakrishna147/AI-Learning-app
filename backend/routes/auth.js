import express from 'express';
import {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Health check endpoint - allows frontend to verify backend is running
router.get('/health-check', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test forgot password endpoint - for QA verification
// GET /api/auth/test-forgot-password
router.get('/test-forgot-password', async (req, res) => {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🧪 TEST FORGOT PASSWORD ENDPOINT CALLED');
    console.log('═'.repeat(80));
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // Use email from query param or env, never hardcode real credentials
    const testEmail = req.query.email || process.env.TEST_EMAIL || 'test@example.com';
    
    const mockReq = {
      body: {
        email: testEmail
      }
    };
    
    // We need to manually invoke the forgotPassword logic for this endpoint
    const User = (await import('../models/User.js')).default;
    const crypto = require('crypto');
    const { sendPasswordResetEmail } = await import('../services/emailService.js');
    
    const email = testEmail;
    
    console.log(`Test Email: ${email}`);
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User not found for email: ${email}`);
      console.log('═'.repeat(80) + '\n');
      return res.status(404).json({
        success: false,
        error: `No user found with email: ${email}`,
        suggestions: [
          'Create a test account first',
          'Pass ?email=your@email.com or set TEST_EMAIL in .env',
          'Check for typos in email'
        ]
      });
    }
    
    console.log(`\n✅ User found:`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    console.log(`\n🔑 TOKEN GENERATION:`);
    console.log(`   Plain Token: ${resetToken}`);
    console.log(`   Hashed Token: ${hashedToken.substring(0, 20)}...`);
    
    // Save to database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    
    console.log(`\n✅ Token saved to database:`);
    console.log(`   Expires: ${user.resetPasswordExpire.toISOString()}`);
    
    // Prepare response
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
    
    console.log(`\n🔗 RESET LINK:`);
    console.log(`   ${resetLink}`);
    
    // Try to send email
    console.log(`\n📧 Sending test email...`);
    try {
      const emailResult = await sendPasswordResetEmail(user.email, resetToken, frontendUrl);
      console.log(`✅ Email sent successfully`);
      if (emailResult.messageId) {
        console.log(`   Message ID: ${emailResult.messageId}`);
      }
    } catch (emailError) {
      console.error(`❌ Email failed: ${emailError.message}`);
      // Clear token if email fails
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      
      console.log('═'.repeat(80) + '\n');
      return res.status(500).json({
        success: false,
        error: `Email send failed: ${emailError.message}`,
        suggestions: [
          'Check EMAIL_USER in .env',
          'Check EMAIL_PASSWORD in .env',
          'Verify 2FA is enabled on Gmail',
          'Check Gmail blocked login attempts'
        ]
      });
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('✅ TEST FORGOT PASSWORD COMPLETE');
    console.log('═'.repeat(80));
    console.log('RESULTS:');
    console.log(`  ✅ User found: ${user.email}`);
    console.log(`  ✅ Token generated and hashed`);
    console.log(`  ✅ Token stored in database`);
    console.log(`  ✅ Email sent to: ${user.email}`);
    console.log('');
    console.log('VERIFICATION STEPS:');
    console.log(`  1. Check Gmail inbox for email at: ${user.email}`);
    console.log(`  2. Look for subject: "🔐 Password Reset Request"`);
    console.log(`  3. Check spam folder if not in inbox`);
    console.log(`  4. Click reset link to test token validation`);
    console.log('═'.repeat(80) + '\n');
    
    res.status(200).json({
      success: true,
      message: 'Test forgot password flow completed successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        },
        token: {
          plain: resetToken,
          hashed: hashedToken.substring(0, 20) + '...',
          expiresAt: user.resetPasswordExpire.toISOString(),
          expiresIn: '30 minutes'
        },
        resetLink: resetLink,
        email: {
          to: user.email,
          subject: '🔐 Password Reset Request - AI Learning Assistant'
        }
      },
      nextSteps: [
        'Check email inbox for reset link',
        'Check spam folder if not received',
        'Click reset link to validate token',
        'Set new password',
        'Login with new password'
      ]
    });
    
  } catch (error) {
    console.error('❌ TEST FORGOT PASSWORD ERROR:', error);
    console.error('═'.repeat(80) + '\n');
    
    res.status(500).json({
      success: false,
      error: error.message,
      suggestions: [
        'Check backend console for detailed error messages',
        'Verify MongoDB connection',
        'Check email configuration',
        'Verify user exists in the database'
      ]
    });
  }
});

// Test email endpoint - for debugging email delivery issues
// GET /api/auth/test-email?email=your@email.com
router.get('/test-email', async (req, res) => {
  try {
    const testEmail = req.query.email || 'test@example.com';
    
    console.log('\n' + '═'.repeat(80));
    console.log('🧪 TEST EMAIL ENDPOINT CALLED');
    console.log('═'.repeat(80));
    console.log(`Test Email: ${testEmail}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email configuration missing');
      return res.status(400).json({
        success: false,
        error: 'Email service not configured',
        details: {
          EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
          EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET'
        }
      });
    }
    
    const nodemailer = await import('nodemailer');
    const testTransporter = nodemailer.default.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    console.log('🔌 Testing transporter connection...');
    await testTransporter.verify();
    console.log('✅ Transporter verified');
    
    console.log('📧 Sending test email...');
    const info = await testTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: '🧪 Test Email - AI Learning Assistant',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2>✅ Test Email Received!</h2>
            <p>If you're reading this, the email system is working correctly.</p>
            <hr>
            <p><strong>Details:</strong></p>
            <ul>
              <li>Sender: ${process.env.EMAIL_USER}</li>
              <li>Timestamp: ${new Date().toISOString()}</li>
              <li>Message ID: ${info.messageId}</li>
            </ul>
            <p style="color: #666; font-size: 12px;">You can now test the forgot password feature.</p>
          </div>
        </div>
      `,
      text: 'Test email from AI Learning Assistant'
    });
    
    console.log('✅ TEST EMAIL SENT');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${testEmail}`);
    console.log('═'.repeat(80) + '\n');
    
    res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        messageId: info.messageId,
        to: testEmail,
        from: process.env.EMAIL_USER,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ TEST EMAIL FAILED');
    console.error('═'.repeat(80));
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error('═'.repeat(80) + '\n');
    
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      details: {
        message: error.message,
        code: error.code
      }
    });
  }
});

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password/:token', validateResetToken);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/verify-email', protect, verifyEmail);

export default router;
