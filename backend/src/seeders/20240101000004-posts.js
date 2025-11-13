'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const publishedDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7天前

    // 创建示例文章
    await queryInterface.bulkInsert('posts', [
      {
        title: '欢迎来到我的博客',
        slug: 'welcome-to-my-blog',
        summary: '这是博客的第一篇文章，介绍博客的主要内容和目标。',
        content: `# 欢迎来到我的博客

这是我的个人博客的第一篇文章。在这里，我将分享关于技术、生活和学习的各种内容。

## 博客主题

- 前端开发技术
- 后端开发实践
- 编程学习心得
- 生活随笔

## 技术栈

本博客使用以下技术构建：

- 后端：Node.js + Express + PostgreSQL + Redis
- 前端：React + TypeScript
- 部署：Docker + Nginx

期待与大家分享更多精彩内容！`,
        cover_image: null,
        author_id: 1,
        category_id: 1,
        status: 'published',
        is_featured: true,
        allow_comments: true,
        view_count: 0,
        published_at: publishedDate,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        title: 'Node.js 最佳实践指南',
        slug: 'nodejs-best-practices',
        summary: '总结 Node.js 开发中的最佳实践和常见陷阱。',
        content: `# Node.js 最佳实践指南

在 Node.js 开发过程中，遵循最佳实践可以帮助我们写出更高质量、更易维护的代码。

## 1. 错误处理

始终使用 try-catch 处理异步错误，避免未捕获的异常导致进程崩溃。

\`\`\`javascript
async function fetchData() {
  try {
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    logger.error('Error fetching data:', error);
    throw error;
  }
}
\`\`\`

## 2. 环境配置

使用环境变量管理配置，不要将敏感信息硬编码在代码中。

## 3. 日志记录

使用专业的日志库（如 Winston）记录应用日志，便于问题排查。

## 4. 安全性

- 使用 helmet 保护 HTTP 头
- 实施速率限制
- 验证和清理用户输入
- 使用 HTTPS

## 5. 性能优化

- 使用缓存减少数据库查询
- 实施连接池
- 使用集群模式充分利用多核 CPU

遵循这些实践，可以构建更加健壮和高效的 Node.js 应用。`,
        cover_image: null,
        author_id: 1,
        category_id: 4,
        status: 'published',
        is_featured: true,
        allow_comments: true,
        view_count: 0,
        published_at: publishedDate,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        title: 'Express 中间件详解',
        slug: 'express-middleware-explained',
        summary: '深入理解 Express 中间件的工作原理和使用方法。',
        content: `# Express 中间件详解

Express 中间件是 Express 应用的核心概念，理解中间件对于构建 Express 应用至关重要。

## 什么是中间件？

中间件函数是可以访问请求对象（req）、响应对象（res）和应用请求-响应周期中的下一个中间件函数的函数。

## 中间件类型

### 1. 应用级中间件

\`\`\`javascript
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});
\`\`\`

### 2. 路由级中间件

\`\`\`javascript
router.use('/user/:id', (req, res, next) => {
  console.log('Request Type:', req.method);
  next();
});
\`\`\`

### 3. 错误处理中间件

\`\`\`javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
\`\`\`

### 4. 内置中间件

- express.json()
- express.urlencoded()
- express.static()

### 5. 第三方中间件

- cors
- helmet
- morgan

## 中间件执行顺序

中间件按照注册的顺序执行，这一点非常重要。

理解和正确使用中间件，可以让你的 Express 应用更加模块化和易于维护。`,
        cover_image: null,
        author_id: 1,
        category_id: 4,
        status: 'published',
        is_featured: false,
        allow_comments: true,
        view_count: 0,
        published_at: publishedDate,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        title: 'PostgreSQL 性能优化技巧',
        slug: 'postgresql-performance-tips',
        summary: '提升 PostgreSQL 数据库性能的实用技巧。',
        content: `# PostgreSQL 性能优化技巧

PostgreSQL 是一个功能强大的开源关系型数据库，但要充分发挥其性能，需要进行适当的优化。

## 1. 索引优化

合理使用索引可以大幅提升查询性能。

\`\`\`sql
-- 创建单列索引
CREATE INDEX idx_users_email ON users(email);

-- 创建复合索引
CREATE INDEX idx_posts_status_published ON posts(status, published_at);
\`\`\`

## 2. 查询优化

- 使用 EXPLAIN ANALYZE 分析查询计划
- 避免 SELECT *，只查询需要的列
- 使用适当的 JOIN 类型

## 3. 连接池

使用连接池管理数据库连接，避免频繁创建和销毁连接。

## 4. 分页查询

对于大数据集，使用 LIMIT 和 OFFSET 进行分页。

\`\`\`sql
SELECT * FROM posts 
WHERE status = 'published' 
ORDER BY published_at DESC 
LIMIT 10 OFFSET 20;
\`\`\`

## 5. 定期维护

- 定期执行 VACUUM
- 更新统计信息
- 重建索引

## 6. 配置优化

根据服务器资源调整 PostgreSQL 配置参数：

- shared_buffers
- work_mem
- maintenance_work_mem
- effective_cache_size

通过这些优化技巧，可以显著提升 PostgreSQL 的性能。`,
        cover_image: null,
        author_id: 1,
        category_id: 4,
        status: 'published',
        is_featured: false,
        allow_comments: true,
        view_count: 0,
        published_at: publishedDate,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        title: 'Redis 缓存策略',
        slug: 'redis-caching-strategies',
        summary: '介绍 Redis 在应用中的常见缓存策略和使用场景。',
        content: `# Redis 缓存策略

Redis 是一个高性能的内存数据库，常用于缓存、会话存储和消息队列等场景。

## 常见缓存策略

### 1. Cache-Aside（旁路缓存）

应用程序直接与缓存和数据库交互。

\`\`\`javascript
async function getData(key) {
  // 先查缓存
  let data = await redis.get(key);
  
  if (!data) {
    // 缓存未命中，查数据库
    data = await database.query(key);
    // 写入缓存
    await redis.set(key, data, 'EX', 3600);
  }
  
  return data;
}
\`\`\`

### 2. Read-Through

缓存层负责从数据库加载数据。

### 3. Write-Through

写操作同时更新缓存和数据库。

### 4. Write-Behind

先写缓存，异步写数据库。

## 缓存失效策略

### 1. TTL（Time To Live）

设置过期时间，自动失效。

\`\`\`javascript
await redis.set('key', 'value', 'EX', 3600); // 1小时后过期
\`\`\`

### 2. 主动失效

数据更新时主动删除缓存。

### 3. LRU（Least Recently Used）

Redis 配置 maxmemory-policy 为 allkeys-lru。

## 缓存雪崩和穿透

### 缓存雪崩

大量缓存同时失效，解决方案：
- 设置随机过期时间
- 使用互斥锁

### 缓存穿透

查询不存在的数据，解决方案：
- 缓存空值
- 使用布隆过滤器

合理使用 Redis 缓存可以大幅提升应用性能。`,
        cover_image: null,
        author_id: 1,
        category_id: 4,
        status: 'draft',
        is_featured: false,
        allow_comments: true,
        view_count: 0,
        published_at: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
    ], {});

    // 为文章添加标签关联
    await queryInterface.bulkInsert('post_tags', [
      // 第一篇文章的标签
      { post_id: 1, tag_id: 1 }, // JavaScript
      { post_id: 1, tag_id: 2 }, // Node.js
      
      // 第二篇文章的标签
      { post_id: 2, tag_id: 2 }, // Node.js
      { post_id: 2, tag_id: 10 }, // 最佳实践
      { post_id: 2, tag_id: 9 }, // 教程
      
      // 第三篇文章的标签
      { post_id: 3, tag_id: 6 }, // Express
      { post_id: 3, tag_id: 2 }, // Node.js
      { post_id: 3, tag_id: 9 }, // 教程
      
      // 第四篇文章的标签
      { post_id: 4, tag_id: 7 }, // PostgreSQL
      { post_id: 4, tag_id: 10 }, // 最佳实践
      
      // 第五篇文章的标签
      { post_id: 5, tag_id: 8 }, // Redis
      { post_id: 5, tag_id: 10 }, // 最佳实践
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('post_tags', null, {});
    await queryInterface.bulkDelete('posts', null, {});
  }
};
