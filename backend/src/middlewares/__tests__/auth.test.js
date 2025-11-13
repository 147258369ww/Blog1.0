const authenticate = require('../auth');
const { generateAccessToken } = require('../../config/jwt');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should authenticate with valid token', () => {
    const mockUser = { id: 1, email: 'test@example.com', role: 'user' };
    const token = generateAccessToken(mockUser);
    req.headers.authorization = `Bearer ${token}`;

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(mockUser.id);
    expect(req.user.email).toBe(mockUser.email);
    expect(req.user.role).toBe(mockUser.role);
  });

  it('should reject request without token', () => {
    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: '未提供认证令牌',
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with invalid token format', () => {
    req.headers.authorization = 'InvalidFormat token123';

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INVALID_TOKEN_FORMAT',
        message: '令牌格式无效',
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with invalid token', () => {
    req.headers.authorization = 'Bearer invalid.token.here';

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
