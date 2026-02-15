/**
 * ============================================================================
 * ERROR HANDLING ORCHESTRATION
 * ============================================================================
 * 
 * Global error handling middleware (must be registered LAST after all routes).
 * Catches and formats:
 * - Validation errors
 * - Authentication errors
 * - Database errors
 * - File upload errors
 * - External service errors
 * - Unhandled/generic errors
 * 
 * All errors are logged with unique ID for tracking.
 */

export const setupErrorHandling = (app) => {
  
  // ========== VALIDATION ERROR HANDLER ==========
  app.use((err, req, res, next) => {
    if (err.name === 'ValidationError' || err.status === 400) {
      const errorId = generateErrorId();
      logError(errorId, req, err);
      
      return res.status(400).json({
        error: 'Validation Error',
        message: err.message,
        details: err.details,
        requestId: req.id,
        errorId: errorId,
        timestamp: new Date().toISOString()
      });
    }
    next(err);
  });

  // ========== AUTHENTICATION ERROR HANDLER ==========
  app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError' || err.status === 401 || err.message === 'No token provided') {
      const errorId = generateErrorId();
      logError(errorId, req, err);
      
      return res.status(401).json({
        error: 'Unauthorized',
        message: err.message || 'Authentication required',
        requestId: req.id,
        errorId: errorId,
        timestamp: new Date().toISOString()
      });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      const errorId = generateErrorId();
      logError(errorId, req, err);
      
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'The provided token is invalid or expired',
        requestId: req.id,
        errorId: errorId,
        timestamp: new Date().toISOString()
      });
    }

    if (err.name === 'TokenExpiredError') {
      const errorId = generateErrorId();
      logError(errorId, req, err);
      
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Your authentication token has expired. Please login again.',
        expiredAt: err.expiredAt,
        requestId: req.id,
        errorId: errorId,
        timestamp: new Date().toISOString()
      });
    }

    next(err);
  });

  // ========== DATABASE ERROR HANDLER ==========
  app.use((err, req, res, next) => {
    if (err.name === 'MongoError' || 
        err.name === 'MongoServerError' || 
        err.name === 'MongoNetworkError' ||
        err.name === 'MongoParseError') {
      
      const errorId = generateErrorId();
      logError(errorId, req, err);
      
      console.error(`[${errorId}] Database Error:`, err.message);
      
      return res.status(503).json({
        error: 'Database Error',
        message: 'A database error occurred. Please try again later.',
        requestId: req.id,
        errorId: errorId,
        timestamp: new Date().toISOString()
      });
    }

    next(err);
  });

  // ========== FILE UPLOAD ERROR HANDLER ==========
  app.use((err, req, res, next) => {
    if (err.message?.includes('File too large') || err.code === 'LIMIT_FILE_SIZE') {
      const errorId = generateErrorId();
      logError(errorId, req, err);
      
      return res.status(413).json({
        error: 'File Too Large',
        message: 'The uploaded file exceeds the maximum size limit (10MB)',
        requestId: req.id,
        errorId: errorId,
        timestamp: new Date().toISOString()
      });
    }

    if (err.message?.includes('Unexpected file') || err.code === 'LIMIT_UNEXPECTED_FILE') {
      const errorId = generateErrorId();
      logError(errorId, req, err);
      
      return res.status(400).json({
        error: 'Invalid File',
        message: 'The file type is not allowed. Only PDF files are supported.',
        requestId: req.id,
        errorId: errorId,
        timestamp: new Date().toISOString()
      });
    }

    next(err);
  });

  // ========== EXTERNAL SERVICE ERROR HANDLER ==========
  app.use((err, req, res, next) => {
    // Groq API errors
    if (err.message?.includes('Groq') || err.code?.includes('GROQ')) {
      const errorId = generateErrorId();
      logError(errorId, req, err);
      console.error(`[${errorId}] Groq API Error:`, err.message);
      
      return res.status(503).json({
        error: 'AI Service Unavailable',
        message: 'The AI service is temporarily unavailable. Please try again later.',
        requestId: req.id,
        errorId: errorId,
        timestamp: new Date().toISOString()
      });
    }

    // Network errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
      const errorId = generateErrorId();
      logError(errorId, req, err);
      console.error(`[${errorId}] Network Error:`, err.message);
      
      return res.status(503).json({
        error: 'Service Connection Error',
        message: 'Unable to reach required service. Please try again later.',
        requestId: req.id,
        errorId: errorId,
        timestamp: new Date().toISOString()
      });
    }

    next(err);
  });

  // ========== GLOBAL ERROR HANDLER ==========
  // Must be last - catches all unhandled errors
  app.use((err, req, res, next) => {
    const errorId = generateErrorId();
    logError(errorId, req, err);

    // Determine status code
    const statusCode = err.status || err.statusCode || 500;

    // Build error response
    const errorResponse = {
      error: err.name || 'Internal Server Error',
      message: err.message || 'An unexpected error occurred',
      requestId: req.id,
      errorId: errorId,
      timestamp: new Date().toISOString()
    };

    // Include stack trace in development only
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
      errorResponse.details = err;
    }

    res.status(statusCode).json(errorResponse);
  });
};

/**
 * Generate unique error ID for tracking
 */
function generateErrorId() {
  return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase();
}

/**
 * Log error details with context
 */
function logError(errorId, req, err) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  console.error(`\n${'═'.repeat(80)}`);
  console.error(`❌ [${errorId}] ERROR OCCURRED`);
  console.error('═'.repeat(80));
  console.error(`Timestamp: ${new Date().toISOString()}`);
  console.error(`Request: ${req.method} ${req.path}`);
  console.error(`Error Name: ${err.name || 'Unknown'}`);
  console.error(`Message: ${err.message}`);
  console.error(`Status: ${err.status || 500}`);
  
  if (isDevelopment) {
    console.error(`\nStack Trace:\n${err.stack}`);
  }
  
  console.error('═'.repeat(80) + '\n');
}

export default setupErrorHandling;
