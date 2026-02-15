// Load environment variables BEFORE any other module reads process.env
import './config/env.js';

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose'; // ✅ FIX: Import at top, not require()

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// STEP 1: ENVIRONMENT VALIDATION (STARTUP BLOCKING)
// ============================================================================
const validateEnvironment = () => {
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.error('\n❌ CRITICAL: Missing required environment variables:');
    missingEnvVars.forEach(envVar => {
      console.error(`   - ${envVar}`);
    });
    console.error('\n📝 Please create backend/.env with:');
    console.error('   PORT=5000');
    console.error('   MONGODB_URI=mongodb://localhost:27017/lmsproject');
    console.error('   JWT_SECRET=your-secret-key-minimum-32-characters');
    console.error('   GROQ_API_KEY=your-groq-api-key\n');
    process.exit(1);
  }

  // Validate PORT is a number
  const port = parseInt(process.env.PORT);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error(`\n❌ CRITICAL: Invalid PORT value: "${process.env.PORT}"`);
    console.error('   PORT must be a number between 1 and 65535\n');
    process.exit(1);
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET.length < 32) {
    console.warn('\n⚠️  WARNING: JWT_SECRET is too short (less than 32 characters)');
    console.warn('   For production, use a longer secret key\n');
  }

  console.log('\n✅ Environment variables validated successfully');
};

// Validate before doing anything else
validateEnvironment();

// ============================================================================
// STEP 2: AI SERVICE VALIDATION (GROQ ONLY)
// ============================================================================
const validateAIService = () => {
  // ✅ FIX: Only check GROQ_API_KEY, remove Gemini/Anthropic checks
  const hasGroq = process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.length > 5;

  if (!hasGroq) {
    console.warn('\n⚠️  WARNING: GROQ_API_KEY not configured');
    console.warn('   AI features (Chat, Summary, Flashcards) will be disabled');
    console.warn('   To enable: Add GROQ_API_KEY=gsk_... to backend/.env\n');
  } else {
    console.log('✅ Groq AI Service: Ready (llama-3.1-8b-instant)');
  }
};

// ============================================================================
// EXPRESS APP INITIALIZATION
// ============================================================================
const app = express();
const PORT = parseInt(process.env.PORT);

// ✅ FIX: CORS from environment variable to support any deployment
const configureCORS = () => {
  const corsOriginString = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174';
  const corsOrigins = corsOriginString
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);

  console.log('✅ CORS Origins configured:', corsOrigins);

  return cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count', 'Content-Length'],
    maxAge: 3600, // 1 hour
    optionsSuccessStatus: 200
  });
};

// ✅ APPLY CORS MIDDLEWARE (MUST be before routes)
app.use(configureCORS());

// Import routes
import authRoutes from './routes/auth.js';
import documentRoutes from './routes/documents.js';
import chatRoutes from './routes/chat.js';
import flashcardRoutes from './routes/flashcards.js';
import quizRoutes from './routes/quizzes.js';
import dashboardRoutes from './routes/dashboard.js';

// Ensure uploads directory exists before serving static files
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created');
  }
} catch (error) {
  console.error('❌ Error creating uploads directory:', error.message);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static(uploadsDir));

// Request logging
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    const method = req.method.padEnd(6);
    const url = req.path;
    const auth = req.headers.authorization ? '✅' : '❌';
    console.log(`[${timestamp}] ${auth} ${method} ${url}`);
  }
  next();
});

// ============================================================================
// STEP 3: ROUTES (After middleware, before error handlers)
// ============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ============================================================================
// STEP 4: HEALTH CHECK ENDPOINTS
// ============================================================================
// ✅ FIX: Use imported mongoose, not require()
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    services: {
      express: 'running',
      database: dbConnected ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      groq: process.env.GROQ_API_KEY ? 'configured' : 'not_configured'
    }
  });
});

app.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  const status = dbConnected ? 200 : 503;

  res.status(status).json({
    status: dbConnected ? 'ok' : 'degraded',
    message: 'AI Learning Assistant API',
    database: dbConnected ? 'connected' : 'disconnected',
    groq: process.env.GROQ_API_KEY ? true : false
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'AI Learning Assistant API is running!' });
});

// ============================================================================
// STEP 5: ERROR HANDLERS (MUST be last)
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;

  console.error(`\n${'═'.repeat(60)}`);
  console.error(`❌ ERROR [${errorId}]`);
  console.error(`Method: ${req.method} ${req.path}`);
  console.error(`Message: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(`Stack:\n${err.stack}`);
  }
  console.error(`${'═'.repeat(60)}\n`);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    errorId: errorId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================================================
// STEP 6: SERVER STARTUP WITH DATABASE BLOCKING
// ============================================================================
// ✅ FIX: Wait for DB connection BEFORE app.listen()

const startServer = async () => {
  try {
    console.log('\n🔄 Starting server initialization...\n');

    // Step 1: Validate AI Service
    validateAIService();

    // Step 2: Connect to MongoDB - MUST COMPLETE before listening
    console.log('\n🔌 Connecting to MongoDB...');
    const db = await connectDB();

    // In production, fail if DB not connected
    const isProd = process.env.NODE_ENV === 'production';
    if (!db && isProd) {
      console.error('\n❌ CRITICAL: Database connection failed in production mode');
      console.error('   The server CANNOT run without a database in production.');
      console.error('   Fix MongoDB connection and try again.\n');
      process.exit(1);
    } else if (!db) {
      console.warn('\n⚠️  Database connection failed (development mode)');
      console.warn('   Server continuing in development mode without database\n');
    } else {
      console.log('✅ MongoDB connected successfully\n');
    }

    // Step 3: Start HTTP server
    console.log(`\n🚀 Starting Express server on port ${PORT}...\n`);

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`✅ SERVER STARTED SUCCESSFULLY`);
      console.log(`${'═'.repeat(60)}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🔌 Port: ${PORT}`);
      console.log(`🌍 Node Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: ${db ? '✅ Connected' : '⚠️  Not connected'}`);
      console.log(`🤖 AI Service: ${process.env.GROQ_API_KEY ? '✅ Groq' : '❌ Not configured'}`);
      console.log(`${'═'.repeat(60)}\n`);
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ FATAL: Port ${PORT} is already in use`);
        console.error('\n📋 Solutions:');
        console.error(`   1. Kill process using port ${PORT}:`);
        console.error(`      lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`);
        console.error(`   2. Or change PORT in backend/.env`);
        console.error(`   3. Restart both backend and frontend\n`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n📴 ${signal} received: shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown (timeout)');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled rejection:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught exception:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('\n❌ CRITICAL: Failed to start server');
    console.error('Error:', error.message);
    console.error('\nDebugging steps:');
    console.error('1. Verify backend/.env has all required variables');
    console.error('2. Ensure MongoDB is running: mongosh or mongo');
    console.error('3. Check MONGODB_URI format is correct');
    console.error('4. Verify PORT is not in use\n');
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
