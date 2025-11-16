const { shouldRefreshToken } = require('../config/jwt');
const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * Auto refresh token middleware
 * Checks if the access token is about to expire and automatically refreshes it
 * The new token is sent in the response header: X-New-Access-Token
 */
async function autoRefreshToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next();
    }

    const accessToken = parts[1];

    // Check if token needs refresh
    if (!shouldRefreshToken(accessToken)) {
      return next();
    }

    // Get refresh token from request body or header
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];

    if (!refreshToken) {
      // No refresh token available, continue without refreshing
      return next();
    }

    try {
      // Attempt to refresh the token
      const result = await authService.refreshToken(refreshToken);
      
      // Set new access token in response header
      res.setHeader('X-New-Access-Token', result.accessToken);
      
      logger.info('Access token auto-refreshed');
    } catch (error) {
      // If refresh fails, log but don't block the request
      logger.warn('Auto refresh token failed:', error.message);
    }

    next();
  } catch (error) {
    // Don't block the request if auto-refresh fails
    logger.error('Auto refresh token middleware error:', error);
    next();
  }
}

module.exports = autoRefreshToken;
