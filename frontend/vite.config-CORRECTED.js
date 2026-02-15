import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

  return {
    plugins: [react()],
    
    server: {
      // ========== PORT CONFIGURATION ==========
      // Port must match what frontend expects - set to 5173 exactly
      port: 5173,
      host: '0.0.0.0',
      strictPort: true, // ✅ FIX: Fail if port is in use (instead of auto-picking)

      // ========== HMR (Hot Module Replacement) ==========
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173
      },

      // ========== PROXY CONFIGURATION ==========
      // ✅ FIX: Proxy /api to backend on port 5000
      proxy: {
        '/api': {
          target: backendUrl, // Must match backend PORT in .env (usually 5000)
          changeOrigin: true,
          secure: false, // Allow HTTP in development
          ws: true, // WebSocket support

          // Log proxy errors with detailed diagnostics
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.error('\n' + '═'.repeat(60));
              console.error('🔴 PROXY ERROR - BACKEND UNREACHABLE!');
              console.error('═'.repeat(60));
              console.error('Error Code:', err.code);
              console.error('Message:', err.message);
              console.error('Target:', backendUrl);
              console.error('═'.repeat(60));

              if (err.code === 'ECONNREFUSED') {
                console.error('\n❌ SOLUTION: Backend is not running!');
                console.error('\n📋 Steps to fix:');
                console.error('   1. Open a NEW terminal');
                console.error('   2. cd backend');
                console.error('   3. npm run dev');
                console.error('   4. Wait for "Server started on port 5000"');
                console.error('   5. Refresh browser (F5 or Ctrl+R)\n');
                console.error('Verify: http://localhost:5000/health\n');
              }
            });

            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(`📤 ${req.method.toUpperCase()} ${req.url}`);
            });

            proxy.on('proxyRes', (proxyRes, req, _res) => {
              const icon = proxyRes.statusCode >= 400 ? '❌' : '✅';
              console.log(`${icon} ${proxyRes.statusCode} ${req.url}`);
            });
          }
        }
      },

      // ========== FILE WATCHING ==========
      watch: {
        usePolling: false,
        ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**']
      },

      // ========== CORS & HEADERS ==========
      cors: true
    },

    // ========== BUILD CONFIGURATION ==========
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: false,
      outDir: 'dist',
      assetsDir: 'assets',
      chunkSizeWarningLimit: 1000
    },

    // ========== ENVIRONMENT VARIABLES ==========
    define: {
      'process.env': {}
    }
  };
});
