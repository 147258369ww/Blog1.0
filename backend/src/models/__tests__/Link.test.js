const { sequelize, Link } = require('../index');

describe('Link Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Link.destroy({ where: {}, truncate: true });
  });

  describe('Model Validation', () => {
    test('should create a valid link', async () => {
      const linkData = {
        name: 'Example Site',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
        description: 'An example website',
        sort_order: 1,
        status: 'active',
      };

      const link = await Link.create(linkData);
      
      expect(link.id).toBeDefined();
      expect(link.name).toBe(linkData.name);
      expect(link.url).toBe(linkData.url);
      expect(link.logo).toBe(linkData.logo);
      expect(link.description).toBe(linkData.description);
      expect(link.sort_order).toBe(linkData.sort_order);
      expect(link.status).toBe(linkData.status);
    });

    test('should fail without required fields', async () => {
      await expect(Link.create({})).rejects.toThrow();
    });

    test('should fail with invalid URL', async () => {
      const linkData = {
        name: 'Example Site',
        url: 'not-a-valid-url',
      };

      await expect(Link.create(linkData)).rejects.toThrow();
    });

    test('should accept valid URLs', async () => {
      const urls = [
        'https://example.com',
        'http://example.com',
        'https://example.com/path',
        'https://subdomain.example.com',
      ];
      
      for (let i = 0; i < urls.length; i++) {
        const link = await Link.create({
          name: `Site ${i}`,
          url: urls[i],
        });
        
        expect(link.url).toBe(urls[i]);
      }
    });

    test('should default sort_order to 0', async () => {
      const link = await Link.create({
        name: 'Example Site',
        url: 'https://example.com',
      });
      
      expect(link.sort_order).toBe(0);
    });

    test('should default status to active', async () => {
      const link = await Link.create({
        name: 'Example Site',
        url: 'https://example.com',
      });
      
      expect(link.status).toBe('active');
    });
  });
});
