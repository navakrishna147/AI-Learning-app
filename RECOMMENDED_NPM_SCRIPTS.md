# ============================================================================
# RECOMMENDED NPM SCRIPTS FOR BACK END
# ============================================================================
#
# Add these scripts to backend/package.json
# Provides consistent commands for development, testing, and deployment
#

{
  "scripts": {
    "# ============ DEVELOPMENT ============": "",
    
    "dev": "NODE_ENV=development nodemon server.js",
    "description: Run backend in development mode with auto-reload on file changes",
    
    "start": "NODE_ENV=production node server.js",
    "description: Start backend in production mode",
    
    
    "# ============ VERIFICATION ============": "",
    
    "verify": "node verify-connectivity.cjs",
    "description: Basic connectivity check",
    
    "verify:full": "node verify-connectivity.cjs --full",
    "description: Full diagnostics including detailed logs",
    
    "health-check": "curl http://127.0.0.1:5000/health && curl http://127.0.0.1:5000/api/health",
    "description: Test health endpoints",
    
    
    "# ============ TESTING ============": "",
    
    "test": "NODE_ENV=test jest --coverage",
    "description: Run unit and integration tests",
    
    "test:watch": "jest --watch",
    "description: Run tests in watch mode",
    
    
    "# ============ DATABASE ============": "",
    
    "seed": "node seed-database.js",
    "description: Populate database with sample data",
    
    "seed:clean": "node seed-database.js --clean",
    "description: Clear database and reseed",
    
    
    "# ============ PM2 PROCESS MANAGEMENT ============": "",
    
    "pm2:start": "pm2 start ecosystem.config.cjs --name backend",
    "description: Start with PM2 (auto-restart, logging, monitoring)",
    
    "pm2:restart": "pm2 restart backend",
    "description: Restart PM2 process",
    
    "pm2:stop": "pm2 stop backend",
    "description: Stop PM2 process (keeps it registered)",
    
    "pm2:delete": "pm2 delete backend",
    "description: Remove PM2 process",
    
    "pm2:logs": "pm2 logs backend",
    "description: View PM2 logs",
    
    "pm2:monit": "pm2 monit",
    "description: Monitor PM2 processes in real-time",
    
    
    "# ============ LINTING & FORMATTING ============": "",
    
    "lint": "eslint .",
    "description: Check code style issues",
    
    "lint:fix": "eslint . --fix",
    "description: Auto-fix code style issues",
    
    "format": "prettier --write .",
    "description: Format code with Prettier",
    
    
    "# ============ BUILD & DEPLOYMENT ============": "",
    
    "build": "NODE_ENV=production npm run lint && npm run test",
    "description: Build pipeline (lint + test)",
    
    "deploy:staging": "echo 'Deploy to staging server'",
    "description: Deploy to staging environment",
    
    "deploy:production": "echo 'Deploy to production server'",
    "description: Deploy to production environment"
  }
}


# ============================================================================
# RECOMMENDED NPM SCRIPTS FOR FRONTEND
# ============================================================================
#
# Add these scripts to frontend/package.json
#

{
  "scripts": {
    "# ============ DEVELOPMENT ============": "",
    
    "dev": "vite",
    "description: Start dev server with hot reload (port 5173)",
    
    "preview": "vite preview",
    "description: Preview production build locally",
    
    
    "# ============ BUILD ============": "",
    
    "build": "vite build",
    "description: Build for production (creates dist/)",
    
    "build:analyze": "vite build && analyze-dist",
    "description: Build and analyze bundle size",
    
    
    "# ============ VERIFICATION ============": "",
    
    "verify": "node ../verify-connectivity.cjs",
    "description: Check backend connectivity",
    
    
    "# ============ TESTING ============": "",
    
    "test": "vitest",
    "description: Run Vitest unit tests",
    
    "test:ui": "vitest --ui",
    "description: Run tests with interactive UI",
    
    "test:coverage": "vitest --coverage",
    "description: Generate test coverage report",
    
    
    "# ============ LINTING & FORMATTING ============": "",
    
    "lint": "eslint src/",
    "description: Check code style issues",
    
    "lint:fix": "eslint src/ --fix",
    "description: Auto-fix code style issues",
    
    "format": "prettier --write src/",
    "description: Format code with Prettier",
    
    
    "# ============ TYPE CHECKING ============": "",
    
    "type-check": "tsc --noEmit",
    "description: Check TypeScript types (if using TS)",
    
    
    "# ============ COMBINED COMMANDS ============": "",
    
    "full-build": "npm run lint && npm run test && npm run build",
    "description: Complete build pipeline",
    
    "dev:full": "concurrently 'npm run dev' 'npm:watch'",
    "description: Dev mode with file watching",
    
    "build:prod": "npm run full-build && npm run build:analyze",
    "description: Production build with analysis"
  }
}


# ============================================================================
# SCRIPTS FOR ROOT package.json (MONOREPO MANAGEMENT)
# ============================================================================
#
# Add these scripts to root package.json (if applicable)
#

{
  "scripts": {
    "# ============ START ALL SERVICES ============": "",
    
    "dev": "concurrently 'npm:dev:backend' 'npm:dev:frontend'",
    "description: Start both backend and frontend in parallel",
    
    "dev:backend": "cd backend && npm run dev",
    "description: Start backend only",
    
    "dev:frontend": "cd frontend && npm run dev",
    "description: Start frontend only",
    
    
    "# ============ VERIFICATION ============": "",
    
    "verify": "cd .. && node verify-connectivity.cjs --full",
    "description: Verify complete system connectivity",
    
    
    "# ============ BUILD ALL ============": "",
    
    "build": "concurrently 'npm:build:backend' 'npm:build:frontend'",
    "description: Build both services",
    
    "build:backend": "cd backend && npm run build",
    "description": "Build backend only",
    
    "build:frontend": "cd frontend && npm run build",
    "description: Build frontend only",
    
    
    "# ============ TESTING ============": "",
    
    "test": "concurrently 'npm:test:backend' 'npm:test:frontend'",
    "description: Run all tests",
    
    "test:backend": "cd backend && npm test",
    "description: Run backend tests only",
    
    "test:frontend": "cd frontend && npm test",
    "description: Run frontend tests only",
    
    
    "# ============ LINTING ============": "",
    
    "lint": "concurrently 'npm:lint:backend' 'npm:lint:frontend'",
    "description: Lint both backend and frontend",
    
    "lint:fix": "concurrently 'npm:lint:fix:backend' 'npm:lint:fix:frontend'",
    "description": "Auto-fix linting issues in both",
    
    "lint:backend": "cd backend && npm run lint",
    "description": "Lint backend only",
    
    "lint:frontend": "cd frontend && npm run lint",
    "description": "Lint frontend only",
    
    "lint:fix:backend": "cd backend && npm run lint:fix",
    "description": "Fix backend linting",
    
    "lint:fix:frontend": "cd frontend && npm run lint:fix",
    "description": "Fix frontend linting"
  }
}


# ============================================================================
# FULL WORKFLOW EXAMPLE
# ============================================================================
#
# Complete development workflow:
#

# 1. Initial setup
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Verify everything is ready
npm run verify

# 3. Start development
npm run dev

# 4. Run tests
npm run test

# 5. Build for production
npm run build

# 6. Monitor with PM2
npm run pm2:start
npm run pm2:logs
npm run pm2:monit

# 7. Deploy
npm run deploy:production
