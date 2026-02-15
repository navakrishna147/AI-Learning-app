import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE - PRODUCTION GRADE
 * ============================================================================
 * 
 * protect: Verify JWT token and enforce authentication
 * optionalAuth: Attach user if token valid, allow if missing (for public routes)
 */

// ✅ FIX: Require JWT_SECRET, don't allow fallback default
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }
  if (secret.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET is too short for production security');
  }
  return secret;
};

/**
 * PROTECT ROUTE MIDDLEWARE
 * 
 * Enforces JWT authentication on protected routes
 * Returns 401 if token missing, invalid, or expired
 * 
 * Usage:
 *   router.post('/secure-endpoint', protect, controllerFunction);
 */
export const protect = async (req, res, next) => {
  try {
    // ===== STEP 1: Get authorization header =====
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header - token required',
        code: 'NO_AUTH_HEADER'
      });
    }

    // ===== STEP 2: Verify Bearer format =====
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>',
        code: 'INVALID_BEARER_FORMAT'
      });
    }

    // ===== STEP 3: Extract token =====
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is missing from authorization header',
        code: 'MISSING_TOKEN'
      });
    }

    // ===== STEP 4: Verify token signature =====
    let decoded;
    try {
      const secret = getJWTSecret();
      decoded = jwt.verify(token, secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED',
          expiredAt: error.expiredAt
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token signature',
          code: 'INVALID_TOKEN'
        });
      }
      throw error;
    }

    // ===== STEP 5: Find user =====
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found - token may be stale',
        code: 'USER_NOT_FOUND'
      });
    }

    // ===== STEP 6: Check user is active =====
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive',
        code: 'USER_INACTIVE'
      });
    }

    // ===== STEP 7: Attach user to request =====
    req.user = user;
    req.userId = user._id;

    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);

    // Unexpected error
    res.status(500).json({
      success: false,
      message: 'Authentication failed: ' + error.message,
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * OPTIONAL AUTH MIDDLEWARE
 * 
 * Attaches user if valid token present
 * Allows request to proceed without token
 * 
 * Use for endpoints that work with or without auth
 * 
 * Usage:
 *   router.get('/public-endpoint', optionalAuth, controllerFunction);
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // If no authorization header, just continue
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    // Try to extract and verify token (but don't fail if invalid)
    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      const secret = getJWTSecret();
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    } catch (error) {
      // Token is invalid or expired - just ignore and continue
      // Don't throw errors for optional auth
    }

    next();

  } catch (error) {
    // Unexpected error - still allow request to continue
    console.warn('⚠️  Optional auth error (non-blocking):', error.message);
    next();
  }
};

export default protect;
