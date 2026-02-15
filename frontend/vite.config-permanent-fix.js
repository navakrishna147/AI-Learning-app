import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * ============================================================================
 * VITE CONFIGURATION - PERMANENT FIX FOR FRONTEND CONNECTIVITY
 * ============================================================================
 * 
 * Key features:
 * ✅ Properly configured proxy for /api → backend
 * ✅ Error detection for ECONNREFUSED
 * ✅ Supports development and production
 * ✅ HMR configuration for hot reload
 * ✅ Detailed logging for debugging
 */

export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  // Backend configuration
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5000'
  const isDev = command === 'serve'

  return {
    plugins: [react()],
    
    // ========== DEVELOPMENT SERVER ==========
    server: {
      // Port for Vite dev server
      port: 5173,
      host: '0.0.0.0',
      strictPort: false, // Use next port if 5173 is busy
      
      // ========== HOT MODULE REPLACEMENT ==========
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
      },

      // ========== PROXY CONFIGURATION - CRITICAL FOR CONNECTIVITY ==========
      proxy: {
        // All requests to /api/* are forwarded to the backend
        '/api': {
          // ⚠️  CRITICAL: Must match backend PORT in .env
          // Backend server must be running on this address
          target: backendUrl,
          
          // changeOrigin: true means the Host header is changed to match target
          // Required for proper CORS handling
          changeOrigin: true,
          
          // secure: false allows HTTP in development
          // In production with HTTPS, set to true
          secure: false,
          
          // Support WebSocket connections
          ws: true,
          
          // Don't rewrite the path (keep /api/auth/login as-is)
          rewrite: (path) => path,

          // Error and event handlers
          configure: (proxy, _options) => {
            // Log proxy errors with helpful diagnostics
            proxy.on('error', (err, _req, _res) => {
              const code = err.code || 'unknown'
              const message = err.message || ''
              
              console.error('\n' + '═'.repeat(80))
              console.error('🔴 VITE PROXY ERROR - BACKEND CONNECTION FAILED')
              console.error('═'.repeat(80))
              console.error(`Error Code: ${code}`)
              console.error(`Message: ${message}`)
              console.error(`Target: ${backendUrl}`)
              console.error('')
              
              if (code === 'ECONNREFUSED') {
                console.error('❌ PROBLEM: Cannot connect to backend')
                console.error('')
                console.error('🔍 DIAGNOSIS:')
                console.error('   The backend server is NOT running on ' + backendUrl)
                console.error('')
                console.error('✅ SOLUTION:')
                console.error('   1. Open a NEW terminal')
                console.error('   2. Navigate to backend directory: cd backend')
                console.error('   3. Start the server: npm run dev')
                console.error('   4. Wait for startup message: "✅ SERVER STARTED SUCCESSFULLY"')
                console.error('   5. Verify: curl http://localhost:5000/health')
                console.error('   6. Return to browser and REFRESH (F5)')
                console.error('')
                console.error('📋 Checklist:')
                console.error('   ✅ Backend PORT in .env is 5000')
                console.error('   ✅ MongoDB is running (mongosh should connect)')
                console.error('   ✅ No other process on port 5000 (netstat -ano | findstr :5000)')
                console.error('   ✅ Firewall allows port 5000')
              } else if (code === 'ENOTFOUND' || code === 'EHOSTUNREACH') {
                console.error('❌ PROBLEM: Cannot reach backend host')
                console.error('   Make sure backend URL is correct: ' + backendUrl)
              } else if (code === 'ETIMEDOUT') {
                console.error('❌ PROBLEM: Connection timeout')
                console.error('   Backend is slow or not responding')
                console.error('   Check MongoDB connection')
              }
              
              console.error('═'.repeat(80) + '\n')
            })

            // Log successful proxied requests
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              if (process.env.VITE_DEBUG_PROXY === 'true') {
                console.log(`📤 Proxy: ${req.method} ${req.url} → ${backendUrl}${req.url}`)
              }
            })

            // Log proxied responses
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              if (process.env.VITE_DEBUG_PROXY === 'true') {
                const status = proxyRes.statusCode >= 400 ? '❌' : '✅'
                console.log(`${status} Response: ${proxyRes.statusCode} ${req.url}`)
              }
            })
          }
        }
      },

      // ========== FILE WATCHING ==========
      watch: {
        usePolling: false,
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      },

      // ========== MIDDLEWARE MODE ==========
      middlewareMode: false,

      // ========== CORS & HEADERS ==========
      cors: true,

      // ========== FILE SERVING ==========
      fs: {
        strict: false,
      }
    },

    // ========== BUILD CONFIGURATION ==========
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      outDir: 'dist',
      assetsDir: 'assets',
      // Code splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'api': ['axios'],
          }
        }
      }
    },

    // ========== ENVIRONMENT VARIABLES ==========
    define: {
      'process.env': {}
    }
  }
})
