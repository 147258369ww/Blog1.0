const request = require('supertest');
const app = require('../app');

describe('CORS Configuration', () => {
  describe('Allowed Origins', () => {
    it('should allow requests from configured origins', async () => {
      const allowedOrigin = 'http://localhost:3000';
      
      const response = await request(app)
        .get('/health')
        .set('Origin', allowedOrigin);

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe(allowedOrigin);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should handle preflight OPTIONS requests', async () => {
      const allowedOrigin = 'http://localhost:3000';
      
      const response = await request(app)
        .options('/api/v1/posts')
        .set('Origin', allowedOrigin)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe(allowedOrigin);
      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.headers['access-control-allow-methods']).toContain('PUT');
      expect(response.headers['access-control-allow-methods']).toContain('DELETE');
      expect(response.headers['access-control-allow-methods']).toContain('PATCH');
    });

    it('should allow Content-Type and Authorization headers', async () => {
      const allowedOrigin = 'http://localhost:3000';
      
      const response = await request(app)
        .options('/api/v1/posts')
        .set('Origin', allowedOrigin)
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-headers']).toContain('Content-Type');
      expect(response.headers['access-control-allow-headers']).toContain('Authorization');
    });
  });

  describe('HTTP Methods', () => {
    it('should allow GET requests', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
    });

    it('should support POST, PUT, DELETE, PATCH methods in preflight', async () => {
      const response = await request(app)
        .options('/api/v1/posts')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      const allowedMethods = response.headers['access-control-allow-methods'];
      expect(allowedMethods).toContain('POST');
      expect(allowedMethods).toContain('PUT');
      expect(allowedMethods).toContain('DELETE');
      expect(allowedMethods).toContain('PATCH');
      expect(allowedMethods).toContain('OPTIONS');
    });
  });
});
