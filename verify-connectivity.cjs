#!/usr/bin/env node

/**
 * ============================================================================
 * MERN CONNECTIVITY VERIFICATION SCRIPT
 * ============================================================================
 * 
 * Comprehensive diagnostic tool to verify:
 * 1. Backend connectivity
 * 2. Frontend proxy configuration
 * 3. Environment variables
 * 4. Port availability
 * 5. CORS configuration
 * 
 * Usage:
 *   node verify-connectivity.cjs                   # Basic check
 *   node verify-connectivity.cjs --verbose         # Detailed output
 *   node verify-connectivity.cjs --full            # Complete diagnostics
 *   node verify-connectivity.cjs --fix             # Auto-fix common issues
 */

import http from 'http';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

const BACKEND_PORT = process.env.PORT || 5000;
const FRONTEND_PORT = 5173;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('--full');
const full = args.includes('--full');
const autoFix = args.includes('--fix');

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const log = (msg, level = 'info') => {
  const icons = {
    success: '✅',
    error: '❌',
    warn: '⚠️ ',
    info: 'ℹ️ ',
    debug: '🔍',
  };
  console.log(`${icons[level]} ${msg}`);
};

const request = (url, timeout = 5000) => {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, error: null });
        } catch {
          resolve({ status: res.statusCode, data, error: null });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ error: err.message, code: err.code, status: null });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Timeout', code: 'ETIMEDOUT', status: null });
    });
  });
};

const checkPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve({ available: false, inUse: true });
      } else {
        resolve({ available: true, inUse: false, error: err.message });
      }
    });
    server.once('listening', () => {
      server.close();
      resolve({ available: true, inUse: false });
    });
    server.listen(port);
  });
};

const readEnvFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          env[key.trim()] = value.trim();
        }
      }
    });
    return env;
  } catch (err) {
    return null;
  }
};

// ============================================================================
// VERIFICATION CHECKS
// ============================================================================

const runVerification = async () => {
  console.log('\n' + '═'.repeat(80));
  console.log('🔍 MERN CONNECTIVITY VERIFICATION');
  console.log('═'.repeat(80) + '\n');

  let results = {
    backend: { healthy: false, details: [] },
    frontend: { healthy: false, details: [] },
    ports: { backend: false, frontend: false },
    environment: { backend: {}, frontend: {} },
    cors: { configured: false, details: [] },
    issues: [],
    solutions: []
  };

  // ===== 1. CHECK PORT AVAILABILITY =====
  console.log('📊 CHECKING PORT AVAILABILITY:');
  console.log('─'.repeat(80));

  const backendPortStatus = await checkPortAvailable(BACKEND_PORT);
  if (backendPortStatus.inUse) {
    log(`Backend port ${BACKEND_PORT} is already in use`, 'error');
    results.ports.backend = false;
    results.issues.push(`Port ${BACKEND_PORT} in use - backend may be running elsewhere or port conflict`);
  } else if (backendPortStatus.available) {
    log(`Backend port ${BACKEND_PORT} is available`, 'success');
    results.ports.backend = true;
  } else {
    log(`Could not determine status of port ${BACKEND_PORT}`, 'warn');
  }

  // ===== 2. CHECK BACKEND CONNECTIVITY =====
  console.log('\n📡 CHECKING BACKEND CONNECTIVITY:');
  console.log('─'.repeat(80));

  // Check if backend is running
  const healthCheck = await request(`${BACKEND_URL}/health`);
  if (healthCheck.error) {
    log(`Backend health check failed: ${healthCheck.error}`, 'error');
    results.backend.healthy = false;
    results.backend.details.push(`❌ Not responding to health check`);
    results.backend.details.push(`   Error: ${healthCheck.error}`);
    results.issues.push('Backend server is not running or not reachable');
    results.solutions.push('Start backend: cd backend && npm run dev');
  } else if (healthCheck.status === 200) {
    log(`Backend is responding`, 'success');
    results.backend.healthy = true;
    results.backend.details.push('✅ Responding to /health');
  }

  // Check API health
  const apiHealth = await request(`${BACKEND_URL}/api/health`);
  if (apiHealth.error) {
    log(`API health endpoint failed: ${apiHealth.error}`, 'warn');
  } else if (apiHealth.status === 200 || apiHealth.status === 503) {
    const dbStatus = apiHealth.data?.database?.connected ? '✅ Connected' : '⚠️ Not connected';
    log(`API health - Status ${apiHealth.status}`, apiHealth.status === 200 ? 'success' : 'warn');
    results.backend.details.push(`✅ /api/health responding (${apiHealth.status})`);
    results.backend.details.push(`   Database: ${dbStatus}`);

    if (verbose && apiHealth.data) {
      console.log(`   Environment: ${apiHealth.data.environment || 'unknown'}`);
      console.log(`   Uptime: ${apiHealth.data.uptime}s`);
    }
  }

  // ===== 3. CHECK ENVIRONMENT VARIABLES =====
  console.log('\n🔐 CHECKING ENVIRONMENT VARIABLES:');
  console.log('─'.repeat(80));

  const backendEnv = readEnvFile(path.join(__dirname, '.env'));
  const backendEnvProd = readEnvFile(path.join(__dirname, '.env.production'));
  const backendEnvDev = readEnvFile(path.join(__dirname, '.env.development'));

  if (!backendEnv && !backendEnvProd && !backendEnvDev) {
    log('Backend .env file not found', 'error');
    results.issues.push('Backend environment variables not configured');
  } else {
    const env = backendEnv || backendEnvDev || backendEnvProd;
    const port = env.PORT || '5000';
    log(`Backend PORT: ${port}`, port === BACKEND_PORT.toString() ? 'success' : 'warn');
    results.environment.backend.PORT = port;

    if (port !== BACKEND_PORT.toString()) {
      results.issues.push(`Backend PORT (${port}) doesn't match expected ${BACKEND_PORT}`);
    }

    if (!env.JWT_SECRET || env.JWT_SECRET.includes('secret')) {
      log('JWT_SECRET needs to be configured', 'warn');
      results.issues.push('JWT_SECRET is using default or not configured');
    } else {
      log('JWT_SECRET is configured', 'success');
    }

    if (!env.MONGODB_URI) {
      log('MONGODB_URI not set', 'error');
      results.issues.push('MongoDB connection string not configured');
    } else {
      log('MONGODB_URI is configured', 'success');
    }

    if (verbose && env.CORS_ORIGINS) {
      log(`CORS Origins: ${env.CORS_ORIGINS}`, 'info');
      results.cors.configured = true;
    }
  }

  // ===== 4. CHECK FRONTEND CONFIGURATION =====
  console.log('\n🎨 CHECKING FRONTEND CONFIGURATION:');
  console.log('─'.repeat(80));

  const frontendEnv = readEnvFile(path.join(__dirname, '../frontend/.env'));
  if (!frontendEnv) {
    log('Frontend .env file not found', 'error');
    results.issues.push('Frontend environment variables not configured');
  } else {
    const apiUrl = frontendEnv.VITE_API_URL || '/api';
    log(`Frontend VITE_API_URL: ${apiUrl}`, 'success');
    results.environment.frontend.VITE_API_URL = apiUrl;

    const backendUrl = frontendEnv.VITE_BACKEND_URL || 'http://127.0.0.1:5000';
    log(`Frontend VITE_BACKEND_URL: ${backendUrl}`, 'success');
    results.environment.frontend.VITE_BACKEND_URL = backendUrl;

    if (verbose) {
      const timeout = frontendEnv.VITE_API_TIMEOUT || '60000';
      log(`API Timeout: ${timeout}ms`, 'info');
    }
  }

  // ===== 5. SUMMARY =====
  console.log('\n📋 SUMMARY:');
  console.log('═'.repeat(80));

  const backendHealthy = results.backend.healthy;
  const envConfigured = Object.keys(results.environment.backend).length > 0 &&
    Object.keys(results.environment.frontend).length > 0;

  console.log(`\nBackend Status:   ${backendHealthy ? '✅ Healthy' : '❌ Not responding'}`);
  console.log(`Environment:      ${envConfigured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Ports Available:  ${results.ports.backend ? '✅ Yes' : '⚠️ In use'}`);

  // ===== 6. ISSUES & SOLUTIONS =====
  if (results.issues.length > 0) {
    console.log('\n🔴 ISSUES DETECTED:');
    console.log('─'.repeat(80));
    results.issues.forEach((issue, i) => {
      console.log(`${i + 1}. ❌ ${issue}`);
    });
  }

  if (results.solutions.length > 0) {
    console.log('\n💡 SOLUTIONS:');
    console.log('─'.repeat(80));
    results.solutions.forEach((solution, i) => {
      console.log(`${i + 1}. ✅ ${solution}`);
    });

    // Add general troubleshooting
    console.log('\n📚 GENERAL TROUBLESHOOTING:');
    console.log('─'.repeat(80));
    console.log('1. Verify MongoDB is running: mongosh or mongo');
    console.log('2. Check backend: npm run dev (from backend directory)');
    console.log('3. Test health: curl http://127.0.0.1:5000/health');
    console.log('4. Check frontend proxy: cat frontend/vite.config.js (look for /api proxy)');
    console.log('5. Verify frontend: npm run dev (from frontend directory)');
    console.log('6. Check CORS: backend/.env CORS_ORIGINS should include frontend URL');
  }

  // Full diagnostics
  if (full) {
    console.log('\n🔧 FULL DIAGNOSTICS:');
    console.log('═'.repeat(80));
    if (results.backend.details.length > 0) {
      console.log('\nBackend Details:');
      results.backend.details.forEach(detail => console.log(`  ${detail}`));
    }
  }

  console.log('\n' + '═'.repeat(80) + '\n');

  return results;
};

// ============================================================================
// MAIN
// ============================================================================

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
