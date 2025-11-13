/**
 * Admin authorization middleware
 * Checks if the authenticated user has admin role
 * Must be used after authenticate middleware
 */
function requireAdmin(req, res, next) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: '需要认证',
      },
    });
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '需要管理员权限',
      },
    });
  }

  next();
}

module.exports = requireAdmin;
