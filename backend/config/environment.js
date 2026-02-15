/**
 * ============================================================================
 * BACKWARD-COMPAT SHIM — re-exports everything from env.js
 * ============================================================================
 * All logic now lives in config/env.js (the single source of truth).
 * This file exists only so that existing `import … from './environment.js'`
 * statements continue to work without modification.
 */
export {
  config,
  isDevelopment,
  isProduction,
  isStaging,
  getCORSOrigins,
  validateEnvironment,
} from './env.js';

export { default } from './env.js';

