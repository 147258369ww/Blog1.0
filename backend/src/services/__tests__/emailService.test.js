const emailService = require('../emailService');
const { redisClient } = require('../../config/redis');
const { transporter } = require('../../config/email');

// Mock dependencies
jest.mock('../../config/redis', () => ({
  redisClient: {
    setEx: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  },
}));

jest.mock('../../config/email', () => ({
  transporter: {
    sendMail: jest.fn(),
  },
  from: 'test@example.com',
}));

jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateVerificationCode', () => {
    it('should generate a 6-digit verification code', () => {
      const code = emailService.generateVerificationCode();
      
      expect(code).toBeDefined();
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    });

    it('should generate different codes on multiple calls', () => {
      const code1 = emailService.generateVerificationCode();
      const code2 = emailService.generateVerificationCode();
      const code3 = emailService.generateVerificationCode();
      
      // At least one should be different (statistically almost certain)
      const allSame = code1 === code2 && code2 === code3;
      expect(allSame).toBe(false);
    });

    it('should generate codes within valid range (100000-999999)', () => {
      for (let i = 0; i < 10; i++) {
        const code = emailService.generateVerificationCode();
        const numCode = parseInt(code, 10);
        
        expect(numCode).toBeGreaterThanOrEqual(100000);
        expect(numCode).toBeLessThanOrEqual(999999);
      }
    });
  });

  describe('storeVerificationCode', () => {
    it('should store verification code in Redis with default TTL', async () => {
      const email = 'test@example.com';
      const code = '123456';
      
      redisClient.setEx.mockResolvedValue('OK');
      
      await emailService.storeVerificationCode(email, code);
      
      expect(redisClient.setEx).toHaveBeenCalledWith(
        `email_code:${email}`,
        600,
        code
      );
    });

    it('should store verification code with custom TTL', async () => {
      const email = 'test@example.com';
      const code = '123456';
      const customTTL = 300;
      
      redisClient.setEx.mockResolvedValue('OK');
      
      await emailService.storeVerificationCode(email, code, customTTL);
      
      expect(redisClient.setEx).toHaveBeenCalledWith(
        `email_code:${email}`,
        customTTL,
        code
      );
    });

    it('should throw error when Redis fails', async () => {
      const email = 'test@example.com';
      const code = '123456';
      
      redisClient.setEx.mockRejectedValue(new Error('Redis error'));
      
      await expect(
        emailService.storeVerificationCode(email, code)
      ).rejects.toThrow('Failed to store verification code');
    });
  });

  describe('getVerificationCode', () => {
    it('should retrieve verification code from Redis', async () => {
      const email = 'test@example.com';
      const code = '123456';
      
      redisClient.get.mockResolvedValue(code);
      
      const result = await emailService.getVerificationCode(email);
      
      expect(result).toBe(code);
      expect(redisClient.get).toHaveBeenCalledWith(`email_code:${email}`);
    });

    it('should return null when code does not exist', async () => {
      const email = 'test@example.com';
      
      redisClient.get.mockResolvedValue(null);
      
      const result = await emailService.getVerificationCode(email);
      
      expect(result).toBeNull();
    });

    it('should throw error when Redis fails', async () => {
      const email = 'test@example.com';
      
      redisClient.get.mockRejectedValue(new Error('Redis error'));
      
      await expect(
        emailService.getVerificationCode(email)
      ).rejects.toThrow('Failed to retrieve verification code');
    });
  });

  describe('deleteVerificationCode', () => {
    it('should delete verification code from Redis', async () => {
      const email = 'test@example.com';
      
      redisClient.del.mockResolvedValue(1);
      
      await emailService.deleteVerificationCode(email);
      
      expect(redisClient.del).toHaveBeenCalledWith(`email_code:${email}`);
    });

    it('should not throw error when Redis fails', async () => {
      const email = 'test@example.com';
      
      redisClient.del.mockRejectedValue(new Error('Redis error'));
      
      await expect(
        emailService.deleteVerificationCode(email)
      ).resolves.not.toThrow();
    });
  });

  describe('generateVerificationEmailTemplate', () => {
    it('should generate HTML email template with code', () => {
      const code = '123456';
      
      const html = emailService.generateVerificationEmailTemplate(code);
      
      expect(html).toContain(code);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('邮箱验证码');
      expect(html).toContain('10 分钟');
    });
  });

  describe('sendVerificationCode', () => {
    it('should send verification email successfully', async () => {
      const email = 'test@example.com';
      const code = '123456';
      const messageId = 'test-message-id';
      
      transporter.sendMail.mockResolvedValue({ messageId });
      
      const result = await emailService.sendVerificationCode(email, code);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBe(messageId);
      expect(transporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: expect.stringContaining('验证码'),
          html: expect.stringContaining(code),
        })
      );
    });

    it('should throw error when email sending fails', async () => {
      const email = 'test@example.com';
      const code = '123456';
      
      transporter.sendMail.mockRejectedValue(new Error('SMTP error'));
      
      await expect(
        emailService.sendVerificationCode(email, code)
      ).rejects.toThrow('Failed to send verification email');
    });
  });

  describe('generateAndSendVerificationCode', () => {
    it('should generate, store, and send verification code', async () => {
      const email = 'test@example.com';
      const messageId = 'test-message-id';
      
      redisClient.setEx.mockResolvedValue('OK');
      transporter.sendMail.mockResolvedValue({ messageId });
      
      const result = await emailService.generateAndSendVerificationCode(email);
      
      expect(result.success).toBe(true);
      expect(result.messageId).toBe(messageId);
      expect(redisClient.setEx).toHaveBeenCalled();
      expect(transporter.sendMail).toHaveBeenCalled();
    });

    it('should throw error when storage fails', async () => {
      const email = 'test@example.com';
      
      redisClient.setEx.mockRejectedValue(new Error('Redis error'));
      
      await expect(
        emailService.generateAndSendVerificationCode(email)
      ).rejects.toThrow();
    });

    it('should throw error when sending fails', async () => {
      const email = 'test@example.com';
      
      redisClient.setEx.mockResolvedValue('OK');
      transporter.sendMail.mockRejectedValue(new Error('SMTP error'));
      
      await expect(
        emailService.generateAndSendVerificationCode(email)
      ).rejects.toThrow();
    });
  });

  describe('verifyCode', () => {
    it('should verify correct code successfully', async () => {
      const email = 'test@example.com';
      const code = '123456';
      
      redisClient.get.mockResolvedValue(code);
      redisClient.del.mockResolvedValue(1);
      
      const result = await emailService.verifyCode(email, code);
      
      expect(result).toBe(true);
      expect(redisClient.get).toHaveBeenCalledWith(`email_code:${email}`);
      expect(redisClient.del).toHaveBeenCalledWith(`email_code:${email}`);
    });

    it('should return false when code does not exist', async () => {
      const email = 'test@example.com';
      const code = '123456';
      
      redisClient.get.mockResolvedValue(null);
      
      const result = await emailService.verifyCode(email, code);
      
      expect(result).toBe(false);
      expect(redisClient.del).not.toHaveBeenCalled();
    });

    it('should return false when code does not match', async () => {
      const email = 'test@example.com';
      const storedCode = '123456';
      const inputCode = '654321';
      
      redisClient.get.mockResolvedValue(storedCode);
      
      const result = await emailService.verifyCode(email, inputCode);
      
      expect(result).toBe(false);
      expect(redisClient.del).not.toHaveBeenCalled();
    });

    it('should throw error when Redis get fails', async () => {
      const email = 'test@example.com';
      const code = '123456';
      
      redisClient.get.mockRejectedValue(new Error('Redis error'));
      
      await expect(
        emailService.verifyCode(email, code)
      ).rejects.toThrow();
    });
  });
});
