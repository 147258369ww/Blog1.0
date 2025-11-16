const nodemailer = require('nodemailer');
const config = require('./index');
const logger = require('../utils/logger');

/**
 * 创建 Nodemailer 传输器
 * 配置 126 邮箱 SMTP 连接（smtp.126.com:465）
 */
const createTransporter = () => {
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure, // true for 465, false for other ports
      auth: {
        user: config.smtp.auth.user,
        pass: config.smtp.auth.pass,
      },
    });

    // 验证传输器配置
    transporter.verify((error, _success) => {
      if (error) {
        logger.error('Email transporter verification failed:', error);
      } else {
        logger.info('Email transporter is ready to send messages');
      }
    });

    return transporter;
  } catch (error) {
    logger.error('Failed to create email transporter:', error);
    throw error;
  }
};

// 创建并导出传输器实例
const transporter = createTransporter();

module.exports = {
  transporter,
  from: config.smtp.from,
};
