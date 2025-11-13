const { sequelize, User } = require('../index');

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe('Model Validation', () => {
    test('should create a valid user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      
      expect(user.id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
      expect(user.role).toBe('user');
      expect(user.status).toBe('active');
      expect(user.email_verified).toBe(false);
    });

    test('should fail without required fields', async () => {
      await expect(User.create({})).rejects.toThrow();
    });

    test('should fail with invalid email', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should fail with duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'test1@example.com',
        password: 'password123',
      };

      await User.create(userData);
      
      await expect(
        User.create({ ...userData, email: 'test2@example.com' })
      ).rejects.toThrow();
    });

    test('should fail with duplicate email', async () => {
      const userData = {
        username: 'testuser1',
        email: 'test@example.com',
        password: 'password123',
      };

      await User.create(userData);
      
      await expect(
        User.create({ ...userData, username: 'testuser2' })
      ).rejects.toThrow();
    });

    test('should fail with username less than 3 characters', async () => {
      const userData = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    test('should hash password on create', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$.{56}$/);
    });

    test('should hash password on update', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const oldPassword = user.password;
      user.password = 'newpassword123';
      await user.save();

      expect(user.password).not.toBe('newpassword123');
      expect(user.password).not.toBe(oldPassword);
    });
  });

  describe('Instance Methods', () => {
    test('validatePassword should return true for correct password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      const isValid = await user.validatePassword('password123');
      
      expect(isValid).toBe(true);
    });

    test('validatePassword should return false for incorrect password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      const isValid = await user.validatePassword('wrongpassword');
      
      expect(isValid).toBe(false);
    });

    test('toSafeJSON should not include password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      const safeUser = user.toSafeJSON();
      
      expect(safeUser.password).toBeUndefined();
      expect(safeUser.username).toBe(userData.username);
      expect(safeUser.email).toBe(userData.email);
    });
  });
});
