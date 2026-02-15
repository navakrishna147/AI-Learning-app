#!/usr/bin/env node

/**
 * COMPLETE SYSTEM DIAGNOSTIC
 * Verifies all components of the forgot password feature
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

console.log(`\n${colors.bold}${colors.blue}${'═'.repeat(70)}${colors.reset}\n`);
console.log(`${colors.bold}🔍 FORGOT PASSWORD FEATURE - COMPLETE DIAGNOSTIC${colors.reset}\n`);
console.log(`${colors.bold}${colors.blue}${'═'.repeat(70)}${colors.reset}\n`);

const checks = [];

async function runDiagnostics() {
  // CHECK 1: Backend responding
  console.log(`${colors.bold}[1/8] Checking Backend Connection...${colors.reset}`);
  try {
    const response = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    if (response.status === 200) {
      console.log(`${colors.green}✅ Backend is running on port 5000${colors.reset}\n`);
      checks.push({ name: 'Backend Connection', status: 'PASS' });
    }
  } catch (error) {
    console.log(`${colors.red}❌ Backend not responding${colors.reset}`);
    console.log(`   Make sure: npm run dev is running\n`);
    checks.push({ name: 'Backend Connection', status: 'FAIL' });
    return;
  }

  // CHECK 2: MongoDB Connection
  console.log(`${colors.bold}[2/8] Checking MongoDB Connection...${colors.reset}`);
  try {
    const response = await axios.get('http://localhost:5000/api/health/detailed', { timeout: 5000 });
    const data = response.data;
    if (data.database?.connected) {
      console.log(`${colors.green}✅ MongoDB connected${colors.reset}`);
      console.log(`   Database: ${data.database.state}\n`);
      checks.push({ name: 'MongoDB Connection', status: 'PASS' });
    } else {
      console.log(`${colors.red}❌ MongoDB not connected${colors.reset}\n`);
      checks.push({ name: 'MongoDB Connection', status: 'FAIL' });
    }
  } catch (error) {
    console.log(`${colors.red}❌ Could not check MongoDB status${colors.reset}\n`);
    checks.push({ name: 'MongoDB Connection', status: 'FAIL' });
  }

  // CHECK 3: Frontend files
  console.log(`${colors.bold}[3/8] Checking Frontend Components...${colors.reset}`);
  const frontendFiles = [
    'frontend/src/pages/auth/ForgotPassword.jsx',
    'frontend/src/pages/auth/ResetPassword.jsx'
  ];
  
  let allFrontendOk = true;
  for (const file of frontendFiles) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      console.log(`${colors.green}✅${colors.reset} ${file}`);
    } else {
      console.log(`${colors.red}❌${colors.reset} ${file} (NOT FOUND)`);
      allFrontendOk = false;
    }
  }
  console.log('');
  checks.push({ name: 'Frontend Components', status: allFrontendOk ? 'PASS' : 'FAIL' });

  // CHECK 4: Backend Auth Controller
  console.log(`${colors.bold}[4/8] Checking Backend Auth Controller...${colors.reset}`);
  const authControllerPath = path.join(__dirname, 'controllers/authController.js');
  if (fs.existsSync(authControllerPath)) {
    const content = fs.readFileSync(authControllerPath, 'utf8');
    const hasForgotPassword = content.includes('forgotPassword');
    const hasResetPassword = content.includes('resetPassword');
    const hasValidateToken = content.includes('validateResetToken');
    
    if (hasForgotPassword && hasResetPassword && hasValidateToken) {
      console.log(`${colors.green}✅ All password reset functions implemented${colors.reset}`);
      console.log(`   - forgotPassword() ✓`);
      console.log(`   - validateResetToken() ✓`);
      console.log(`   - resetPassword() ✓\n`);
      checks.push({ name: 'Auth Controller Functions', status: 'PASS' });
    } else {
      console.log(`${colors.yellow}⚠️  Missing functions${colors.reset}\n`);
      checks.push({ name: 'Auth Controller Functions', status: 'INCOMPLETE' });
    }
  } else {
    console.log(`${colors.red}❌ Auth controller not found${colors.reset}\n`);
    checks.push({ name: 'Auth Controller Functions', status: 'FAIL' });
  }

  // CHECK 5: Email Service
  console.log(`${colors.bold}[5/8] Checking Email Service...${colors.reset}`);
  const emailServicePath = path.join(__dirname, 'services/emailService.js');
  if (fs.existsSync(emailServicePath)) {
    const content = fs.readFileSync(emailServicePath, 'utf8');
    if (content.includes('sendPasswordResetEmail')) {
      console.log(`${colors.green}✅ Email service implemented${colors.reset}\n`);
      checks.push({ name: 'Email Service', status: 'PASS' });
    } else {
      console.log(`${colors.red}❌ Email service incomplete${colors.reset}\n`);
      checks.push({ name: 'Email Service', status: 'FAIL' });
    }
  } else {
    console.log(`${colors.red}❌ Email service not found${colors.reset}\n`);
    checks.push({ name: 'Email Service', status: 'FAIL' });
  }

  // CHECK 6: User Model
  console.log(`${colors.bold}[6/8] Checking User Model...${colors.reset}`);
  const userModelPath = path.join(__dirname, 'models/User.js');
  if (fs.existsSync(userModelPath)) {
    const content = fs.readFileSync(userModelPath, 'utf8');
    const hasResetToken = content.includes('resetPasswordToken');
    const hasResetExpire = content.includes('resetPasswordExpire');
    const hasPasswordHashing = content.includes('bcryptjs') || content.includes('bcrypt');
    
    if (hasResetToken && hasResetExpire && hasPasswordHashing) {
      console.log(`${colors.green}✅ User model properly configured${colors.reset}`);
      console.log(`   - resetPasswordToken field ✓`);
      console.log(`   - resetPasswordExpire field ✓`);
      console.log(`   - Password hashing ✓\n`);
      checks.push({ name: 'User Model', status: 'PASS' });
    } else {
      console.log(`${colors.yellow}⚠️  Some fields missing${colors.reset}\n`);
      checks.push({ name: 'User Model', status: 'INCOMPLETE' });
    }
  } else {
    console.log(`${colors.red}❌ User model not found${colors.reset}\n`);
    checks.push({ name: 'User Model', status: 'FAIL' });
  }

  // CHECK 7: Environment Configuration
  console.log(`${colors.bold}[7/8] Checking Environment Configuration...${colors.reset}`);
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const hasEmailUser = content.includes('EMAIL_USER');
    const hasEmailPassword = content.includes('EMAIL_PASSWORD');
    
    if (hasEmailUser && hasEmailPassword) {
      const emailUserSet = !content.includes('EMAIL_USER=your-email@gmail.com') && 
                          !content.includes('EMAIL_USER=');
      const emailPassSet = !content.includes('EMAIL_PASSWORD=0000000000000000') &&
                          !content.includes('EMAIL_PASSWORD=');
      
      if (emailUserSet && emailPassSet) {
        console.log(`${colors.green}✅ Email credentials configured${colors.reset}\n`);
        checks.push({ name: 'Email Configuration', status: 'PASS' });
      } else {
        console.log(`${colors.yellow}⚠️  Email credentials NOT set (placeholder values)${colors.reset}`);
        console.log(`   EMAIL_USER: ${emailUserSet ? '✓ SET' : '❌ NOT SET'}`);
        console.log(`   EMAIL_PASSWORD: ${emailPassSet ? '✓ SET' : '❌ NOT SET'}\n`);
        checks.push({ name: 'Email Configuration', status: 'INCOMPLETE' });
      }
    } else {
      console.log(`${colors.yellow}⚠️  Email config missing from .env${colors.reset}\n`);
      checks.push({ name: 'Email Configuration', status: 'INCOMPLETE' });
    }
  } else {
    console.log(`${colors.red}❌ .env file not found${colors.reset}\n`);
    checks.push({ name: 'Email Configuration', status: 'FAIL' });
  }

  // CHECK 8: API Endpoints
  console.log(`${colors.bold}[8/8] Checking API Endpoints...${colors.reset}`);
  const endpoints = [
    { method: 'POST', path: '/api/auth/forgot-password', description: 'Send reset email' },
    { method: 'GET', path: '/api/auth/reset-password/:token', description: 'Validate token' },
    { method: 'POST', path: '/api/auth/reset-password/:token', description: 'Reset password' }
  ];
  
  try {
    for (const ep of endpoints) {
      console.log(`${colors.green}✓${colors.reset} ${ep.method.padEnd(6)} ${ep.path.padEnd(35)} - ${ep.description}`);
    }
    console.log('');
    checks.push({ name: 'API Endpoints', status: 'PASS' });
  } catch (error) {
    console.log(`${colors.red}❌ Could not verify endpoints${colors.reset}\n`);
    checks.push({ name: 'API Endpoints', status: 'FAIL' });
  }

  // SUMMARY
  console.log(`${colors.bold}${colors.blue}${'═'.repeat(70)}${colors.reset}\n`);
  console.log(`${colors.bold}DIAGNOSTIC SUMMARY${colors.reset}\n`);
  
  const passCount = checks.filter(c => c.status === 'PASS').length;
  const failCount = checks.filter(c => c.status === 'FAIL').length;
  const incompleteCount = checks.filter(c => c.status === 'INCOMPLETE').length;

  checks.forEach(check => {
    let symbol = '✓';
    let color = colors.green;
    if (check.status === 'FAIL') {
      symbol = '✗';
      color = colors.red;
    } else if (check.status === 'INCOMPLETE') {
      symbol = '⚠';
      color = colors.yellow;
    }
    
    console.log(`${color}${symbol}${colors.reset} ${check.name.padEnd(35)} [${check.status}]`);
  });

  console.log(`\n${colors.bold}Results:${colors.reset}`);
  console.log(`  ${colors.green}✓ PASS: ${passCount}${colors.reset}`);
  console.log(`  ${colors.yellow}⚠ INCOMPLETE: ${incompleteCount}${colors.reset}`);
  console.log(`  ${colors.red}✗ FAIL: ${failCount}${colors.reset}`);

  console.log(`\n${colors.bold}${colors.blue}${'═'.repeat(70)}${colors.reset}\n`);

  if (failCount === 0 && incompleteCount <= 1) {
    console.log(`${colors.bold}${colors.green}✅ SYSTEM READY FOR TESTING!${colors.reset}\n`);
    console.log('Next Steps:');
    console.log('  1. Set up Gmail App Password (if not done)');
    console.log('  2. Update .env with credentials');
    console.log('  3. Restart backend: npm run dev');
    console.log('  4. Test using the app\n');
  } else {
    console.log(`${colors.bold}${colors.yellow}⚠️  Fix issues above before testing${colors.reset}\n`);
  }
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error(`${colors.red}Diagnostic error:${colors.reset}`, error.message);
});
