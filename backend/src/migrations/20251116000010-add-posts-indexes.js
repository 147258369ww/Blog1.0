'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('posts', ['created_at']);
    await queryInterface.addIndex('posts', ['is_featured']);
    await queryInterface.sequelize.query(
      "CREATE INDEX IF NOT EXISTS idx_posts_fts_simple ON \"posts\" USING GIN ((to_tsvector('simple', COALESCE(title, '')) || to_tsvector('simple', COALESCE(content, ''))))"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('posts', ['created_at']);
    await queryInterface.removeIndex('posts', ['is_featured']);
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS idx_posts_fts_simple'
    );
  },
};