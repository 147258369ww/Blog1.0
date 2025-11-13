const requireAdmin = require('../admin');

describe('Admin Authorization Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should allow admin user', () => {
    req.user = { id: 1, email: 'admin@example.com', role: 'admin' };

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should reject non-admin user', () => {
    req.user = { id: 2, email: 'user@example.com', role: 'user' };

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: '需要管理员权限',
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject unauthenticated request', () => {
    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: '需要认证',
      },
    });
    expect(next).not.toHaveBeenCalled();
  });
});
