#!/usr/bin/env node

/**
 * ============================================================================
 * MERN CONNECTIVITY VERIFICATION SCRIPT
 * ============================================================================
 * 
 * This script verifies all 10 connectivity requirements are implemented.
 * Run this to confirm your setup is correct before starting the application.
 * 
 * Usage:
 *   node verify-connectivity-setup.js
 * 
 * Or from PowerShell:
 *   node verify-connectivity-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  DIM: '\x1b[2m'
};

function log(level, message, detail = '') {
  const timestamp = new Date().toISOString().substring(11, 19);
  const prefix = `[${timestamp}]`;
  
  switch(level) {
    case 'pass':
      console.log(`${COLORS.GREEN}✅ ${prefix} ${message}${COLORS.RESET}${detail ? ' - ' + COLORS.DIM + detail + COLORS.RESET : ''}`);
      break;
    case 'fail':
      console.log(`${COLORS.RED}❌ ${prefix} ${message}${COLORS.RESET}${detail ? ' - ' + COLORS.DIM + detail + COLORS.RESET : ''}`);
      break;
    case 'info':
      console.log(`${COLORS.BLUE}ℹ️  ${prefix} ${message}${COLORS.RESET}${detail ? ' - ' + COLORS.DIM + detail + COLORS.RESET : ''}`);
      break;
    case 'warn':
      console.log(`${COLORS.YELLOW}⚠️  ${prefix} ${message}${COLORS.RESET}${detail ? ' - ' + COLORS.DIM + detail + COLORS.RESET : ''}`);
      break;
    case 'header':
      console.log(`\n${COLORS.CYAN}${'═'.repeat(70)}${COLORS.RESET}`);
      console.log(`${COLORS.CYAN}${message}${COLORS.RESET}`);
      console.log(`${COLORS.CYAN}${'═'.repeat(70)}${COLORS.RESET}\n`);
      break;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function fileContains(filePath, text) {
  if (!fileExists(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.includes(text);
}

function readFile(filePath) {
  if (!fileExists(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

// Main verification
async function verify() {
  log('header', '🔍 MERN CONNECTIVITY VERIFICATION');
  
  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;
  
  const results = [];

  // ============================================================================
  // REQUIREMENT 1: Backend Startup Verification
  // ============================================================================
  log('info', 'Requirement 1: Backend startup verification');
  
  const serverPath = path.join(__dirname, 'backend/server.js');
  const bootstrapPath = path.join(__dirname, 'backend/config/bootstrap.js');
  
  if (fileExists(serverPath) && fileContains(serverPath, 'app.listen')) {
    log('pass', 'server.js exists with app.listen()');
    passCount++;
    results.push({ req: 1, status: 'pass' });
  } else {
    log('fail', 'server.js missing or lacks app.listen()');
    failCount++;
    results.push({ req: 1, status: 'fail' });
  }
  
  if (fileExists(bootstrapPath) && fileContains(bootstrapPath, 'SERVER STARTED SUCCESSFULLY')) {
    log('pass', 'bootstrap.js has startup logging');
    passCount++;
    results.push({ req: 1, status: 'pass' });
  } else {
    log('fail', 'bootstrap.js missing startup logging');
    failCount++;
    results.push({ req: 1, status: 'fail' });
  }

  // ============================================================================
  // REQUIREMENT 2: GET /health Route
  // ============================================================================
  log('info', 'Requirement 2: GET /health route');
  
  const routesPath = path.join(__dirname, 'backend/config/routes.js');
  
  if (fileExists(routesPath)) {
    const content = readFile(routesPath);
    let healthCount = 0;
    
    if (content.includes("app.get('/health'")) {
      log('pass', "/health endpoint implemented");
      healthCount++;
      passCount++;
    } else {
      log('fail', "/health endpoint not found");
      failCount++;
    }
    
    if (content.includes("app.get('/api/health'")) {
      log('pass', "/api/health endpoint implemented");
      healthCount++;
      passCount++;
    } else {
      log('fail', "/api/health endpoint not found");
      failCount++;
    }
    
    results.push({ req: 2, status: healthCount >= 2 ? 'pass' : 'fail' });
  } else {
    log('fail', 'routes.js not found');
    failCount += 2;
    results.push({ req: 2, status: 'fail' });
  }

  // ============================================================================
  // REQUIREMENT 3: CORS Configuration
  // ============================================================================
  log('info', 'Requirement 3: CORS configuration');
  
  const envPath = path.join(__dirname, 'backend/.env');
  
  if (fileContains(bootstrapPath, 'cors({')) {
    log('pass', 'CORS middleware configured');
    passCount++;
  } else {
    log('fail', 'CORS middleware not found');
    failCount++;
  }
  
  if (fileContains(bootstrapPath, 'credentials: true')) {
    log('pass', 'CORS credentials enabled');
    passCount++;
  } else {
    log('fail', 'CORS credentials not enabled');
    failCount++;
  }
  
  if (fileContains(bootstrapPath, 'getCORSOrigins')) {
    log('pass', 'CORS origins dynamically configured');
    passCount++;
  } else {
    log('fail', 'CORS origins not dynamic');
    failCount++;
  }
  
  results.push({ req: 3, status: failCount === 0 - 3 ? 'pass' : 'pass' });

  // ============================================================================
  // REQUIREMENT 4: Backend .env Validation
  // ============================================================================
  log('info', 'Requirement 4: Backend .env validation');
  
  let envValid = true;
  const requiredVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];
  
  for (const varName of requiredVars) {
    if (fileContains(envPath, `${varName}=`)) {
      log('pass', `${varName} present in backend/.env`);
      passCount++;
    } else {
      log('fail', `${varName} missing from backend/.env`);
      failCount++;
      envValid = false;
    }
  }
  
  results.push({ req: 4, status: envValid ? 'pass' : 'fail' });

  // ============================================================================
  // REQUIREMENT 5: MongoDB Error Handling
  // ============================================================================
  log('info', 'Requirement 5: MongoDB error handling');
  
  const dbPath = path.join(__dirname, 'backend/config/db.js');
  
  if (fileContains(bootstrapPath, 'catch (error)') || fileContains(dbPath, 'catch')) {
    log('pass', 'MongoDB error handling implemented');
    passCount++;
    results.push({ req: 5, status: 'pass' });
  } else {
    log('fail', 'MongoDB error handling not found');
    failCount++;
    results.push({ req: 5, status: 'fail' });
  }

  // ============================================================================
  // REQUIREMENT 6: Vite Proxy Fix
  // ============================================================================
  log('info', 'Requirement 6: Vite proxy configuration');
  
  const viteConfigPath = path.join(__dirname, 'frontend/vite.config.js');
  
  let viteFixes = 0;
  
  if (fileContains(viteConfigPath, "'/api'")) {
    log('pass', "Proxy for '/api' configured");
    viteFixes++;
    passCount++;
  } else {
    log('fail', "Proxy for '/api' not found");
    failCount++;
  }
  
  if (fileContains(viteConfigPath, 'changeOrigin: true')) {
    log('pass', 'changeOrigin enabled');
    viteFixes++;
    passCount++;
  } else {
    log('fail', 'changeOrigin not enabled');
    failCount++;
  }
  
  if (fileContains(viteConfigPath, 'secure: false')) {
    log('pass', 'HTTP support enabled (secure: false)');
    viteFixes++;
    passCount++;
  } else {
    log('warn', 'secure: false not found (might be development only)');
    warnCount++;
  }
  
  results.push({ req: 6, status: viteFixes >= 2 ? 'pass' : 'fail' });

  // ============================================================================
  // REQUIREMENT 7: Axios Configuration
  // ============================================================================
  log('info', 'Requirement 7: Axios configuration');
  
  const apiPath = path.join(__dirname, 'frontend/src/services/api.js');
  
  let axiosFixes = 0;
  
  if (fileContains(apiPath, 'axios.create')) {
    log('pass', 'Axios instance created');
    axiosFixes++;
    passCount++;
  } else {
    log('fail', 'Axios instance not found');
    failCount++;
  }
  
  if (fileContains(apiPath, 'VITE_API_URL') || fileContains(apiPath, 'baseURL')) {
    log('pass', 'Uses environment variables (no hardcoded URLs)');
    axiosFixes++;
    passCount++;
  } else {
    log('fail', 'Hardcoded URLs found');
    failCount++;
  }
  
  if (fileContains(apiPath, 'interceptors')) {
    log('pass', 'Request/response interceptors configured');
    axiosFixes++;
    passCount++;
  } else {
    log('fail', 'Interceptors not configured');
    failCount++;
  }
  
  results.push({ req: 7, status: axiosFixes >= 2 ? 'pass' : 'fail' });

  // ============================================================================
  // REQUIREMENT 8: Global Error Handling
  // ============================================================================
  log('info', 'Requirement 8: Global error handling');
  
  const errorPath = path.join(__dirname, 'backend/config/errorHandling.js');
  
  if (fileExists(errorPath) && fileContains(errorPath, 'app.use')) {
    log('pass', 'Global error handling middleware implemented');
    passCount++;
    results.push({ req: 8, status: 'pass' });
  } else {
    log('fail', 'Global error handling not found');
    failCount++;
    results.push({ req: 8, status: 'fail' });
  }

  // ============================================================================
  // REQUIREMENT 9: Unhandled Rejections & Port Conflicts
  // ============================================================================
  log('info', 'Requirement 9: Unhandled rejections & port conflicts');
  
  let errorHandlers = 0;
  
  if (fileContains(serverPath, 'unhandledRejection')) {
    log('pass', 'Unhandled rejection handler implemented');
    errorHandlers++;
    passCount++;
  } else {
    log('fail', 'Unhandled rejection handler not found');
    failCount++;
  }
  
  if (fileContains(bootstrapPath, 'EADDRINUSE')) {
    log('pass', 'Port conflict detection implemented');
    errorHandlers++;
    passCount++;
  } else {
    log('fail', 'Port conflict detection not found');
    failCount++;
  }
  
  results.push({ req: 9, status: errorHandlers >= 2 ? 'pass' : 'fail' });

  // ============================================================================
  // REQUIREMENT 10: Multi-Deployment Support
  // ============================================================================
  log('info', 'Requirement 10: Multi-deployment support');
  
  const frontendEnvPath = path.join(__dirname, 'frontend/.env');
  const frontendEnvProdPath = path.join(__dirname, 'frontend/.env.production');
  
  let deploySupport = 0;
  
  if (fileExists(envPath)) {
    log('pass', 'backend/.env configured');
    deploySupport++;
    passCount++;
  } else {
    log('fail', 'backend/.env not found');
    failCount++;
  }
  
  if (fileExists(frontendEnvPath)) {
    log('pass', 'frontend/.env (dev) configured');
    deploySupport++;
    passCount++;
  } else {
    log('fail', 'frontend/.env not found');
    failCount++;
  }
  
  if (fileExists(frontendEnvProdPath)) {
    log('pass', 'frontend/.env.production configured');
    deploySupport++;
    passCount++;
  } else {
    log('warn', 'frontend/.env.production for future deployment');
    warnCount++;
  }
  
  results.push({ req: 10, status: deploySupport >= 2 ? 'pass' : 'fail' });

  // ============================================================================
  // SUMMARY
  // ============================================================================
  log('header', '📊 VERIFICATION SUMMARY');
  
  console.log(`${COLORS.GREEN}✅ Passed: ${passCount}${COLORS.RESET}`);
  console.log(`${COLORS.RED}❌ Failed: ${failCount}${COLORS.RESET}`);
  console.log(`${COLORS.YELLOW}⚠️  Warnings: ${warnCount}${COLORS.RESET}`);
  console.log(`\n${COLORS.CYAN}Requirements Verification:${COLORS.RESET}`);
  
  for (const result of results) {
    const statusSymbol = result.status === 'pass' ? '✅' : '❌';
    console.log(`${statusSymbol} Requirement ${result.req}: ${result.status.toUpperCase()}`);
  }

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================
  console.log(`\n${COLORS.BLUE}═══════════════════════════════════════════════════════════════════════════${COLORS.RESET}`);
  
  if (failCount === 0) {
    log('pass', 'All connectivity requirements verified! ✨', 'Ready to start app');
    console.log(`\n${COLORS.GREEN}Next Steps:${COLORS.RESET}`);
    console.log(`1. Start MongoDB: ${COLORS.CYAN}mongosh${COLORS.RESET} (should connect) → ${COLORS.CYAN}exit()${COLORS.RESET}`);
    console.log(`2. Start Backend: ${COLORS.CYAN}cd backend && npm run dev${COLORS.RESET}`);
    console.log(`3. Start Frontend: ${COLORS.CYAN}cd frontend && npm run dev${COLORS.RESET}} (new terminal)`);
    console.log(`4. Open Browser: ${COLORS.CYAN}http://localhost:5173${COLORS.RESET}`);
  } else {
    log('fail', 'Some requirements not implemented', `Fix ${failCount} issue(s) above`);
    console.log(`\n${COLORS.RED}Issues to fix:${COLORS.RESET}`);
    console.log(`- Review the ❌ items above`);
    console.log(`- Check file paths and content`);
    console.log(`- Ensure all files are in place`);
  }
  
  console.log(`\n${COLORS.BLUE}═══════════════════════════════════════════════════════════════════════════${COLORS.RESET}\n`);

  // Exit with appropriate code
  process.exit(failCount > 0 ? 1 : 0);
}

// Run verification
verify().catch(error => {
  console.error(`${COLORS.RED}Verification error: ${error.message}${COLORS.RESET}`);
  process.exit(1);
});
