#!/usr/bin/env node

/**
 * ============================================================================
 * LMSAI - BACKEND ENTRY POINT
 * ============================================================================
 * 
 * Production-grade entry point with:
 * - Process event handlers for unhandled rejections/exceptions
 * - Bootstrap orchestration for safe startup
 * - Graceful shutdown handlers
 * 
 * @see config/bootstrap.js for the complete startup sequence
 */

// Load environment variables BEFORE any other module reads process.env
import './config/env.js';
import { bootstrap } from './config/bootstrap.js';

// ============================================================================
// PROCESS EVENT HANDLERS (BEFORE BOOTSTRAP)
// ============================================================================

/**
 * Handle unhandled promise rejections
 * These occur when a Promise is rejected but no .catch() handler exists
 */
process.on('unhandledRejection', (reason, promise) => {
  const timestamp = new Date().toISOString();
  const errorId = `UNHANDLED_${Date.now()}`;
  
  console.error('\n' + '═'.repeat(80));
  console.error('⚠️  UNHANDLED PROMISE REJECTION');
  console.error('═'.repeat(80));
  console.error(`[${timestamp}] ID: ${errorId}`);
  console.error(`Promise:`, promise);
  console.error(`Reason:`, reason);
  
  if (reason instanceof Error) {
    console.error(`Stack:\n${reason.stack}`);
  }
  
  console.error('═'.repeat(80) + '\n');
  
  // Log to file in production
  if (process.env.NODE_ENV === 'production') {
    console.error(`[PROD] Unhandled rejection logged: ${errorId}`);
  }
  
  // Don't exit - allow app to continue but be aware of the issue
  // The calling code should handle promise errors properly
});

/**
 * Handle uncaught exceptions
 * These are synchronous errors that weren't caught
 */
process.on('uncaughtException', (error, origin) => {
  const timestamp = new Date().toISOString();
  const errorId = `UNCAUGHT_${Date.now()}`;
  
  console.error('\n' + '═'.repeat(80));
  console.error('🔴 UNCAUGHT EXCEPTION - CRITICAL');
  console.error('═'.repeat(80));
  console.error(`[${timestamp}] ID: ${errorId}`);
  console.error(`Origin: ${origin}`);
  console.error(`Error: ${error.message}`);
  console.error(`Stack:\n${error.stack}`);
  console.error('═'.repeat(80) + '\n');
  
  // Exit process for uncaught exceptions (critical errors)
  // This allows process manager (PM2, nodemon, systemd) to restart
  console.error('💤 Exiting process to prevent unstable state...\n');
  process.exit(1);
});

/**
 * Handle warnings
 */
process.on('warning', (warning) => {
  console.warn(`⚠️  Node.js Warning: ${warning.name}`);
  console.warn(`   Message: ${warning.message}`);
  if (warning.stack) console.warn(`   Stack: ${warning.stack}`);
});

/**
 * Handle exit events
 */
process.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Process exited normally');
  } else {
    console.error(`❌ Process exited with code: ${code}`);
  }
});

// ============================================================================
// START APPLICATION
// ============================================================================

/**
 * Bootstrap the application with comprehensive error handling
 */
(async () => {
  let server = null;
  
  try {
    const bootstrapResult = await bootstrap();
    server = bootstrapResult.server;
    
    // Signal that we're ready
    if (process.send) {
      process.send('ready');
    }
    
  } catch (error) {
    console.error('\n' + '═'.repeat(80));
    console.error('🚫 FATAL BOOTSTRAP ERROR');
    console.error('═'.repeat(80));
    console.error(`Error: ${error.message}`);
    console.error(`Stack:\n${error.stack}`);
    console.error('═'.repeat(80) + '\n');
    
    // Exit with error code
    process.exit(1);
  }
})();

// SIGTERM / SIGINT are handled by bootstrap.js graceful shutdown
// (which closes HTTP server + mongoose before exiting)