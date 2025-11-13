const { sequelize, Config } = require('../index');

describe('Config Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Config.destroy({ where: {}, truncate: true });
  });

  describe('Model Validation', () => {
    test('should create a valid config', async () => {
      const configData = {
        key: 'site_name',
        value: 'My Blog',
        type: 'string',
        description: 'The name of the site',
        is_public: true,
      };

      const config = await Config.create(configData);
      
      expect(config.id).toBeDefined();
      expect(config.key).toBe(configData.key);
      expect(config.value).toBe(configData.value);
      expect(config.type).toBe(configData.type);
      expect(config.description).toBe(configData.description);
      expect(config.is_public).toBe(configData.is_public);
    });

    test('should fail without required fields', async () => {
      await expect(Config.create({})).rejects.toThrow();
    });

    test('should fail with duplicate key', async () => {
      const configData = {
        key: 'site_name',
        value: 'My Blog',
      };

      await Config.create(configData);
      
      await expect(
        Config.create({ ...configData, value: 'Another Blog' })
      ).rejects.toThrow();
    });

    test('should default type to string', async () => {
      const config = await Config.create({
        key: 'test_key',
        value: 'test_value',
      });
      
      expect(config.type).toBe('string');
    });

    test('should default is_public to false', async () => {
      const config = await Config.create({
        key: 'test_key',
        value: 'test_value',
      });
      
      expect(config.is_public).toBe(false);
    });
  });

  describe('getParsedValue Method', () => {
    test('should parse string value', async () => {
      const config = await Config.create({
        key: 'site_name',
        value: 'My Blog',
        type: 'string',
      });
      
      expect(config.getParsedValue()).toBe('My Blog');
    });

    test('should parse number value', async () => {
      const config = await Config.create({
        key: 'max_posts',
        value: '10',
        type: 'number',
      });
      
      expect(config.getParsedValue()).toBe(10);
    });

    test('should parse boolean value (true)', async () => {
      const config = await Config.create({
        key: 'maintenance_mode',
        value: 'true',
        type: 'boolean',
      });
      
      expect(config.getParsedValue()).toBe(true);
    });

    test('should parse boolean value (false)', async () => {
      const config = await Config.create({
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
      });
      
      expect(config.getParsedValue()).toBe(false);
    });

    test('should parse JSON value', async () => {
      const jsonValue = { theme: 'dark', language: 'en' };
      const config = await Config.create({
        key: 'settings',
        value: JSON.stringify(jsonValue),
        type: 'json',
      });
      
      expect(config.getParsedValue()).toEqual(jsonValue);
    });

    test('should return null for invalid JSON', async () => {
      const config = await Config.create({
        key: 'settings',
        value: 'invalid-json',
        type: 'json',
      });
      
      expect(config.getParsedValue()).toBeNull();
    });

    test('should return null for null value', async () => {
      const config = await Config.create({
        key: 'test_key',
        value: null,
      });
      
      expect(config.getParsedValue()).toBeNull();
    });
  });
});
