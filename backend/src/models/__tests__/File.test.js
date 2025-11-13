const { sequelize, File, User } = require('../index');

describe('File Model', () => {
  let testUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await File.destroy({ where: {}, truncate: true });
  });

  describe('Model Validation', () => {
    test('should create a valid file', async () => {
      const fileData = {
        filename: 'test-image.jpg',
        original_name: 'test image.jpg',
        mime_type: 'image/jpeg',
        size: 102400,
        path: '/uploads/images/test-image.jpg',
        url: 'http://example.com/uploads/images/test-image.jpg',
        file_type: 'image',
        uploader_id: testUser.id,
      };

      const file = await File.create(fileData);
      
      expect(file.id).toBeDefined();
      expect(file.filename).toBe(fileData.filename);
      expect(file.original_name).toBe(fileData.original_name);
      expect(file.mime_type).toBe(fileData.mime_type);
      expect(file.size).toBe(fileData.size);
      expect(file.path).toBe(fileData.path);
      expect(file.url).toBe(fileData.url);
      expect(file.file_type).toBe(fileData.file_type);
      expect(file.uploader_id).toBe(testUser.id);
    });

    test('should fail without required fields', async () => {
      await expect(File.create({})).rejects.toThrow();
    });

    test('should fail with negative size', async () => {
      const fileData = {
        filename: 'test.jpg',
        original_name: 'test.jpg',
        mime_type: 'image/jpeg',
        size: -100,
        path: '/uploads/test.jpg',
        url: 'http://example.com/uploads/test.jpg',
        file_type: 'image',
        uploader_id: testUser.id,
      };

      await expect(File.create(fileData)).rejects.toThrow();
    });

    test('should accept different file types', async () => {
      const fileTypes = ['image', 'document', 'other'];
      
      for (let i = 0; i < fileTypes.length; i++) {
        const file = await File.create({
          filename: `test${i}.file`,
          original_name: `test${i}.file`,
          mime_type: 'application/octet-stream',
          size: 1024,
          path: `/uploads/test${i}.file`,
          url: `http://example.com/uploads/test${i}.file`,
          file_type: fileTypes[i],
          uploader_id: testUser.id,
        });
        
        expect(file.file_type).toBe(fileTypes[i]);
      }
    });
  });
});
