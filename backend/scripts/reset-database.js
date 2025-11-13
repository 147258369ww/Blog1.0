#!/usr/bin/env node

/**
 * 数据库重置脚本
 * 用于清理数据库并重新生成示例数据
 * 使用方法：node scripts/reset-database.js
 */

const path = require('path');
const { sequelize } = require('../src/models');

// 设置环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// 加载环境变量
require('dotenv').config({
  path: path.join(__dirname, '..', `.env.${process.env.NODE_ENV}`)
});

async function resetDatabase() {
  try {
    console.log('开始重置数据库...');
    console.log(`环境：${process.env.NODE_ENV}`);
    console.log('===================');
    
    // 确认操作（在生产环境中需要更严格的确认）
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ 生产环境不允许重置数据库！');
      process.exit(1);
    }
    
    // 同步数据库（强制重建）
    console.log('正在同步数据库表结构...');
    await sequelize.sync({ force: true });
    console.log('✅ 数据库表结构同步完成');
    
    // 生成示例数据
    console.log('正在生成示例数据...');
    const generateSampleData = require('./generate-sample-data');
    await generateSampleData();
    
    console.log('\n✅ 数据库重置完成！');
    console.log('所有数据已重新生成，可以启动应用了。');
    
  } catch (error) {
    console.error('❌ 数据库重置失败：', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 如果直接运行此脚本，则执行重置函数
if (require.main === module) {
  resetDatabase();
}

module.exports = resetDatabase;