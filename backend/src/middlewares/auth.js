const { verifyAccessToken } = require('../config/jwt');
const tokenBlacklist = require('../services/tokenBlacklist');

/**
 * Authentication middleware
 * Verifies JWT access token and attaches user info to req.user
 */
function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: '未提供认证令牌',
        },
      });
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: '令牌格式无效',
        },
      });
    }

    const token = parts[1];

    const revoked = tokenBlacklist.isBlacklistedSync(token);
    if (revoked) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REVOKED',
          message: '令牌已被撤销',
        },
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: '令牌已过期',
        },
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '令牌无效',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: '认证失败',
      },
    });
  }
}

module.exports = authenticate;
