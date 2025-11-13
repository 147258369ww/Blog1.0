const { sequelize, User, Post, Category, Tag } = require('../src/models');
const bcrypt = require('bcrypt');

/**
 * 检查数据是否已存在的辅助函数
 */
async function checkDataExists() {
  const userCount = await User.count();
  const categoryCount = await Category.count();
  const tagCount = await Tag.count();
  const postCount = await Post.count();
  
  return {
    hasUsers: userCount > 0,
    hasCategories: categoryCount > 0,
    hasTags: tagCount > 0,
    hasPosts: postCount > 0,
    userCount,
    categoryCount,
    tagCount,
    postCount
  };
}

/**
 * 生成示例数据脚本
 * 包含用户、分类、标签和文章数据
 * 支持重复运行自动跳过已存在的数据
 */
async function generateSampleData() {
  try {
    console.log('开始生成示例数据...');
    
    // 检查现有数据
    const existingData = await checkDataExists();
    console.log('数据检查结果：');
    console.log(`- 用户：${existingData.userCount} 个`);
    console.log(`- 分类：${existingData.categoryCount} 个`);
    console.log(`- 标签：${existingData.tagCount} 个`);
    console.log(`- 文章：${existingData.postCount} 篇`);
    
    // 如果所有数据都已存在，提示用户并退出
    if (existingData.hasUsers && existingData.hasCategories && existingData.hasTags && existingData.hasPosts) {
      console.log('\n所有示例数据已存在，跳过数据生成。');
      console.log('如需重新生成数据，请先清空数据库或使用 force 模式。');
      return;
    }
    
    // 同步数据库
    await sequelize.sync({ force: false });
    console.log('数据库同步完成');
    
    // 创建用户（如果不存在）
    let users = [];
    if (!existingData.hasUsers) {
      console.log('创建用户数据...');
      users = await User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // 会被自动加密
        nickname: '系统管理员',
        avatar: '/uploads/avatars/admin.jpg',
        role: 'admin',
        status: 'active',
        email_verified: true
      },
      {
        username: 'author1',
        email: 'author1@example.com',
        password: 'author123',
        nickname: '技术博主',
        avatar: '/uploads/avatars/author1.jpg',
        role: 'user',
        status: 'active',
        email_verified: true
      },
      {
        username: 'author2',
        email: 'author2@example.com',
        password: 'author123',
        nickname: '生活分享家',
        avatar: '/uploads/avatars/author2.jpg',
        role: 'user',
        status: 'active',
        email_verified: true
      }
    ], { validate: true });
      console.log(`创建了 ${users.length} 个用户`);
    } else {
      // 如果用户已存在，获取现有用户
      users = await User.findAll();
      console.log(`使用现有用户数据：${users.length} 个用户`);
    }
    
    // 创建分类（如果不存在）
    let categories = [];
    if (!existingData.hasCategories) {
      console.log('创建分类数据...');
      categories = await Category.bulkCreate([
      {
        name: '前端开发',
        slug: 'frontend',
        description: '前端技术相关文章',
        sort_order: 1
      },
      {
        name: '后端开发',
        slug: 'backend',
        description: '后端技术相关文章',
        sort_order: 2
      },
      {
        name: '数据库',
        slug: 'database',
        description: '数据库技术相关文章',
        sort_order: 3
      },
      {
        name: '生活随笔',
        slug: 'life',
        description: '生活感悟和随笔',
        sort_order: 4
      },
      {
        name: '技术分享',
        slug: 'tech-share',
        description: '技术经验和分享',
        sort_order: 5
      }
    ], { validate: true });
      console.log(`创建了 ${categories.length} 个分类`);
    } else {
      // 如果分类已存在，获取现有分类
      categories = await Category.findAll();
      console.log(`使用现有分类数据：${categories.length} 个分类`);
    }
    
    // 创建标签（如果不存在）
    let tags = [];
    if (!existingData.hasTags) {
      console.log('创建标签数据...');
      tags = await Tag.bulkCreate([
      {
        name: 'JavaScript',
        slug: 'javascript',
        color: '#F7DF1E'
      },
      {
        name: 'Vue.js',
        slug: 'vuejs',
        color: '#4FC08D'
      },
      {
        name: 'React',
        slug: 'react',
        color: '#61DAFB'
      },
      {
        name: 'Node.js',
        slug: 'nodejs',
        color: '#339933'
      },
      {
        name: 'Python',
        slug: 'python',
        color: '#3776AB'
      },
      {
        name: 'MySQL',
        slug: 'mysql',
        color: '#4479A1'
      },
      {
        name: 'Docker',
        slug: 'docker',
        color: '#2496ED'
      },
      {
        name: 'Git',
        slug: 'git',
        color: '#F05032'
      }
    ], { validate: true });
      console.log(`创建了 ${tags.length} 个标签`);
    } else {
      // 如果标签已存在，获取现有标签
      tags = await Tag.findAll();
      console.log(`使用现有标签数据：${tags.length} 个标签`);
    }
    
    // 创建文章（如果不存在）
    let posts = [];
    if (!existingData.hasPosts) {
      console.log('创建文章数据...');
      posts = await Post.bulkCreate([
      {
        title: 'Vue 3 组合式 API 入门指南',
        slug: 'vue3-composition-api-guide',
        summary: '详细介绍 Vue 3 组合式 API 的使用方法和最佳实践',
        content: `# Vue 3 组合式 API 入门指南

Vue 3 引入了组合式 API，这是一种更灵活的组织组件逻辑的方式。相比选项式 API，组合式 API 提供了更好的类型推断、代码组织和复用能力。

## 什么是组合式 API？

组合式 API 是一系列 API 的集合，使我们可以使用函数而不是声明选项的方式来书写 Vue 组件。

## 基本用法

\`\`\`javascript
import { ref, reactive, onMounted } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const state = reactive({
      message: 'Hello Vue 3'
    })
    
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    return {
      count,
      state
    }
  }
}
\`\`\`

## 优势

1. 更好的逻辑复用
2. 更灵活的代码组织
3. 更好的 TypeScript 支持
4. 更小的打包体积

组合式 API 是 Vue 3 的核心特性之一，建议所有新项目都采用这种方式进行开发。`,
        cover_image: '/uploads/covers/vue3-guide.jpg',
        author_id: users[1].id, // author1
        category_id: categories[0].id, // 前端开发
        status: 'published',
        is_featured: true,
        view_count: 156,
        published_at: new Date('2024-01-15 10:00:00')
      },
      {
        title: 'Node.js 性能优化实践',
        slug: 'nodejs-performance-optimization',
        summary: '分享 Node.js 应用性能优化的实用技巧和经验',
        content: `# Node.js 性能优化实践

Node.js 作为服务端 JavaScript 运行时，在性能优化方面有很多值得注意的地方。本文将分享一些实用的性能优化技巧。

## 内存管理

Node.js 使用 V8 引擎，内存管理是性能优化的关键。

### 避免内存泄漏

\`\`\`javascript
// 错误的做法：未清理的定时器
setInterval(() => {
  // 一些操作
}, 1000)

// 正确的做法：及时清理
const interval = setInterval(() => {
  // 一些操作
}, 1000)

// 在适当的时候清理
clearInterval(interval)
\`\`\`

## 异步编程优化

使用 async/await 时要注意错误处理和性能。

## 数据库优化

合理使用连接池和查询优化。

通过以上优化措施，可以显著提升 Node.js 应用的性能。`,
        cover_image: '/uploads/covers/nodejs-optimization.jpg',
        author_id: users[0].id, // admin
        category_id: categories[1].id, // 后端开发
        status: 'published',
        is_featured: true,
        view_count: 89,
        published_at: new Date('2024-01-20 14:30:00')
      },
      {
        title: 'MySQL 索引优化指南',
        slug: 'mysql-index-optimization-guide',
        summary: '深入讲解 MySQL 索引的原理和优化策略',
        content: `# MySQL 索引优化指南

索引是数据库性能优化的核心，正确的索引设计可以大幅提升查询性能。

## 索引类型

### B-Tree 索引

最常用的索引类型，适用于等值查询和范围查询。

### 哈希索引

适用于等值查询，但不支持范围查询。

## 索引优化策略

1. **选择合适的索引列**
   - 高选择性的列
   - 经常用于 WHERE 条件的列
   - 经常用于 JOIN 的列

2. **避免过度索引**
   - 每个索引都会增加写操作的开销
   - 只创建必要的索引

3. **使用复合索引**
   - 遵循最左前缀原则
   - 合理排序索引列

## 示例

\`\`\`sql
-- 创建复合索引
CREATE INDEX idx_user_category ON posts(user_id, category_id);

-- 查询优化
EXPLAIN SELECT * FROM posts WHERE user_id = 1 AND category_id = 2;
\`\`\`

通过合理的索引设计，可以显著提升数据库查询性能。`,
        cover_image: '/uploads/covers/mysql-index.jpg',
        author_id: users[1].id, // author1
        category_id: categories[2].id, // 数据库
        status: 'published',
        is_featured: false,
        view_count: 67,
        published_at: new Date('2024-01-25 09:15:00')
      },
      {
        title: '编程学习的心路历程',
        slug: 'programming-learning-journey',
        summary: '分享个人学习编程的经历和感悟',
        content: `# 编程学习的心路历程

学习编程是一段充满挑战和收获的旅程。从最初的 Hello World 到现在的全栈开发，每一步都值得记录。

## 初识编程

还记得第一次接触编程是在大学时期，面对黑白的命令行界面，充满了好奇和困惑。

## 克服困难

学习过程中遇到了很多困难，比如：
- 理解面向对象的概念
- 调试复杂的程序错误
- 学习算法和数据结构

## 成长收获

经过多年的学习和实践，逐渐掌握了：
- 多种编程语言
- 系统设计能力
- 团队协作经验

编程不仅是一门技术，更是一种思维方式。它教会了我如何分析问题、分解问题和解决问题。`,
        cover_image: '/uploads/covers/learning-journey.jpg',
        author_id: users[2].id, // author2
        category_id: categories[3].id, // 生活随笔
        status: 'published',
        is_featured: false,
        view_count: 34,
        published_at: new Date('2024-02-01 16:45:00')
      },
      {
        title: 'Docker 容器化部署实践',
        slug: 'docker-container-deployment',
        summary: '使用 Docker 进行应用容器化部署的完整流程',
        content: `# Docker 容器化部署实践

Docker 已经成为现代应用部署的标准工具，本文将分享完整的容器化部署流程。

## Docker 基础

### 镜像和容器

- **镜像**：应用的打包格式
- **容器**：镜像的运行实例

## 部署流程

### 1. 编写 Dockerfile

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### 2. 构建镜像

\`\`\`bash
docker build -t my-app .
\`\`\`

### 3. 运行容器

\`\`\`bash
docker run -d -p 3000:3000 my-app
\`\`\`

## 最佳实践

- 使用多阶段构建减小镜像大小
- 合理设置环境变量
- 使用健康检查

Docker 大大简化了应用的部署和维护流程。`,
        cover_image: '/uploads/covers/docker-deployment.jpg',
        author_id: users[0].id, // admin
        category_id: categories[4].id, // 技术分享
        status: 'published',
        is_featured: true,
        view_count: 123,
        published_at: new Date('2024-02-05 11:20:00')
      }
    ], { validate: true });
      console.log(`创建了 ${posts.length} 篇文章`);
      
      // 建立文章和标签的关联关系
      console.log('建立文章标签关联...');
      
      // 为每篇文章添加标签
      await posts[0].setTags([tags[0], tags[1]]); // Vue 3 文章：JavaScript, Vue.js
      await posts[1].setTags([tags[3], tags[6]]); // Node.js 文章：Node.js, Docker
      await posts[2].setTags([tags[5]]); // MySQL 文章：MySQL
      await posts[3].setTags([tags[7]]); // 学习历程文章：Git
      await posts[4].setTags([tags[6], tags[7]]); // Docker 文章：Docker, Git
      
      console.log('文章标签关联建立完成');
    } else {
      // 如果文章已存在，获取现有文章
      posts = await Post.findAll();
      console.log(`使用现有文章数据：${posts.length} 篇文章`);
    }
    
    console.log('\n示例数据生成完成！');
    console.log('===================');
    console.log('当前数据统计：');
    console.log(`- 用户：${users.length} 个`);
    console.log(`- 分类：${categories.length} 个`);
    console.log(`- 标签：${tags.length} 个`);
    console.log(`- 文章：${posts.length} 篇`);
    console.log('===================');
    
    // 显示管理员登录信息（仅当创建了新用户时）
    if (!existingData.hasUsers) {
      console.log('\n管理员登录信息：');
      console.log('用户名：admin');
      console.log('密码：admin123');
      console.log('邮箱：admin@example.com');
    }
    
  } catch (error) {
    console.error('生成示例数据时出错：', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 如果直接运行此脚本，则执行生成函数
if (require.main === module) {
  generateSampleData();
}

module.exports = generateSampleData;