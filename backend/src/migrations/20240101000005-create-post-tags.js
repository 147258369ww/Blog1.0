'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('post_tags', {
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'posts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tags',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    // 创建复合主键
    await queryInterface.addConstraint('post_tags', {
      fields: ['post_id', 'tag_id'],
      type: 'primary key',
      name: 'post_tags_pkey',
    });

    // 创建索引
    await queryInterface.addIndex('post_tags', ['post_id']);
    await queryInterface.addIndex('post_tags', ['tag_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('post_tags');
  }
};
