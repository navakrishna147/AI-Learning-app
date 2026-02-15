import nodemailer from 'nodemailer';

/**
 * Initialize email transporter
 * Supports both Gmail and generic SMTP configurations
 */
const createTransporter = () => {
  try {
    // Check if using Gmail (Gmail has special configuration)
    if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@gmail.com')) {
      console.log('📧 Initializing Gmail transporter...');
      console.log(`   📨 Email: ${process.env.EMAIL_USER}`);
      console.log('   🔑 Using App Password (16 characters)');
      
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD // MUST be App Password, NOT regular Gmail password
        }
      });
    }

    // Generic SMTP configuration
    console.log('📧 Initializing generic SMTP transporter...');
    console.log(`   📨 SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    console.log(`   📨 SMTP Port: ${process.env.SMTP_PORT || '587'}`);
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } catch (error) {
    console.error('❌ Error creating transporter:', error.message);
    throw error;
  }
};

/**
 * Verify email configuration is properly set up
 */
const validateEmailConfig = (throwError = true) => {
  let isValid = true;
  const issues = [];
  
  // Check EMAIL_USER
  if (!process.env.EMAIL_USER) {
    issues.push('EMAIL_USER is not configured in .env file');
    isValid = false;
  } else if (!process.env.EMAIL_USER.includes('@')) {
    issues.push('EMAIL_USER must be a valid email address');
    isValid = false;
  }
  
  // Check EMAIL_PASSWORD
  if (!process.env.EMAIL_PASSWORD) {
    issues.push('EMAIL_PASSWORD is not configured in .env file. For Gmail, use a 16-character App Password.');
    isValid = false;
  }
  
  // Gmail-specific validation
  if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@gmail.com')) {
    if (!process.env.EMAIL_PASSWORD) {
      issues.push('Gmail requires EMAIL_PASSWORD to be set');
      isValid = false;
    } else {
      const passwordLength = process.env.EMAIL_PASSWORD.length;
      
      // Check for spaces (common mistake)
      if (process.env.EMAIL_PASSWORD.includes(' ')) {
        issues.push('❌ CRITICAL: EMAIL_PASSWORD contains spaces! Gmail App Passwords must have NO spaces. Remove all spaces from your App Password.');
        isValid = false;
      }
      
      // Check length
      if (passwordLength !== 16) {
        issues.push(`Gmail App Password must be exactly 16 characters (you have ${passwordLength}). Did you include spaces in the copy/paste?`);
        isValid = false;
      }
      
      // Validate it doesn't look like placeholder
      if (process.env.EMAIL_PASSWORD === '0000000000000000' || 
          process.env.EMAIL_PASSWORD === 'your-app-password' ||
          process.env.EMAIL_PASSWORD.startsWith('your')) {
        issues.push('EMAIL_PASSWORD is a placeholder. Replace with your actual Gmail App Password.');
        isValid = false;
      }
    }
  }
  
  // Report issues
  if (!isValid && throwError) {
    console.error('\n' + '═'.repeat(80));
    console.error('❌ EMAIL CONFIGURATION ERROR');
    console.error('═'.repeat(80));
    issues.forEach(issue => console.error(`  • ${issue}`));
    console.error('\n📚 GMAIL SETUP INSTRUCTIONS:');
    console.error('  1. Go to: https://myaccount.google.com/security');
    console.error('  2. Enable 2-Step Verification');
    console.error('  3. Go to: https://myaccount.google.com/apppasswords');
    console.error('  4. Select "Mail" and "Windows Computer"');
    console.error('  5. Copy the 16-character password (NO SPACES)');
    console.error('  6. Paste into .env EMAIL_PASSWORD=<16characters>');
    console.error('  7. Restart backend: npm run dev');
    console.error('  8. Test: node test-email-config.js');
    console.error('═'.repeat(80) + '\n');
    throw new Error('Email configuration invalid. Check console for instructions.');
  }
  
  if (isValid && process.env.EMAIL_USER) {
    if (process.env.EMAIL_USER.includes('@gmail.com')) {
      console.log('✅ Gmail configuration validated');
      console.log(`   📧 Email: ${process.env.EMAIL_USER}`);
      console.log(`   🔑 App Password: ${process.env.EMAIL_PASSWORD ? '●●●●●●●●●●●●●●' : 'NOT SET'}`);
    }
  }
  
  return isValid;
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} resetToken - Password reset token
 * @param {string} frontendUrl - Frontend URL for reset link
 */
export const sendPasswordResetEmail = async (email, resetToken, frontendUrl) => {
  const requestId = `EMAIL_${Date.now()}`;
  
  try {
    // Log request details
    console.log('\n' + '═'.repeat(80));
    console.log('📧 PASSWORD RESET EMAIL REQUEST');
    console.log('═'.repeat(80));
    console.log(`Request ID: ${requestId}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Recipient: ${email}`);
    console.log(`Sender: ${process.env.EMAIL_USER}`);
    console.log(`Frontend URL: ${frontendUrl}`);
    
    // Validate email configuration
    validateEmailConfig();

    const transporter = createTransporter();

    // Test transporter connection
    console.log('\n🔌 Testing email transporter connection...');
    try {
      await transporter.verify();
      console.log('✅ Email transporter connection verified successfully');
      console.log('   SMTP Host: smtp.gmail.com');
      console.log('   Port: 587');
      console.log('   Auth: Gmail App Password');
    } catch (verifyError) {
      // Provide helpful error message for common issues
      const errorMessage = verifyError.message.toLowerCase();
      
      if (errorMessage.includes('535') || errorMessage.includes('authentication')) {
        console.error('❌ GMAIL AUTHENTICATION FAILED (Error 535)');
        console.error('   Possible causes:');
        console.error('   1. Using regular Gmail password instead of App Password');
        console.error('   2. App Password is incorrect or incomplete');
        console.error('   3. 2-Factor Authentication not enabled on Gmail account');
        console.error('   ');
        console.error('   Fix: Follow the Gmail App Password Setup Guide in the documentation');
        console.error('   Steps:');
        console.error('   1. Go to https://myaccount.google.com/apppasswords');
        console.error('   2. Select "Mail" and "Windows Computer"');
        console.error('   3. Copy the 16-character password (no spaces)');
        console.error('   4. Paste it in .env as EMAIL_PASSWORD=<16-char-password>');
        console.error('   5. Restart the backend server');
        throw new Error('Gmail authentication failed. Check console for setup instructions.');
      } else if (errorMessage.includes('554') || errorMessage.includes('relay')) {
        console.error('❌ SMTP RELAY ERROR (Error 554)');
        console.error('   Gmail SMTP relay is not allowing your connection');
        throw new Error('SMTP relay error. Enable "Less secure apps" or use Gmail App Password.');
      } else {
        console.error('❌ Email transporter connection failed:', verifyError.message);
        throw verifyError;
      }
    }

    // Create reset URL
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Email template
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔐 Password Reset Request - AI Learning Assistant',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; margin-top: 20px; border-radius: 10px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Hi there,
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your AI Learning Assistant account. 
              Click the button below to create a new password.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                display: inline-block;
              ">
                Reset Your Password
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Or copy and paste this link in your browser:
            </p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 6px; word-break: break-all; color: #374151; font-size: 13px;">
              ${resetUrl}
            </p>

            <p style="color: #ef4444; font-size: 13px; margin-top: 20px; line-height: 1.6;">
              ⏰ <strong>Important:</strong> This link will expire in 30 minutes. If you didn't request a password reset, please ignore this email.
            </p>
          </div>

          <div style="background: #f3f4f6; padding: 20px; margin-top: 20px; border-radius: 10px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2024 AI Learning Assistant. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Reset Request

        Hi there,

        We received a request to reset your password. Click the link below to create a new password:

        ${resetUrl}

        This link will expire in 30 minutes.

        If you didn't request this, please ignore this email.

        © 2024 AI Learning Assistant
      `
    };

    // Send email
    console.log(`\n📬 Sending password reset email...`);
    console.log(`   To: ${email}`);
    console.log(`   From: ${process.env.EMAIL_USER}`);
    console.log(`   Subject: ${mailOptions.subject}`);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY');
    console.log('═'.repeat(80));
    console.log(`Request ID: ${requestId}`);
    console.log(`Message ID: ${info.messageId}`);
    console.log(`To: ${email}`);
    console.log(`From: ${process.env.EMAIL_USER}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('\n📧 EMAIL DETAILS:');
    console.log(`   Response Code: ${info.response ? info.response.split('\\n')[0] : 'N/A'}`);
    console.log(`   Accepted: ${JSON.stringify(info.accepted)}`);
    console.log(`   Rejected: ${JSON.stringify(info.rejected)}`);
    console.log(`   Pending: ${JSON.stringify(info.pending)}`);
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Check your inbox at ' + email);
    console.log('   2. Check spam/junk folder');
    console.log('   3. Wait 1-2 minutes for delivery');
    console.log('   4. If not received, check error messages above');
    console.log('═'.repeat(80) + '\n');

    return {
      success: true,
      message: 'Password reset email sent successfully',
      messageId: info.messageId,
      requestId: requestId
    };
  } catch (error) {
    console.error('\n' + '═'.repeat(80));
    console.error('❌ FAILED TO SEND PASSWORD RESET EMAIL');
    console.error('═'.repeat(80));
    console.error(`Request ID: ${requestId}`);
    console.error(`Timestamp: ${new Date().toISOString()}`);
    console.error(`Recipient: ${email}`);
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Error Details:`, error);
    console.error('═'.repeat(80) + '\n');
    
    // Provide user-friendly error message
    let userMessage = error.message;
    if (error.message.includes('Gmail authentication failed')) {
      userMessage = 'Gmail email service is not properly configured. Please check the backend console for setup instructions.';
    } else if (error.message.includes('SMTP')) {
      userMessage = 'Email service configuration error. Please contact system administrator.';
    }
    
    throw new Error(userMessage);
  }
};

/**
 * Send password reset confirmation email
 * @param {string} email - User's email address
 * @param {string} username - User's username
 */
export const sendPasswordResetConfirmationEmail = async (email, username) => {
  try {
    // Validate configuration (non-blocking - just check it's still valid)
    validateEmailConfig(false);

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '✅ Password Changed Successfully - AI Learning Assistant',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Password Changed</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; margin-top: 20px; border-radius: 10px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Hi ${username},
            </p>

            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Your password has been successfully changed. You can now log in with your new password.
            </p>

            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #047857; font-size: 14px; margin: 0;">
                🔐 <strong>Security Tip:</strong> Never share your password with anyone. The AI Learning Assistant team will never ask for your password.
              </p>
            </div>

            <p style="color: #374151; font-size: 14px; margin-top: 20px;">
              If you didn't make this change, please contact our support team immediately.
            </p>
          </div>

          <div style="background: #f3f4f6; padding: 20px; margin-top: 20px; border-radius: 10px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2024 AI Learning Assistant. All rights reserved.
            </p>
          </div>
        </div>
      `,
      text: `
        Password Changed Successfully

        Hi ${username},

        Your password has been successfully changed. You can now log in with your new password.

        If you didn't make this change, please contact our support team immediately.

        © 2024 AI Learning Assistant
      `
    };

    console.log(`📬 Sending password reset confirmation email to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Password reset confirmation email sent successfully');

    return {
      success: true,
      message: 'Confirmation email sent successfully',
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error.message);
    // Don't throw - this is not critical
    return {
      success: false,
      message: 'Confirmation email could not be sent'
    };
  }
};

export default {
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail
};
