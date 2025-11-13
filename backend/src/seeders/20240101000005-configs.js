'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('configs', [
      {
        key: 'site_name',
        value: '我的博客',
        type: 'string',
        description: '网站名称',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        key: 'site_description',
        value: '分享技术与生活',
        type: 'string',
        description: '网站描述',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        key: 'site_keywords',
        value: '博客,技术,编程,Node.js,JavaScript',
        type: 'string',
        description: '网站关键词',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        key: 'posts_per_page',
        value: '10',
        type: 'number',
        description: '每页文章数量',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        key: 'allow_comments',
        value: 'true',
        type: 'boolean',
        description: '是否允许评论',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        key: 'site_footer',
        value: '© 2024 我的博客. All rights reserved.',
        type: 'string',
        description: '网站页脚信息',
        is_public: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        key: 'admin_email',
        value: 'admin@example.com',
        type: 'string',
        description: '管理员邮箱',
        is_public: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        key: 'smtp_settings',
        value: JSON.stringify({
          host: 'smtp.126.com',
          port: 465,
          secure: true,
        }),
        type: 'json',
        description: 'SMTP 邮件服务器配置',
        is_public: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('configs', null, {});
  }
};
