const { getBaseUrl, generateFileUrl } = require('../urlHelper');
const config = require('../../config');

describe('URL Helper', () => {
  // 保存原始配置
  const originalBaseUrl = config.server.baseUrl;
  const originalAutoDetect = config.server.autoDetectBaseUrl;

  afterEach(() => {
    // 恢复原始配置
    config.server.baseUrl = originalBaseUrl;
    config.server.autoDetectBaseUrl = originalAutoDetect;
  });

  describe('getBaseUrl', () => {
    it('应该返回配置的 SERVER_BASE_URL', () => {
      config.server.baseUrl = 'https://example.com';
      config.server.autoDetectBaseUrl = true;

      const baseUrl = getBaseUrl();
      expect(baseUrl).toBe('https://example.com');
    });

    it('应该从请求对象中自动检测 URL', () => {
      config.server.baseUrl = null;
      config.server.autoDetectBaseUrl = true;

      const mockReq = {
        protocol: 'https',
        get: jest.fn().mockReturnValue('api.example.com'),
      };

      const baseUrl = getBaseUrl(mockReq);
      expect(baseUrl).toBe('https://api.example.com');
      expect(mockReq.get).toHaveBeenCalledWith('host');
    });

    it('应该返回默认值当没有配置且没有请求对象时', () => {
      config.server.baseUrl = null;
      config.server.autoDetectBaseUrl = true;

      const baseUrl = getBaseUrl();
      expect(baseUrl).toBe('http://localhost:3000');
    });

    it('应该返回默认值当自动检测被禁用时', () => {
      config.server.baseUrl = null;
      config.server.autoDetectBaseUrl = false;

      const mockReq = {
        protocol: 'https',
        get: jest.fn().mockReturnValue('api.example.com'),
      };

      const baseUrl = getBaseUrl(mockReq);
      expect(baseUrl).toBe('http://localhost:3000');
    });
  });

  describe('generateFileUrl', () => {
    it('应该生成完整的文件 URL', () => {
      config.server.baseUrl = 'https://example.com';

      const url = generateFileUrl('/uploads/images/test.jpg');
      expect(url).toBe('https://example.com/uploads/images/test.jpg');
    });

    it('应该处理没有前导斜杠的路径', () => {
      config.server.baseUrl = 'https://example.com';

      const url = generateFileUrl('uploads/images/test.jpg');
      expect(url).toBe('https://example.com/uploads/images/test.jpg');
    });

    it('应该直接返回已经是完整 URL 的路径', () => {
      const fullUrl = 'https://cdn.example.com/images/test.jpg';
      const url = generateFileUrl(fullUrl);
      expect(url).toBe(fullUrl);
    });

    it('应该返回空字符串当路径为空时', () => {
      expect(generateFileUrl('')).toBe('');
      expect(generateFileUrl(null)).toBe('');
      expect(generateFileUrl(undefined)).toBe('');
    });

    it('应该使用请求对象自动检测基础 URL', () => {
      config.server.baseUrl = null;
      config.server.autoDetectBaseUrl = true;

      const mockReq = {
        protocol: 'https',
        get: jest.fn().mockReturnValue('api.example.com'),
      };

      const url = generateFileUrl('/uploads/test.jpg', mockReq);
      expect(url).toBe('https://api.example.com/uploads/test.jpg');
    });
  });
});
