/**
 * ============================================================================
 * HEALTH SERVICE
 * ============================================================================
 *
 * Centralised health-check logic consumed by /health and /api/health routes.
 * Returns a stable JSON contract that load-balancers and the frontend can rely on.
 */

import mongoose from 'mongoose';
import os from 'os';

/**
 * Full health status object.
 */
export const checkHealthStatus = async () => {
  const start = Date.now();

  // -- Database --
  const dbState = mongoose.connection.readyState;
  const states  = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  let dbResponsive = false;

  if (dbState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      dbResponsive = true;
    } catch { /* ping failed */ }
  }

  const database = {
    connected: dbState === 1 && dbResponsive,
    state: states[dbState] || 'unknown',
    responsive: dbResponsive,
    host: mongoose.connection.host || 'n/a',
    name: mongoose.connection.name || 'n/a',
  };

  // -- Server --
  const mem = process.memoryUsage();
  const server = {
    uptime: Math.floor(process.uptime()),
    memory: {
      rssMB:      (mem.rss       / 1048576).toFixed(1),
      heapUsedMB: (mem.heapUsed  / 1048576).toFixed(1),
      heapTotalMB:(mem.heapTotal / 1048576).toFixed(1),
    },
    cpus: os.cpus().length,
    platform: process.platform,
    nodeVersion: process.version,
  };

  // -- AI --
  const ai = {
    configured: !!process.env.GROQ_API_KEY,
  };

  // -- Overall --
  const isHealthy  = database.connected;
  const isDegraded = database.connected && !dbResponsive;
  const status = isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy';

  return {
    status,
    database,
    server,
    ai,
    timestamp: new Date().toISOString(),
    checkDuration: Date.now() - start + 'ms',
  };
};

export const isHealthy = async () => {
  try {
    const s = await checkHealthStatus();
    return s.status === 'healthy' || s.status === 'degraded';
  } catch { return false; }
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export default { checkHealthStatus, isHealthy, isDatabaseConnected };
