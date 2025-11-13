const { sequelize, Category } = require('../index');

describe('Category Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  afterEach(async () => {
    await Category.destroy({ where: {}, truncate: true, cascade: true });
  });

  describe('Model Validation', () => {
    test('should create a valid category', async () => {
      const categoryData = {
        name: 'Technology',
        slug: 'technology',
        description: 'Tech related posts',
      };

      const category = await Category.create(categoryData);
      
      expect(category.id).toBeDefined();
      expect(category.name).toBe(categoryData.name);
      expect(category.slug).toBe(categoryData.slug);
      expect(category.description).toBe(categoryData.description);
      expect(category.sort_order).toBe(0);
    });

    test('should fail without required fields', async () => {
      await expect(Category.create({})).rejects.toThrow();
    });

    test('should fail with duplicate name', async () => {
      const categoryData = {
        name: 'Technology',
        slug: 'technology',
      };

      await Category.create(categoryData);
      
      await expect(
        Category.create({ ...categoryData, slug: 'tech' })
      ).rejects.toThrow();
    });

    test('should fail with duplicate slug', async () => {
      const categoryData = {
        name: 'Technology',
        slug: 'technology',
      };

      await Category.create(categoryData);
      
      await expect(
        Category.create({ ...categoryData, name: 'Tech' })
      ).rejects.toThrow();
    });
  });

  describe('Self-Referencing Relationship', () => {
    test('should create parent-child relationship', async () => {
      const parent = await Category.create({
        name: 'Technology',
        slug: 'technology',
      });

      const child = await Category.create({
        name: 'Programming',
        slug: 'programming',
        parent_id: parent.id,
      });

      expect(child.parent_id).toBe(parent.id);
      
      const childWithParent = await Category.findByPk(child.id, {
        include: [{ model: Category, as: 'parent' }],
      });
      
      expect(childWithParent.parent.id).toBe(parent.id);
      expect(childWithParent.parent.name).toBe('Technology');
    });

    test('should get children of parent category', async () => {
      const parent = await Category.create({
        name: 'Technology',
        slug: 'technology',
      });

      await Category.create({
        name: 'Programming',
        slug: 'programming',
        parent_id: parent.id,
      });

      await Category.create({
        name: 'Hardware',
        slug: 'hardware',
        parent_id: parent.id,
      });

      const parentWithChildren = await Category.findByPk(parent.id, {
        include: [{ model: Category, as: 'children' }],
      });

      expect(parentWithChildren.children).toHaveLength(2);
    });
  });
});
