const { errorHandler, notFoundHandler } = require('../errorHandler');
const {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} = require('../../utils/errors');
const logger = require('../../utils/logger');

// Mock logger
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}));

describe('Error Handler Middleware', () => {
  let req, res, next;
  let originalEnv;

  beforeAll(() => {
    originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    req = {
      method: 'GET',
      originalUrl: '/api/v1/test',
      ip: '127.0.0.1',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('errorHandler', () => {
    it('should handle ValidationError', () => {
      const details = [{ field: 'email', message: 'Invalid email' }];
      const error = new ValidationError('Validation failed', details);

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ValidationError',
          message: 'Validation failed',
          details,
        },
      });
    });

    it('should handle AuthenticationError', () => {
      const error = new AuthenticationError('Invalid token');

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AuthenticationError',
          message: 'Invalid token',
        },
      });
    });

    it('should handle AuthorizationError', () => {
      const error = new AuthorizationError('Admin access required');

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'AuthorizationError',
          message: 'Admin access required',
        },
      });
    });

    it('should handle NotFoundError', () => {
      const error = new NotFoundError('Resource not found');

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NotFoundError',
          message: 'Resource not found',
        },
      });
    });

    it('should handle JWT errors', () => {
      const error = new Error('jwt malformed');
      error.name = 'JsonWebTokenError';

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'JsonWebTokenError',
          message: '无效的令牌',
        },
      });
    });

    it('should handle token expired errors', () => {
      const error = new Error('jwt expired');
      error.name = 'TokenExpiredError';

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'TokenExpiredError',
          message: '令牌已过期',
        },
      });
    });

    it('should handle Sequelize validation errors', () => {
      const error = {
        name: 'SequelizeValidationError',
        message: 'Validation error',
        errors: [
          { path: 'email', message: 'Email must be unique' },
          { path: 'username', message: 'Username is required' },
        ],
      };

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'SequelizeValidationError',
          message: '数据验证失败',
          details: [
            { field: 'email', message: 'Email must be unique' },
            { field: 'username', message: 'Username is required' },
          ],
        },
      });
    });

    it('should handle Multer file size errors', () => {
      const error = new Error('File too large');
      error.name = 'MulterError';
      error.code = 'LIMIT_FILE_SIZE';

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'MulterError',
          message: '文件大小超出限制',
        },
      });
    });

    it('should handle unknown errors with generic message in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Database connection failed');

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should include error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Database connection failed');

      errorHandler(error, req, res, next);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      const response = res.json.mock.calls[0][0];
      expect(response.success).toBe(false);
      expect(response.error.message).toBe('Database connection failed');
      expect(response.error.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFoundHandler', () => {
    it('should create a 404 error for unmatched routes', () => {
      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
      expect(error.message).toContain('GET');
      expect(error.message).toContain('/api/v1/test');
    });
  });
});
