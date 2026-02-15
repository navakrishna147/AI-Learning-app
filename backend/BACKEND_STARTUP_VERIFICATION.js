#!/usr/bin/env node

/**
 * ============================================================================
 * BACKEND STARTUP VERIFICATION SCRIPT
 * ============================================================================
 * Run this BEFORE starting the server to verify all configurations
 * 
 * Usage: node BACKEND_STARTUP_VERIFICATION.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n' + '═'.repeat(70));
console.log('🔍 BACKEND STARTUP VERIFICATION'.padEnd(70));
console.log('═'.repeat(70) + '\n');

// Load .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ CRITICAL: .env file not found at', envPath);
  console.error('   Solution: Create .env file with required variables');
  process.exit(1);
}

const envConfig = dotenv.config({ path: envPath });
if (envConfig.error) {
  console.error('❌ Error loading .env file:', envConfig.error);
  process.exit(1);
}

console.log('✅ .env file loaded successfully\n');

// ============================================================================
// CHECK 1: REQUIRED ENVIRONMENT VARIABLES
// ============================================================================
console.log('📋 CHECK 1: Required Environment Variables');
console.log('─'.repeat(70));

const requiredVars = {
  'PORT': 'Server port (must be 5000)',
  'NODE_ENV': 'Environment (development/production)',
  'MONGODB_URI': 'MongoDB connection string',
  'JWT_SECRET': 'JWT signing secret'
};

let requiredVarsOK = true;
Object.entries(requiredVars).forEach(([key, description]) => {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key.padEnd(20)} = ${value.substring(0, 40)}${value.length > 40 ? '...' : ''}`);
  } else {
    console.log(`❌ ${key.padEnd(20)} = NOT SET (${description})`);
    requiredVarsOK = false;
  }
});

if (!requiredVarsOK) {
  console.error('\n❌ CRITICAL: Missing required variables in .env');
  process.exit(1);
}

console.log('\n✅ All required variables are set\n');

// ============================================================================
// CHECK 2: PORT VERIFICATION
// ============================================================================
console.log('📋 CHECK 2: Port Configuration');
console.log('─'.repeat(70));

const PORT = parseInt(process.env.PORT) || 5000;
if (process.env.PORT && parseInt(process.env.PORT) !== PORT) {
  console.warn(`⚠️ PORT value is not an integer`);
} else {
  console.log(`✅ Backend will run on PORT: ${PORT}`);
  console.log(`✅ Frontend should proxy to: http://localhost:${PORT}/api`);
}

if (PORT !== 5000) {
  console.warn(`⚠️ WARNING: Backend running on non-standard port ${PORT}`);
  console.warn('   Ensure frontend .env has: VITE_BACKEND_URL=http://localhost:' + PORT);
}

console.log();

// ============================================================================
// CHECK 3: AI CONFIGURATION (GROQ API)
// ============================================================================
console.log('📋 CHECK 3: AI Service Configuration (Groq)');
console.log('─'.repeat(70));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY is NOT SET');
  console.error('   Impact: Chat, Summary, Flashcards, Quiz features will NOT work');
  console.error('   Solution:');
  console.error('      1. Get Groq API key from: https://console.groq.com/keys');
  console.error('      2. Add to backend/.env: GROQ_API_KEY=your_key_here');
  console.error('      3. Restart backend server');
} else if (GROQ_API_KEY.length < 20) {
  console.error('❌ GROQ_API_KEY appears to be invalid (too short)');
  console.error('   Expected format: gsk_YOUR_GROQ_API_KEY_HERE');
} else if (!GROQ_API_KEY.startsWith('gsk_')) {
  console.error('❌ GROQ_API_KEY has invalid prefix (should start with "gsk_")');
} else {
  console.log('✅ GROQ_API_KEY is configured');
  console.log(`   Key: ${GROQ_API_KEY.substring(0, 10)}...${GROQ_API_KEY.substring(-5)}`);
  console.log('   Model: llama-3.1-8b-instant');
  console.log('   Status: ✅ AI features ENABLED');
}

console.log();

// ============================================================================
// CHECK 4: MONGODB CONNECTION STATUS
// ============================================================================
console.log('📋 CHECK 4: MongoDB Configuration');
console.log('─'.repeat(70));

const MONGODB_URI = process.env.MONGODB_URI;
console.log(`MongoDB URI: ${MONGODB_URI}`);

if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
  console.warn('⚠️ Using local MongoDB - Ensure mongod service is running');
  console.warn('   Start MongoDB:');
  console.warn('      Windows: "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe"');
  console.warn('      or: mongod (if added to PATH)');
  console.warn('      macOS/Linux: brew services start mongodb-community');
  console.log('   Verify: mongo or mongosh (should connect successfully)');
} else if (MONGODB_URI.includes('mongodb+srv')) {
  console.log('✅ Using MongoDB Atlas (Cloud)');
  console.warn('⚠️  Ensure:');
  console.warn('   1. Connection string is correct');
  console.warn('   2. IP whitelist includes your machine');
  console.warn('   3. Database user credentials are valid');
} else {
  console.log('ℹ️  Using custom MongoDB connection');
}

console.log();

// ============================================================================
// CHECK 5: EMAIL CONFIGURATION (OPTIONAL)
// ============================================================================
console.log('📋 CHECK 5: Email Configuration (Optional)');
console.log('─'.repeat(70));

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

if (!EMAIL_USER || EMAIL_USER === 'your-email@gmail.com') {
  console.warn('⚠️ EMAIL_USER not configured');
  console.warn('   Impact: Forgot password feature will NOT work');
  console.warn('   Optional: Add EMAIL_USER to .env to enable');
} else {
  console.log(`✅ EMAIL_USER: ${EMAIL_USER}`);
}

if (!EMAIL_PASSWORD || EMAIL_PASSWORD === 'your-app-password') {
  console.warn('⚠️ EMAIL_PASSWORD not configured');
  console.warn('   To enable: Use Gmail App Password (16 characters, no spaces)');
} else if (EMAIL_PASSWORD.length !== 16) {
  console.warn(`⚠️ EMAIL_PASSWORD length is ${EMAIL_PASSWORD.length} (expected 16)`);
} else if (EMAIL_PASSWORD && EMAIL_USER && EMAIL_USER !== 'your-email@gmail.com') {
  console.log('✅ Email configuration looks good');
}

console.log();

// ============================================================================
// CHECK 6: REQUIRED FILES
// ============================================================================
console.log('📋 CHECK 6: Required Backend Files');
console.log('─'.repeat(70));

const requiredFiles = [
  'server.js',
  'package.json',
  'config/db.js',
  'config/env.js',
  'services/aiService.js',
  'controllers/chatController.js',
  'routes/auth.js',
  'routes/chat.js'
];

let filesOK = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file} NOT FOUND`);
    filesOK = false;
  }
});

if (!filesOK) {
  console.error('\n❌ Some required files are missing');
  process.exit(1);
}

console.log('\n✅ All required files present\n');

// ============================================================================
// SUMMARY
// ============================================================================
console.log('═'.repeat(70));
console.log('✅ BACKEND VERIFICATION COMPLETE'.padEnd(70));
console.log('═'.repeat(70));

console.log('\n📋 STARTUP CHECKLIST:');
console.log('   ✅ .env file configured');

if (requiredVarsOK) {
  console.log('   ✅ Required variables set');
} else {
  console.log('   ❌ Missing required variables');
}

if (GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_') && GROQ_API_KEY.length > 20) {
  console.log('   ✅ Groq API key configured (AI features enabled)');
} else {
  console.log('   ⚠️  Groq API key NOT configured (AI features disabled)');
}

console.log('   ✅ MongoDB configured');
console.log('   ✅ All files present\n');

console.log('🚀 READY TO START BACKEND:');
console.log('   cd backend');
console.log('   npm run dev\n');

console.log('📍 Then verify backend is running:');
console.log(`   Open: http://localhost:${PORT}/health`);
console.log(`   Should see: { "status": "ok", ... }\n`);

console.log('✅ Frontend should connect to http://localhost:' + PORT + '/api\n');
