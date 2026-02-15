/**
 * ============================================================================
 * MIDDLEWARE ORCHESTRATION
 * ============================================================================
 * 
 * Centralizes all middleware setup in correct order:
 * 1. Security headers
 * 2. Body parsing
 * 3. Request logging
 * 4. Request tracking
 * 5. Static files
 */

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

export const setupMiddleware = (app, uploadsDir) => {
  // ========== SECURITY HEADERS ==========
  // Only in production
  if (process.env.NODE_ENV === 'production') {
    app.use(helmet({
      contentSecurityPolicy: false, // Disable CSP for frontend flexibility
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    }));
  }

  // ========== BODY PARSING ==========
  // Must be before routes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ========== REQUEST LOGGING ==========
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    // Production: use combined format
    app.use(morgan('combined'));
  }

  // ========== CUSTOM REQUEST TRACKING ==========
  app.use((req, res, next) => {
    // Assign unique request ID
    req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Track response for logging
    const originalJson = res.json;
    res.json = function(data) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${req.id}] ${req.method} ${req.path} -> ${res.statusCode}`);
      }
      return originalJson.call(this, data);
    };

    next();
  });

  // ========== STATIC FILES ==========
  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir, {
    etag: true,
    maxAge: 3600000 // 1 hour cache
  }));
};

export default setupMiddleware;
