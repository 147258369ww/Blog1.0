const { sequelize } = require('../config/database');

// 导入所有模型
const User = require('./User')(sequelize);
const Post = require('./Post')(sequelize);
const Category = require('./Category')(sequelize);
const Tag = require('./Tag')(sequelize);
const File = require('./File')(sequelize);
const Link = require('./Link')(sequelize);
const Config = require('./Config')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);

// 定义模型关联关系

// User 与 Post 的关系（一对多）
User.hasMany(Post, {
  foreignKey: 'author_id',
  as: 'posts',
  onDelete: 'CASCADE',
});
Post.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author',
});

// Category 与 Post 的关系（一对多）
Category.hasMany(Post, {
  foreignKey: 'category_id',
  as: 'posts',
  onDelete: 'SET NULL',
});
Post.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category',
});

// Category 自关联（父子分类）
Category.hasMany(Category, {
  foreignKey: 'parent_id',
  as: 'children',
  onDelete: 'CASCADE',
});
Category.belongsTo(Category, {
  foreignKey: 'parent_id',
  as: 'parent',
});

// Post 与 Tag 的关系（多对多）
Post.belongsToMany(Tag, {
  through: 'post_tags',
  foreignKey: 'post_id',
  otherKey: 'tag_id',
  as: 'tags',
  timestamps: false,
});
Tag.belongsToMany(Post, {
  through: 'post_tags',
  foreignKey: 'tag_id',
  otherKey: 'post_id',
  as: 'posts',
  timestamps: false,
});

// User 与 File 的关系（一对多）
User.hasMany(File, {
  foreignKey: 'uploader_id',
  as: 'files',
  onDelete: 'CASCADE',
});
File.belongsTo(User, {
  foreignKey: 'uploader_id',
  as: 'uploader',
});

// User 与 AuditLog 的关系（一对多）
User.hasMany(AuditLog, {
  foreignKey: 'user_id',
  as: 'auditLogs',
  onDelete: 'SET NULL',
});
AuditLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// 导出所有模型和 sequelize 实例
module.exports = {
  sequelize,
  User,
  Post,
  Category,
  Tag,
  File,
  Link,
  Config,
  AuditLog,
};
