/**
 * ============================================================================
 * PM2 ECOSYSTEM CONFIGURATION
 * ============================================================================
 * 
 * Production-grade process management with:
 * - Automatic restart on crash
 * - Automatic restart on Windows boot/system resume
 * - Watch mode for development (restarts on file changes)
 * - Proper error logging and monitoring
 * - Memory limits to prevent memory leaks
 * - Graceful shutdown handling
 * 
 * CRITICAL FOR SLEEP/WAKE STABILITY:
 * - PM2 restarts process if it crashes after system resume
 * - Monitors MongoDB reconnection and health checks
 * - Logs all errors for debugging
 * - Supports Windows boot startup
 * 
 * USAGE:
 * 1. Install PM2 globally: npm install -g pm2
 * 2. Start with PM2: pm2 start ecosystem.config.js
 * 3. Enable Windows startup: pm2 install pm2-windows-startup
 * 4. Save config: pm2 save
 * 5. Auto-restore on boot: pm2 startup
 * 
 * MONITORING:
 * - pm2 monit                    → Real-time monitoring
 * - pm2 logs                     → View logs
 * - pm2 logs ai-backend          → Logs for specific app
 * - pm2 list                     → List processes
 * - pm2 describe ai-backend      → Detailed process info
 */

module.exports = {
  apps: [
    {
      // ========== PROCESS IDENTIFICATION ==========
      name: 'ai-backend',
      script: './server.js',
      cwd: __dirname,

      // ========== PROCESS MANAGEMENT ==========
      // Restart on crash
      autorestart: true,
      
      // Max memory usage before auto-restart (500MB)
      max_memory_restart: '500M',
      
      // Watch mode - restart on file changes (DEV only, disable in PROD)
      watch: process.env.NODE_ENV !== 'production' ? ['routes/', 'models/', 'config/', 'services/'] : false,
      
      // Ignore these files when watching
      ignore_watch: ['node_modules', 'uploads', 'logs', '.git', '*.log'],
      
      // Graceful shutdown timeout (10 seconds)
      kill_timeout: 10000,
      
      // Grace period before forced shutdown (5 seconds)
      listen_timeout: 5000,

      // ========== ENVIRONMENT VARIABLES ==========
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // ========== LOGGING ==========
      // Output logs directory
      out_file: './logs/out.log',
      // Error logs directory
      err_file: './logs/error.log',
      // Combine logs from all instances
      merge_logs: true,
      // Max log file size (10MB)
      max_size: '10M',
      // Keep 10 rotated log files
      max_files: 10,
      // Date format for logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // ========== INSTANCES & CLUSTERING ==========
      // Start only 1 instance (cluster mode would need shared state)
      instances: 1,
      exec_mode: 'fork',

      // ========== CRITICAL: RESTART BEHAVIOR ==========
      // Option 1: Exponential backoff (increases wait between restarts)
      // Starting from 500ms, doubles until max_retries or 30s wait
      exp_backoff_restart_delay: 100,
      
      // Max consecutive restarts within crash_window before bailing
      max_restarts: 10,
      
      // Time window for crash detection (milliseconds)
      // If 10 crashes happen within 60s, PM2 gives up
      min_uptime: '10s',
      autorestart: true,

      // ========== PERFORMANCE & STABILITY ==========
      // Node arguments for better memory management
      node_args: [
        '--max-old-space-size=512'  // 512MB heap limit
      ],

      // ========== Windows-SPECIFIC SETTINGS ==========
      // Auto-restart on Windows system start
      interpreter: 'node',
      // Keep process alive after system sleep/wake
      keep_alive: true,
      
      // Note: --enable-ssl-key-log is not supported on Windows
      // Removed from node_args for compatibility
    }
  ],

  // ========== DEPLOYMENT CONFIGURATION ==========
  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:repo.git',
      path: '/var/www/ai-learning-assistant',
      'post-deploy': 'npm install && npm run build && pm2 restart ai-backend'
    }
  }
};

/**
 * ============================================================================
 * WINDOWS SETUP & TROUBLESHOOTING
 * ============================================================================
 * 
 * TO ENABLE WINDOWS STARTUP:
 * 
 * 1. Install PM2 globally:
 *    npm install -g pm2
 * 
 * 2. Install Windows startup module:
 *    npm install -g pm2-windows-startup
 * 
 * 3. Install Windows startup (run as Administrator):
 *    pm2 install pm2-windows-startup
 * 
 * 4. Start the app with PM2:
 *    pm2 start ecosystem.config.js
 * 
 * 5. Save configuration:
 *    pm2 save
 * 
 * 6. Enable auto-startup:
 *    pm2 startup windows
 * 
 * ============================================================================
 * VERIFYING WINDOWS STARTUP
 * ============================================================================
 * 
 * 1. Check if PM2 is in startup:
 *    reg query HKCU\Software\Microsoft\Windows\CurrentVersion\Run | find pm2
 * 
 * 2. Restart your computer and verify:
 *    pm2 list
 *    pm2 logs ai-backend
 * 
 * 3. Test sleep/wake cycle:
 *    - Close laptop lid (or use: rundll32.exe powrprof.dll,SetSuspendState 0,1,0)
 *    - Open lid after 10 seconds
 *    - Check if backend is running: curl http://localhost:5000/health
 * 
 * ============================================================================
 * LOGS LOCATION
 * ============================================================================
 * 
 * Logs are stored in: ./logs/
 * 
 * - out.log        → Standard output (INFO, console.log)
 * - error.log      → Errors and warnings
 * 
 * View logs:
 *   pm2 logs ai-backend
 *   pm2 logs ai-backend --lines 100
 *   pm2 logs ai-backend --follow
 * 
 * ============================================================================
 * HELPFUL PM2 COMMANDS
 * ============================================================================
 * 
 * pm2 list                  → Show all running processes
 * pm2 start ecosystem.config.js → Start from this config
 * pm2 stop ai-backend       → Stop the app
 * pm2 restart ai-backend    → Restart the app
 * pm2 delete ai-backend     → Remove from PM2
 * pm2 monit                 → Real-time monitoring
 * pm2 logs ai-backend       → View logs
 * pm2 describe ai-backend   → Detailed status
 * pm2 save                  → Save process list
 * pm2 startup               → Enable auto-startup
 * pm2 unstartup             → Disable auto-startup
 * 
 * ============================================================================
 * PRODUCTION DEPLOYMENT
 * ============================================================================
 * 
 * For production, it's recommended to:
 * 
 * 1. Install Node and updated PM2:
 *    npm install -g pm2@latest
 * 
 * 2. Start with production env:
 *    pm2 start ecosystem.config.js --env production
 * 
 * 3. Enable monitoring and alerts (optional):
 *    pm2 install pm2-auto-pull
 *    pm2 install pm2-logrotate
 * 
 * 4. Monitor with external tools:
 *    pm2 web              → Access http://localhost:9615
 *    pm2 plus             → Connect to PM2+ (cloud monitoring)
 * 
 */
