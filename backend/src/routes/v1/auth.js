const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const authenticate = require('../../middlewares/auth');
const validate = require('../../middlewares/validator');
const RateLimitMiddleware = require('../../middlewares/rateLimit');
const {
  registerValidation,
  verifyValidation,
  loginValidation,
  refreshTokenValidation,
  changePasswordValidation,
} = require('../../validators/authValidator');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: 发送注册验证码
 *     description: 验证邮箱格式和唯一性后，生成6位数字验证码并发送到用户邮箱
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 用户邮箱地址
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: 验证码发送成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 验证码已发送到邮箱
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/register', RateLimitMiddleware.sendVerificationCode(), registerValidation, validate, authController.register);

/**
 * @swagger
 * /api/v1/auth/verify:
 *   post:
 *     summary: 验证验证码并完成注册
 *     description: 验证邮箱验证码并创建用户账号
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 用户邮箱地址
 *                 example: user@example.com
 *               code:
 *                 type: string
 *                 description: 6位数字验证码
 *                 example: "123456"
 *               username:
 *                 type: string
 *                 description: 用户名（唯一）
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码（至少8个字符，包含字母和数字）
 *                 example: Password123
 *               nickname:
 *                 type: string
 *                 description: 昵称（可选）
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: johndoe
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         nickname:
 *                           type: string
 *                           example: John Doe
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/verify', RateLimitMiddleware.register(), verifyValidation, validate, authController.verify);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: 用户登录
 *     description: 使用邮箱和密码登录，返回访问令牌和刷新令牌
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 用户邮箱地址
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 用户密码
 *                 example: Password123
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: 访问令牌（有效期30分钟）
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken:
 *                       type: string
 *                       description: 刷新令牌（有效期7天）
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: johndoe
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         role:
 *                           type: string
 *                           example: user
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', RateLimitMiddleware.login(), loginValidation, validate, authController.login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: 刷新访问令牌
 *     description: 使用刷新令牌获取新的访问令牌
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: 刷新令牌
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: 令牌刷新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: 新的访问令牌
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/refresh', refreshTokenValidation, validate, authController.refresh);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: 用户登出
 *     description: 登出当前用户，删除刷新令牌
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 登出成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/v1/auth/password:
 *   put:
 *     summary: 修改密码
 *     description: 修改当前用户的密码，需要提供旧密码
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: 旧密码
 *                 example: OldPassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: 新密码（至少8个字符，包含字母和数字）
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: 密码修改成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 密码修改成功
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/password', authenticate, changePasswordValidation, validate, authController.changePassword);

module.exports = router;
