const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} = require('../errors');

describe('Custom Error Classes', () => {
  describe('AppError', () => {
    it('should create an error with message and status code', () => {
      const error = new AppError('Test error', 500);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 500);
      
      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should create a validation error with 400 status code', () => {
      const error = new ValidationError('Validation failed');
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('ValidationError');
    });

    it('should include validation details', () => {
      const details = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ];
      const error = new ValidationError('Validation failed', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('AuthenticationError', () => {
    it('should create an authentication error with 401 status code', () => {
      const error = new AuthenticationError();
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('未授权访问');
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token');
      
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('AuthorizationError', () => {
    it('should create an authorization error with 403 status code', () => {
      const error = new AuthorizationError();
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('权限不足');
      expect(error.statusCode).toBe(403);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AuthorizationError');
    });

    it('should accept custom message', () => {
      const error = new AuthorizationError('Admin access required');
      
      expect(error.message).toBe('Admin access required');
    });
  });

  describe('NotFoundError', () => {
    it('should create a not found error with 404 status code', () => {
      const error = new NotFoundError();
      
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('资源不存在');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('NotFoundError');
    });

    it('should accept custom message', () => {
      const error = new NotFoundError('User not found');
      
      expect(error.message).toBe('User not found');
    });
  });
});
