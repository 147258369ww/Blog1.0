#!/usr/bin/env node
/**
 * 创建管理员用户脚本
 * 使用方法: node scripts/create-admin.js
 */

const readline = require('readline');
const { sequelize, User } = require('../src/models');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 提示输入
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// 验证邮箱格式
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证密码强度
const isValidPassword = (password) => {
  // 至少8个字符，包含大小写字母和数字
  return password.length >= 8 && 
         /[a-z]/.test(password) && 
         /[A-Z]/.test(password) && 
         /[0-9]/.test(password);
};

async function createAdmin() {
  try {
    console.log('\n=== 创建管理员用户 ===\n');

    // 输入用户名
    let username;
    while (true) {
      username = await question('请输入用户名 (3-50个字符): ');
      if (username.length >= 3 && username.length <= 50) {
        // 检查用户名是否已存在
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
          console.log('❌ 用户名已存在，请使用其他用户名');
          continue;
        }
        break;
      }
      console.log('❌ 用户名长度必须在3-50个字符之间');
    }

    // 输入邮箱
    let email;
    while (true) {
      email = await question('请输入邮箱地址: ');
      if (isValidEmail(email)) {
        // 检查邮箱是否已存在
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          console.log('❌ 邮箱已被使用，请使用其他邮箱');
          continue;
        }
        break;
      }
      console.log('❌ 邮箱格式不正确');
    }

    // 输入密码
    let password;
    while (true) {
      password = await question('请输入密码 (至少8位，包含大小写字母和数字): ');
      if (isValidPassword(password)) {
        const confirmPassword = await question('请再次输入密码确认: ');
        if (password === confirmPassword) {
          break;
        }
        console.log('❌ 两次输入的密码不一致');
      } else {
        console.log('❌ 密码强度不够，必须至少8位且包含大小写字母和数字');
      }
    }

    // 输入昵称（可选）
    const nickname = await question('请输入昵称 (可选，直接回车跳过): ') || username;

    // 确认信息
    console.log('\n=== 请确认以下信息 ===');
    console.log(`用户名: ${username}`);
    console.log(`邮箱: ${email}`);
    console.log(`昵称: ${nickname}`);
    console.log(`角色: 管理员 (admin)`);
    
    const confirm = await question('\n确认创建？(y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ 已取消创建');
      rl.close();
      process.exit(0);
    }

    // 创建管理员用户
    console.log('\n正在创建管理员用户...');
    
    // 注意：不需要手动加密密码，User 模型的 beforeCreate hook 会自动处理
    const admin = await User.create({
      username,
      email,
      password, // 直接使用明文密码，让模型的 hook 来加密
      nickname,
      role: 'admin',
      status: 'active',
      email_verified: true,
    });

    console.log('\n✅ 管理员用户创建成功！');
    console.log('\n=== 登录信息 ===');
    console.log(`用户名/邮箱: ${username} / ${email}`);
    console.log(`密码: ${password}`);
    console.log(`用户ID: ${admin.id}`);
    console.log('\n⚠️  请妥善保管登录信息，建议首次登录后立即修改密码！\n');

  } catch (error) {
    console.error('\n❌ 创建管理员用户失败:', error.message);
    if (error.name === 'SequelizeValidationError') {
      error.errors.forEach(err => {
        console.error(`  - ${err.message}`);
      });
    }
  } finally {
    rl.close();
    await sequelize.close();
  }
}

// 运行脚本
createAdmin();
