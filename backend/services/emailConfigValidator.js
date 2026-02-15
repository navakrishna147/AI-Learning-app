/**
 * ============================================================================
 * EMAIL CONFIGURATION VALIDATOR
 * ============================================================================
 * 
 * Validates email service configuration at startup
 * Provides detailed, actionable error messages for common issues
 * 
 * This module is called during application bootstrap (Phase 3)
 * to ensure email service is ready before accepting requests
 */

/**
 * Comprehensive email configuration validation
 * @param {boolean} throwOnError - If true, throws detailed error; returns boolean if false
 * @returns {boolean} - True if valid, false if invalid
 * @throws {Error} - Detailed error with setup instructions if configuration is invalid
 */
export const validateEmailConfiguration = (throwOnError = true) => {
  let isValid = true;
  const issues = [];
  const warnings = [];
  
  // =========================================================================
  // STEP 1: Check if email feature is enabled
  // =========================================================================
  
  const emailUserSet = !!process.env.EMAIL_USER;
  const emailPasswordSet = !!process.env.EMAIL_PASSWORD;
  
  if (!emailUserSet && !emailPasswordSet) {
    // Email is optional - not configured is OK
    if (!throwOnError) return false;
    console.log('\n⚠️  EMAIL SERVICE: Not configured (Forgot Password feature disabled)');
    return false;
  }
  
  // =========================================================================
  // STEP 2: Validate EMAIL_USER
  // =========================================================================
  
  if (!emailUserSet) {
    issues.push('EMAIL_USER is missing - email service cannot function without it');
    isValid = false;
  } else {
    const emailUser = process.env.EMAIL_USER;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailUser)) {
      issues.push(`EMAIL_USER \"${emailUser}\" is not a valid email address`);
      isValid = false;
    }
    
    // Validate it's not a placeholder
    if (emailUser === 'your-email@gmail.com' || 
        emailUser.startsWith('your-') ||
        emailUser === 'example@example.com') {
      issues.push(`EMAIL_USER is still a placeholder: \"${emailUser}\" - Replace with your actual email`);
      isValid = false;
    }
  }
  
  // =========================================================================
  // STEP 3: Validate EMAIL_PASSWORD
  // =========================================================================
  
  if (!emailPasswordSet) {
    issues.push('EMAIL_PASSWORD is missing - required even if EMAIL_USER is set');
    isValid = false;
  } else {
    const emailPassword = process.env.EMAIL_PASSWORD;
    
    // Check for common placeholder values
    if (emailPassword === 'your-app-password' ||
        emailPassword === '0000000000000000' ||
        emailPassword.startsWith('your-')) {
      issues.push('EMAIL_PASSWORD is still a placeholder - Replace with your actual Gmail App Password');
      isValid = false;
    }
    
    // Gmail-specific validation
    if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@gmail.com')) {
      // Check for spaces (very common mistake)
      if (emailPassword.includes(' ')) {
        issues.push(
          '❌ CRITICAL: EMAIL_PASSWORD contains spaces!\\n' +
          '      Gmail App Passwords cannot have spaces.\\n' +
          '      Did you copy \"abcd efgh ijkl mnop\" (with spaces)?\\n' +
          '      Remove ALL spaces: \"abcdefghijklmnop\"'
        );
        isValid = false;
      }
      
      // Check length
      if (emailPassword.length !== 16) {
        issues.push(
          `Email password is ${emailPassword.length} characters (Gmail requires exactly 16).\\n` +
          '      Possible causes:\\n' +
          '      • You included spaces when copying\\n' +
          '      • You used different Generator setting\\n' +
          '      • You copy/pasted incorrectly'
        );
        isValid = false;
      }
      
      // Validate it looks like a password
      if (!/[a-z]/.test(emailPassword) || !/[a-z]/.test(emailPassword)) {
        warnings.push('Gmail App Password should contain lowercase letters');
      }
    }
  }
  
  // =========================================================================
  // STEP 4: Handle validation results
  // =========================================================================
  
  if (!isValid) {
    if (!throwOnError) {
      return false;
    }
    
    // Throw detailed error with setup instructions
    console.error('\\n' + '═'.repeat(80));
    console.error('❌ EMAIL CONFIGURATION ERROR - FORGOT PASSWORD WILL NOT WORK');
    console.error('═'.repeat(80));
    
    // List issues
    if (issues.length > 0) {
      console.error('\\n⚠️  Issues found:');
      issues.forEach((issue, i) => {
        console.error(`  ${i + 1}. ${issue}`);
      });
    }
    
    // Setup instructions
    console.error('\\n📚 GMAIL SETUP INSTRUCTIONS (10 minutes):');
    console.error('\\n  STEP 1: Enable 2-Factor Authentication');
    console.error('    • Go to: https://myaccount.google.com/security');
    console.error('    • Scroll to: \"2-Step Verification\"');
    console.error('    • Click: \"Get Started\"');
    console.error('    • Choose verification method (text/call/authenticator)');
    console.error('    • Verify your identity');
    console.error('    • ⏳ Wait 5-10 minutes before next step');
    console.error('\\n  STEP 2: Generate App Password');
    console.error('    • Go to: https://myaccount.google.com/apppasswords');
    console.error('    • Select from first dropdown: \"Mail\"');
    console.error('    • Select from second dropdown: \"Windows Computer\"');
    console.error('    • Click: \"Generate\"');
    console.error('    • Google displays: \"abcd efgh ijkl mnop\" (with spaces)');
    console.error('    • ⚠️  COPY ONLY the 16 characters: \"abcdefghijklmnop\"');
    console.error('    • ❌ DO NOT copy the spaces');
    console.error('\\n  STEP 3: Update .env file');
    console.error('    • Open: backend/.env');
    console.error('    • Find: EMAIL_USER=your-email@gmail.com');
    console.error('    • Replace with: EMAIL_USER=your-real-email@gmail.com');
    console.error('    • Find: EMAIL_PASSWORD=0000000000000000');
    console.error('    • Replace with: EMAIL_PASSWORD=abcdefghijklmnop');
    console.error('    • Save file (Ctrl+S)');
    console.error('\\n  STEP 4: Restart Backend');
    console.error('    • Stop current backend: Ctrl+C');
    console.error('    • Start new backend: npm run dev');
    console.error('    • Wait for: \"✅ APPLICATION STARTED SUCCESSFULLY\"');
    console.error('\\n  STEP 5: Verify Configuration');
    console.error('    • Run: node test-email-config.js');
    console.error('    • Should show: \"✅ All tests passed!\"');
    console.error('\\n' + '═'.repeat(80) + '\\n');
    
    throw new Error('Email configuration invalid. See console output above for setup instructions.');
  }
  
  // Valid configuration found
  if (process.env.EMAIL_USER) {
    const maskPassword = process.env.EMAIL_PASSWORD 
      ? process.env.EMAIL_PASSWORD.substring(0, 4) + '•'.repeat(12)
      : 'NOT SET';
    
    console.log('✅ Email service: Configured');
    console.log(`   📧 Email: ${process.env.EMAIL_USER}`);
    console.log(`   🔑 Password: ${maskPassword}`);
  }
  
  // Report warnings
  if (warnings.length > 0) {
    console.warn('\\n⚠️  Email configuration warnings:');
    warnings.forEach(warn => console.warn(`   • ${warn}`));
  }
  
  return isValid;
};

/**
 * Initialize email service on application startup
 * Called from bootstrap.js during Phase 3
 * 
 * @returns {Promise<boolean>} - True if email is configured, false if optional and not set
 */
export const initializeEmailService = async () => {
  try {
    console.log('\\n📧 Phase 3b: Validating email configuration...');
    
    // Check if email is configured
    if (!process.env.EMAIL_USER && !process.env.EMAIL_PASSWORD) {
      console.log('   ℹ️  Email service: Not configured (optional)');
      return false;
    }
    
    // Validate configuration (throws on error)
    validateEmailConfiguration(true);
    
    // Try to import and verify transporter
    try {
      const emailService = await import('./emailService.js');
      // Just validate config, don't test actual connection yet
      console.log('   ✅ Email service module loaded');
      return true;
    } catch (error) {
      console.error('   ⚠️  Could not load email service module:', error.message);
      // non-blocking error, email service is optional
      return false;
    }
    
  } catch (error) {
    // Email configuration is required if partially set
    console.error('   ❌ Email service validation failed');
    throw error;
  }
};

export default {
  validateEmailConfiguration,
  initializeEmailService
};
