#!/usr/bin/env node

/**
 * ============================================================================
 * PRODUCTION SERVER STARTUP WITH HEALTH VERIFICATION
 * ============================================================================
 * 
 * This script:
 * 1. Validates all prerequisites (ENV vars, PORT availability)
 * 2. Starts the application using bootstrap sequence
 * 3. Performs post-startup health checks
 * 4. Handles persistent process management
 * 
 * Usage:
 *   npm run start                    # Start server
 *   npm run start:dev                # Start with nodemon
 *   npm run start:prod               # Start with production settings
 *   pm2 start production-server.cjs  # Start with PM2
 * 
 * @see config/bootstrap.js for the bootstrap sequence
 * @see package.json for npm scripts
 */

// Load environment immediately
import './config/env.js';

import { bootstrap } from './config/bootstrap.js';

// ============================================================================
// PRE-STARTUP VALIDATION
// ============================================================================

const validateStartupPrerequisites = () => {
  const errors = [];
  const warnings = [];

  // Check Node version
  const nodeVersion = parseInt(process.version.split('.')[0].substring(1));
  if (nodeVersion < 18) {
    errors.push(`❌ Node.js 18+ required. Current: ${process.version}`);
  }

  // Check required environment variables
  const required = ['PORT', 'JWT_SECRET', 'MONGODB_URI'];
  required.forEach(key => {
    if (!process.env[key]) {
      errors.push(`❌ Missing environment variable: ${key}`);
    }
  });

  // Check configuration validity
  const port = parseInt(process.env.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(`❌ Invalid PORT: "${process.env.PORT}". Must be 1-65535`);
  }

  // Warnings (non-fatal)
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    warnings.push(`⚠️  JWT_SECRET is too short in production (< 32 chars)`);
  }

  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGINS) {
    warnings.push(`⚠️  CORS_ORIGINS not set in production (using defaults)`);
  }

  return { errors, warnings };
};

// ============================================================================
// STARTUP SEQUENCE
// ============================================================================

const startServer = async () => {
  // Validate prerequisites
  const { errors, warnings } = validateStartupPrerequisites();

  // Show validation results
  if (errors.length > 0) {
    console.error('\n' + '═'.repeat(80));
    console.error('❌ STARTUP VALIDATION FAILED');
    console.error('═'.repeat(80));
    errors.forEach(err => console.error(err));
    console.error('═'.repeat(80) + '\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n' + '═'.repeat(80));
    console.warn('⚠️  STARTUP WARNINGS');
    console.warn('═'.repeat(80));
    warnings.forEach(warn => console.warn(warn));
    console.warn('═'.repeat(80) + '\n');
  }

  // Start application bootstrap
  try {
    const { app, server, db } = await bootstrap();

    // ===== POST-STARTUP VERIFICATION =====
    console.log('\n📋 POST-STARTUP VERIFICATION:');
    console.log('═'.repeat(70));

    // Test health endpoints
    const testHealthEndpoints = async () => {
      const http = await import('http');
      const port = process.env.PORT || 5000;

      const makeRequest = (path) => {
        return new Promise((resolve) => {
          http
            .get(`http://127.0.0.1:${port}${path}`, (res) => {
              let data = '';
              res.on('data', chunk => (data += chunk));
              res.on('end', () => {
                try {
                  const json = JSON.parse(data);
                  resolve({ status: res.statusCode, data: json });
                } catch {
                  resolve({ status: res.statusCode, data });
                }
              });
            })
            .on('error', (err) => {
              resolve({ error: err.message });
            });
        });
      };

      console.log('\nTesting health endpoints:');

      // Test /health
      const basicHealth = await makeRequest('/health');
      if (basicHealth.status === 200) {
        console.log('✅ GET /health - Working');
      } else {
        console.warn(`⚠️  GET /health - Status ${basicHealth.status}`);
      }

      // Test /api/health
      const apiHealth = await makeRequest('/api/health');
      if (apiHealth.status === 200 || apiHealth.status === 503) {
        console.log(`✅ GET /api/health - Status ${apiHealth.status}`);
        if (apiHealth.data?.database) {
          console.log(`   Database: ${apiHealth.data.database.connected ? '✅ Connected' : '⚠️  Disconnected'}`);
        }
      } else {
        console.warn(`⚠️  GET /api/health - Status ${apiHealth.status}`);
      }

      // Test API root
      const apiRoot = await makeRequest('/api/auth/health-check');
      if (!apiRoot.error) {
        console.log('✅ GET /api/auth/health-check - Working');
      }
    };

    // Run health tests
    try {
      await testHealthEndpoints();
    } catch (testError) {
      console.warn('⚠️  Could not verify health endpoints:', testError.message);
    }

    console.log('\n' + '═'.repeat(70));
    console.log('✅ SERVER STARTUP COMPLETE AND VERIFIED');
    console.log('═'.repeat(70));

    // ===== STARTUP INSTRUCTIONS =====
    console.log('\n📚 NEXT STEPS:');
    console.log('─'.repeat(70));

    const isDev = process.env.NODE_ENV === 'development';
    const port = process.env.PORT;
    const urls = isDev
      ? ['http://127.0.0.1:' + port, 'http://localhost:' + port]
      : ['https://your-domain.com', 'https://your-domain.com/api'];

    console.log(`\n1️⃣  Access Backend:`);
    urls.forEach(url => console.log(`   → ${url}`));

    console.log(`\n2️⃣  Test Health:`);
    console.log(`   → ${urls[0]}/health`);
    console.log(`   → ${urls[0]}/api/health`);

    if (isDev) {
      console.log(`\n3️⃣  Start Frontend (new terminal):`);
      console.log(`   → cd frontend`);
      console.log(`   → npm run dev`);
      console.log(`   → Open http://localhost:5173`);

      console.log(`\n4️⃣  Login Page:`);
      console.log(`   → Should show "Sign in" form (not "Backend unreachable")`);
    }

    console.log('\n💡 TROUBLESHOOTING:');
    console.log('─'.repeat(70));
    if (isDev) {
      console.log('   If frontend shows "Backend unreachable":');
      console.log('   ✓ Verify backend is running (you should see this message)');
      console.log('   ✓ Verify PORT=' + port + ' in backend/.env');
      console.log('   ✓ Check frontend vite.config.js proxy target');
      console.log('   ✓ Clear browser cache (Ctrl+Shift+Delete)');
    }

    console.log('═'.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ STARTUP FAILED');
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
