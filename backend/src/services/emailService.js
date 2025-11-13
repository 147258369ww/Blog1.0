const { transporter, from } = require('../config/email');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * 邮件服务类
 * 处理邮件发送和验证码管理
 */
class EmailService {
  /**
   * 生成 6 位随机数字验证码
   * @returns {string} 6 位数字验证码
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 将验证码存储到 Redis
   * @param {string} email - 邮箱地址
   * @param {string} code - 验证码
   * @param {number} ttl - 过期时间（秒），默认 10 分钟
   */
  async storeVerificationCode(email, code, ttl = 600) {
    try {
      const key = `email_code:${email}`;
      await redisClient.setEx(key, ttl, code);
      logger.info(`Verification code stored for email: ${email}`);
    } catch (error) {
      logger.error('Failed to store verification code in Redis:', error);
      throw new Error('Failed to store verification code');
    }
  }

  /**
   * 从 Redis 获取验证码
   * @param {string} email - 邮箱地址
   * @returns {string|null} 验证码或 null
   */
  async getVerificationCode(email) {
    try {
      const key = `email_code:${email}`;
      const code = await redisClient.get(key);
      return code;
    } catch (error) {
      logger.error('Failed to get verification code from Redis:', error);
      throw new Error('Failed to retrieve verification code');
    }
  }

  /**
   * 删除 Redis 中的验证码
   * @param {string} email - 邮箱地址
   */
  async deleteVerificationCode(email) {
    try {
      const key = `email_code:${email}`;
      await redisClient.del(key);
      logger.info(`Verification code deleted for email: ${email}`);
    } catch (error) {
      logger.error('Failed to delete verification code from Redis:', error);
    }
  }

  /**
   * 生成验证码邮件 HTML 模板
   * @param {string} code - 验证码
   * @returns {string} HTML 邮件内容
   */
  generateVerificationEmailTemplate(code) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 5px;
            padding: 30px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .code-box {
            background-color: #fff;
            border: 2px dashed #4CAF50;
            border-radius: 5px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #4CAF50;
            letter-spacing: 5px;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>邮箱验证码</h2>
          </div>
          <p>您好，</p>
          <p>您正在注册博客系统账号，您的验证码是：</p>
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          <p>验证码有效期为 <strong>10 分钟</strong>，请尽快完成验证。</p>
          <p>如果这不是您的操作，请忽略此邮件。</p>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿回复。</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * 发送验证码邮件
   * @param {string} email - 收件人邮箱
   * @param {string} code - 验证码
   * @returns {Promise<Object>} 发送结果
   */
  async sendVerificationCode(email, code) {
    try {
      const mailOptions = {
        from: `"博客系统" <${from}>`,
        to: email,
        subject: '邮箱验证码 - 博客系统',
        html: this.generateVerificationEmailTemplate(code),
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}, messageId: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * 生成并发送验证码
   * @param {string} email - 收件人邮箱
   * @returns {Promise<Object>} 发送结果
   */
  async generateAndSendVerificationCode(email) {
    try {
      // 生成验证码
      const code = this.generateVerificationCode();
      
      // 存储到 Redis（10 分钟有效期）
      await this.storeVerificationCode(email, code, 600);
      
      // 发送邮件
      const result = await this.sendVerificationCode(email, code);
      
      return result;
    } catch (error) {
      logger.error(`Failed to generate and send verification code to ${email}:`, error);
      throw error;
    }
  }

  /**
   * 验证验证码
   * @param {string} email - 邮箱地址
   * @param {string} code - 用户输入的验证码
   * @returns {Promise<boolean>} 验证是否成功
   */
  async verifyCode(email, code) {
    try {
      const storedCode = await this.getVerificationCode(email);
      
      if (!storedCode) {
        logger.warn(`Verification code not found or expired for email: ${email}`);
        return false;
      }
      
      if (storedCode !== code) {
        logger.warn(`Invalid verification code for email: ${email}`);
        return false;
      }
      
      // 验证成功后删除验证码
      await this.deleteVerificationCode(email);
      logger.info(`Verification code verified successfully for email: ${email}`);
      
      return true;
    } catch (error) {
      logger.error(`Failed to verify code for email ${email}:`, error);
      throw error;
    }
  }
}

module.exports = new EmailService();
