/**
 * ============================================================================
 * ROUTE ORCHESTRATION
 * ============================================================================
 *
 * Registration order:
 *   1. GET /          — root alive check
 *   2. GET /health    — ultra-lightweight (always 200 if process is up)
 *   3. GET /api/health — includes DB ping (200 or 503)
 *   4. GET /api/health/detailed — full diagnostics
 *   5. Feature API routes
 *   6. 404 fallback (must be last)
 */

import { checkDBHealth } from './db.js';
import { checkHealthStatus } from '../services/healthService.js';
import authRoutes from '../routes/auth.js';
import documentRoutes from '../routes/documents.js';
import chatRoutes from '../routes/chat.js';
import flashcardRoutes from '../routes/flashcards.js';
import quizRoutes from '../routes/quizzes.js';
import dashboardRoutes from '../routes/dashboard.js';
import userRoutes from '../routes/userRoutes.js';

export const setupRoutes = (app) => {

  // ── Root ──────────────────────────────────────────────────────────────────
  app.get('/', (_req, res) => {
    res.json({
      message: 'API is running',
      service: 'AI Learning Assistant',
      timestamp: new Date().toISOString(),
    });
  });

  // ── /health — stable contract (always 200) ───────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // ── /api/health — includes DB status ──────────────────────────────────────
  app.get('/api/health', async (_req, res) => {
    try {
      const db = await checkDBHealth();
      const ok = db.connected;
      res.status(ok ? 200 : 503).json({
        status: ok ? 'ok' : 'degraded',
        uptime: Math.floor(process.uptime()),
        database: { connected: db.connected, state: db.state },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(503).json({
        status: 'error',
        message: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ── /api/health/detailed — full diagnostics ───────────────────────────────
  app.get('/api/health/detailed', async (_req, res) => {
    try {
      const detail = await checkHealthStatus();
      const code = detail.status === 'healthy' ? 200 : 503;
      res.status(code).json(detail);
    } catch (err) {
      res.status(503).json({ status: 'error', message: err.message });
    }
  });

  // ========== API ROUTES ==========
  // Each has '/api' prefix
  app.use('/api/auth', authRoutes);
  app.use('/api/documents', documentRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/flashcards', flashcardRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', userRoutes);

  // ========== 404 NOT FOUND ==========
  // Must be last so all other routes are checked first
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${req.path} does not exist`,
      path: req.path,
      method: req.method,
      availableRoutes: [
        'GET /',
        'GET /health',
        'GET /api/health',
        'GET /api/health/detailed',
        'POST /api/auth/login',
        'POST /api/auth/register',
        'GET /api/documents',
        'GET /api/chat',
        'GET /api/flashcards',
        'GET /api/quizzes',
        'GET /api/dashboard',
        'GET /api/users'
      ],
      timestamp: new Date().toISOString()
    });
  });
};

export default setupRoutes;
