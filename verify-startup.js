#!/usr/bin/env node

/**
 * ============================================================================
 * MERN STACK STARTUP VERIFICATION SCRIPT
 * ============================================================================
 * 
 * This script verifies that your MERN stack is properly configured and ready to run.
 * 
 * Run this BEFORE starting the application:
 * node verify-startup.js
 * 
 * It checks:
 * 1. Environment files exist
 * 2. All required environment variables are set
 * 3. MongoDB connection string is valid
 * 4. Node modules are installed
 * 5. Ports are available
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`),
};

let errorCount = 0;
let warningCount = 0;

// ============================================================================
// HELPERS
// ============================================================================

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // Port in use
      } else {
        resolve(true); // Port available (other error)
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true); // Port available
    });
    server.listen(port);
  });
}

// ============================================================================
// CHECKS
// ============================================================================

async function runChecks() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`${colors.bold}${colors.blue}🔍 MERN STACK STARTUP VERIFICATION${colors.reset}`);
  console.log(`${'═'.repeat(70)}\n`);

  // Check 1: Backend environment file
  log.title('1️⃣  Backend Environment Configuration');
  const backendEnv = path.join(__dirname, 'backend', '.env');
  
  if (fileExists(backendEnv)) {
    log.success('Backend .env file exists');
    
    // Parse .env file
    const envContent = fs.readFileSync(backendEnv, 'utf-8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && !key.startsWith('#')) {
        envVars[key.trim()] = (value || '').trim();
      }
    });

    // Check required variables
    const requiredBackendVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
    requiredBackendVars.forEach(varName => {
      if (envVars[varName]) {
        log.success(`  - ${varName} is set`);
      } else {
        log.error(`  - ${varName} is MISSING (required)`);
        errorCount++;
      }
    });

    // Optional but recommended
    if (envVars['GROQ_API_KEY']) {
      log.success(`  - GROQ_API_KEY is set`);
    } else {
      log.warn(`  - GROQ_API_KEY is not set (optional but recommended)`);
      warningCount++;
    }

    if (envVars['CLIENT_URL']) {
      log.success(`  - CLIENT_URL is set (production CORS)`);
    } else {
      log.info(`  - CLIENT_URL is not set (auto-configured for development)`);
    }

    // Validate values
    if (envVars['MONGODB_URI']) {
      const mongoUri = envVars['MONGODB_URI'];
      if (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')) {
        log.success(`  - MongoDB URI format is valid`);
      } else {
        log.error(`  - MongoDB URI format is invalid (must start with mongodb:// or mongodb+srv://)`);
        errorCount++;
      }
    }

    if (envVars['JWT_SECRET']) {
      const secret = envVars['JWT_SECRET'];
      if (secret.length >= 32) {
        log.success(`  - JWT_SECRET is strong (${secret.length} chars)`);
      } else {
        log.warn(`  - JWT_SECRET is weak (${secret.length} chars, should be 32+)`);
        warningCount++;
      }
    }

  } else {
    log.error('Backend .env file not found!');
    log.info('  Solution: cp backend/.env.local-example backend/.env');
    errorCount++;
  }

  // Check 2: Frontend environment file
  log.title('2️⃣  Frontend Environment Configuration');
  const frontendEnv = path.join(__dirname, 'frontend', '.env');
  
  if (fileExists(frontendEnv)) {
    log.success('Frontend .env file exists');
  } else {
    log.warn('Frontend .env file not found (will use defaults)');
    log.info('  Default: VITE_API_URL=/api, VITE_BACKEND_URL=http://127.0.0.1:5000');
  }

  // Check 3: Node modules
  log.title('3️⃣  Dependencies Installation');
  const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
  const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');

  if (fileExists(backendNodeModules)) {
    log.success('Backend node_modules exists');
  } else {
    log.warn('Backend node_modules not found');
    log.info('  Solution: cd backend && npm install');
    warningCount++;
  }

  if (fileExists(frontendNodeModules)) {
    log.success('Frontend node_modules exists');
  } else {
    log.warn('Frontend node_modules not found');
    log.info('  Solution: cd frontend && npm install');
    warningCount++;
  }

  // Check 4: Port availability
  log.title('4️⃣  Port Availability');
  const defaultBackendPort = 5000;
  const defaultFrontendPort = 5173;

  const backendPortAvailable = await checkPort(defaultBackendPort);
  if (backendPortAvailable) {
    log.success(`Backend port ${defaultBackendPort} is available`);
  } else {
    log.error(`Backend port ${defaultBackendPort} is already in use!`);
    log.info('  Solution 1: Kill the existing process');
    log.info('    Windows: netstat -ano | findstr :5000 && taskkill /PID <pid> /F');
    log.info('    Mac/Linux: lsof -i :5000 && kill -9 <pid>');
    log.info('  Solution 2: Change PORT in backend/.env');
    errorCount++;
  }

  const frontendPortAvailable = await checkPort(defaultFrontendPort);
  if (frontendPortAvailable) {
    log.success(`Frontend port ${defaultFrontendPort} is available`);
  } else {
    log.warn(`Frontend port ${defaultFrontendPort} is already in use`);
    log.info('  Solution: Frontend will use next available port (5174, 5175, etc.)');
    warningCount++;
  }

  // Check 5: Critical files exist
  log.title('5️⃣  Critical Backend Files');
  const criticalFiles = [
    'backend/server.js',
    'backend/config/bootstrap.js',
    'backend/config/environment.js',
    'backend/config/db.js',
    'backend/package.json'
  ];

  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fileExists(filePath)) {
      log.success(`  - ${file}`);
    } else {
      log.error(`  - ${file} is MISSING`);
      errorCount++;
    }
  });

  // Final report
  log.title('📊 Verification Summary');
  
  console.log(`\nTotal checks: ${errorCount + warningCount + 3}`); // Rough count
  
  if (errorCount === 0 && warningCount === 0) {
    log.success(`${colors.bold}ALL CHECKS PASSED - Ready to start!${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Terminal 1: cd backend && npm run dev`);
    console.log(`  2. Terminal 2: cd frontend && npm run dev`);
    console.log(`  3. Browser: http://localhost:5173/login\n`);
    return true;
  } else if (errorCount === 0) {
    log.warn(`${colors.bold}WARNINGS FOUND - May work, check above${colors.reset}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Terminal 1: cd backend && npm run dev`);
    console.log(`  2. Terminal 2: cd frontend && npm run dev`);
    console.log(`  3. Browser: http://localhost:5173/login\n`);
    return true;
  } else {
    log.error(`${colors.bold}ERRORS FOUND - FIX BEFORE STARTING${colors.reset}`);
    console.log(`\nErrors to fix: ${errorCount}`);
    console.log(`Warnings to address: ${warningCount}\n`);
    return false;
  }
}

// ============================================================================
// RUN VERIFICATION
// ============================================================================

runChecks().then((success) => {
  if (!success) {
    process.exit(1);
  }
});
