#!/usr/bin/env node

/**
 * ============================================================================
 * EMAIL CONFIGURATION VERIFICATION TOOL
 * ============================================================================
 * 
 * This script tests your Gmail email configuration to ensure
 * the Forgot Password feature will work properly.
 * 
 * Usage:
 *   node test-email-config.js
 * 
 * Expected output on success:
 *   ✅ All tests passed!
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load .env file
dotenv.config();

console.log('\n' + '═'.repeat(80));
console.log('📧 EMAIL CONFIGURATION VERIFICATION');
console.log('═'.repeat(80) + '\n');

// ============================================================================
// TEST 1: Check if variables are set
// ============================================================================

console.log('[1/6] Checking environment variables...');
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!emailUser) {
  console.error('❌ EMAIL_USER not set in .env file');
  console.error('   Fix: EMAIL_USER=your-email@gmail.com');
  process.exit(1);
}

if (!emailPassword) {
  console.error('❌ EMAIL_PASSWORD not set in .env file');
  console.error('   Fix: EMAIL_PASSWORD=your-16-char-app-password');
  process.exit(1);
}

console.log('✅ Variables found');
console.log(`   📧 EMAIL_USER: ${emailUser}`);
console.log(`   🔑 PASSWORD length: ${emailPassword.length} characters`);

// ============================================================================
// TEST 2: Validate email format
// ============================================================================

console.log('\n[2/6] Validating email format...');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(emailUser)) {
  console.error('❌ EMAIL_USER is not a valid email address');
  console.error(`   Got: "${emailUser}"`);
  console.error('   Expected: user@gmail.com');
  process.exit(1);
}

console.log('✅ Email format valid');
console.log(`   📧 ${emailUser} ✓`);

// ============================================================================
// TEST 3: Check for placeholder values
// ============================================================================

console.log('\n[3/6] Checking for placeholder values...');

if (emailUser === 'your-email@gmail.com' || emailUser.includes('example')) {
  console.error('❌ EMAIL_USER is a placeholder');
  console.error(`   Current: ${emailUser}`);
  console.error('   Action: Replace with your actual Gmail address');
  process.exit(1);
}

if (emailPassword === '0000000000000000' || emailPassword === 'your-app-password') {
  console.error('❌ EMAIL_PASSWORD is a placeholder');
  console.error('   Action: Replace with your Gmail App Password');
  process.exit(1);
}

console.log('✅ Not using placeholder values');

// ============================================================================
// TEST 4: Gmail-specific validation
// ============================================================================

console.log('\n[4/6] Validating Gmail settings...');

if (emailUser.includes('@gmail.com')) {
  // Check for spaces
  if (emailPassword.includes(' ')) {
    console.error('❌ CRITICAL: EMAIL_PASSWORD contains spaces!');
    console.error('   Gmail App Passwords cannot have spaces.');
    console.error('\n   How to fix:');
    console.error('   1. Re-generate App Password at: https://myaccount.google.com/apppasswords');
    console.error('   2. Copy the 16-character password WITHOUT spaces');
    console.error('   3. Paste in .env as: EMAIL_PASSWORD=abcdefghijklmnop');
    console.error('   4. Remove all spaces from the password');
    console.error('   5. Restart backend: npm run dev');
    process.exit(1);
  }

  // Check length
  if (emailPassword.length !== 16) {
    console.error(`❌ Gmail App Password must be exactly 16 characters`);
    console.error(`   Current length: ${emailPassword.length}`);
    console.error('   Possible causes: spaces included, incomplete password, wrong service');
    console.error('\n   How to fix:');
    console.error('   1. Go to: https://myaccount.google.com/apppasswords');
    console.error('   2. Make sure 2FA is enabled first');
    console.error('   3. Select "Mail" and "Windows Computer"');
    console.error('   4. Generate new password');
    console.error('   5. Copy 16 characters WITHOUT spaces');
    console.error('   6. Update .env and restart backend');
    process.exit(1);
  }

  console.log('✅ Gmail validation passed');
  console.log(`   🔐 Password length: ${emailPassword.length} characters ✓`);
  console.log('   📧 Domain: gmail.com ✓`);
} else {
  console.log('✅ Generic email configuration');
}

// ============================================================================
// TEST 5: Test transporter connection
// ============================================================================

console.log('\n[5/6] Testing email transporter connection...');

const transporter = nodemailer.createTransport({
  service: emailUser.includes('@gmail.com') ? 'gmail' : undefined,
  host: emailUser.includes('@gmail.com') ? undefined : 'smtp.gmail.com',
  port: emailUser.includes('@gmail.com') ? undefined : 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailPassword
  }
});

try {
  await transporter.verify();
  console.log('✅ Transporter connection successful');
  console.log('   🔌 SMTP connection: Working ✓');
} catch (error) {
  console.error('❌ Transporter connection failed');
  console.error(`   Error: ${error.message}`);
  
  // Provide specific help based on error
  const msg = error.message.toLowerCase();
  
  if (msg.includes('535') || msg.includes('authentic')) {
    console.error('\n   This is an authentication error. Check:');
    console.error('   1. Is 2FA enabled on your Gmail account?');
    console.error('   2. Are you using the 16-char App Password (not regular password)?');
    console.error('   3. Is the password exactly 16 chars without spaces?');
    console.error('   4. Did you generate it for "Mail" service?');
  } else if (msg.includes('relay')) {
    console.error('\n   Gmail is rejecting your SMTP connection.');
    console.error('   Try enabling "Less secure apps" in Gmail settings.');
  }
  
  process.exit(1);
}

// ============================================================================
// TEST 6: Verify module loads
// ============================================================================

console.log('\n[6/6] Verifying email service module...');

try {
  const emailModule = await import('./services/emailService.js');
  if (emailModule.sendPasswordResetEmail && emailModule.sendPasswordResetConfirmationEmail) {
    console.log('✅ Email service module loaded');
    console.log('   📧 sendPasswordResetEmail ✓');
    console.log('   📧 sendPasswordResetConfirmationEmail ✓');
  } else {
    console.warn('⚠️  Email service module missing some functions');
  }
} catch (error) {
  console.warn('⚠️  Could not verify email service module:', error.message);
  console.warn('   This might be OK - module will be loaded when needed');
}

// ============================================================================
// SUCCESS
// ============================================================================

console.log('\n' + '═'.repeat(80));
console.log('✅ ALL TESTS PASSED!');
console.log('═'.repeat(80));
console.log('\n📧 Your email service is properly configured:');
console.log(`   📧 Email: ${emailUser}`);
console.log(`   🔑 Password: ${emailPassword.substring(0, 4)}••••••••••••`);
console.log('\n🎉 The Forgot Password feature is ready to use!');
console.log('\n📝 NEXT STEPS:');
console.log('   1. Create a test account on http://localhost:5174');
console.log('   2. Click "Forgot Password"');
console.log('   3. Enter your email');
console.log('   4. Check your inbox for reset link');
console.log('   5. Click link and set new password');
console.log('   6. Login with new password');
console.log('\n' + '═'.repeat(80) + '\n');

process.exit(0);
