'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('tags', [
      {
        name: 'JavaScript',
        slug: 'javascript',
        color: '#F7DF1E',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Node.js',
        slug: 'nodejs',
        color: '#339933',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'React',
        slug: 'react',
        color: '#61DAFB',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Vue.js',
        slug: 'vuejs',
        color: '#4FC08D',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'TypeScript',
        slug: 'typescript',
        color: '#3178C6',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Express',
        slug: 'express',
        color: '#000000',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'PostgreSQL',
        slug: 'postgresql',
        color: '#336791',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Redis',
        slug: 'redis',
        color: '#DC382D',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: '教程',
        slug: 'tutorial',
        color: '#FF6B6B',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: '最佳实践',
        slug: 'best-practices',
        color: '#4ECDC4',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tags', null, {});
  }
};
