'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建管理员用户
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    
    await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        nickname: '管理员',
        avatar: null,
        role: 'admin',
        status: 'active',
        email_verified: true,
        last_login_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: 'admin@example.com'
    }, {});
  }
};
