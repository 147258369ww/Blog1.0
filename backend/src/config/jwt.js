const jwt = require('jsonwebtoken');
const config = require('./index');

/**
 * Generate an access token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT access token
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
}

/**
 * Generate a refresh token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} JWT refresh token
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });
}

/**
 * Verify an access token
 * @param {string} token - JWT access token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw error;
  }
}

/**
 * Verify a refresh token
 * @param {string} token - JWT refresh token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    throw error;
  }
}

/**
 * Decode a token without verification
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * Check if token needs refresh based on expiration time
 * @param {string} token - JWT access token
 * @param {number} thresholdMinutes - Minutes before expiration to trigger refresh (default: 5)
 * @returns {boolean} True if token should be refreshed
 */
function shouldRefreshToken(token, thresholdMinutes = config.jwt.autoRefreshThreshold) {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    const thresholdSeconds = thresholdMinutes * 60;

    // 如果令牌在阈值时间内过期，则需要刷新
    return expiresIn > 0 && expiresIn <= thresholdSeconds;
  } catch (error) {
    return false;
  }
}

/**
 * Get token expiration info
 * @param {string} token - JWT token
 * @returns {Object} Token expiration information
 */
function getTokenExpirationInfo(token) {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;

    return {
      expiresAt: new Date(decoded.exp * 1000),
      expiresIn: expiresIn > 0 ? expiresIn : 0,
      isExpired: expiresIn <= 0,
      shouldRefresh: shouldRefreshToken(token),
    };
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  shouldRefreshToken,
  getTokenExpirationInfo,
};
