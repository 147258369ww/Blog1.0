const { sequelize, Tag } = require('../index');

describe('Tag Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Tag.destroy({ where: {}, force: true });
  });

  describe('Model Validation', () => {
    test('should create a valid tag', async () => {
      const tagData = {
        name: 'JavaScript',
        slug: 'javascript',
        color: '#F7DF1E',
      };

      const tag = await Tag.create(tagData);
      
      expect(tag.id).toBeDefined();
      expect(tag.name).toBe(tagData.name);
      expect(tag.slug).toBe(tagData.slug);
      expect(tag.color).toBe(tagData.color);
    });

    test('should fail without required fields', async () => {
      await expect(Tag.create({})).rejects.toThrow();
    });

    test('should fail with duplicate name', async () => {
      const tagData = {
        name: 'JavaScript',
        slug: 'javascript',
      };

      await Tag.create(tagData);
      
      await expect(
        Tag.create({ ...tagData, slug: 'js' })
      ).rejects.toThrow();
    });

    test('should fail with duplicate slug', async () => {
      const tagData = {
        name: 'JavaScript',
        slug: 'javascript',
      };

      await Tag.create(tagData);
      
      await expect(
        Tag.create({ ...tagData, name: 'JS' })
      ).rejects.toThrow();
    });

    test('should fail with invalid color format', async () => {
      const tagData = {
        name: 'JavaScript',
        slug: 'javascript',
        color: 'invalid-color',
      };

      await expect(Tag.create(tagData)).rejects.toThrow();
    });

    test('should accept valid hex color', async () => {
      const colors = ['#FFFFFF', '#000000', '#F7DF1E', '#ff0000'];
      
      for (let i = 0; i < colors.length; i++) {
        const tag = await Tag.create({
          name: `Tag${i}`,
          slug: `tag${i}`,
          color: colors[i],
        });
        
        expect(tag.color).toBe(colors[i]);
      }
    });
  });
});
