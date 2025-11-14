const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/authController');
const authenticate = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validator');
const RateLimitMiddleware = require('../../../middlewares/rateLimit');
const {
  loginValidation,
  refreshTokenValidation,
  changePasswordValidation,
} = require('../../../validators/authValidator');

/**
 * @swagger
 * /api/v1/admin/auth/login:
 *   post:
 *     summary: 管理员登录
 *     description: 使用邮箱和密码登录管理后台，返回访问令牌和刷新令牌
 *     tags: [Admin - Auth]
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
 *                 description: 管理员邮箱地址
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 管理员密码
 *                 example: AdminPassword123
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
 *                       description: 访问令牌
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken:
 *                       type: string
 *                       description: 刷新令牌
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         username:
 *                           type: string
 *                           example: admin
 *                         email:
 *                           type: string
 *                           example: admin@example.com
 *                         role:
 *                           type: string
 *                           example: admin
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 权限不足，非管理员账号
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', RateLimitMiddleware.login(), loginValidation, validate, authController.adminLogin);

/**
 * @swagger
 * /api/v1/admin/auth/refresh:
 *   post:
 *     summary: 刷新管理员访问令牌
 *     description: 使用刷新令牌获取新的访问令牌
 *     tags: [Admin - Auth]
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/refresh', refreshTokenValidation, validate, authController.refresh);

/**
 * @swagger
 * /api/v1/admin/auth/logout:
 *   post:
 *     summary: 管理员登出
 *     description: 登出当前管理员，删除刷新令牌
 *     tags: [Admin - Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @swagger
 * /api/v1/admin/auth/password:
 *   put:
 *     summary: 修改管理员密码
 *     description: 修改当前管理员的密码
 *     tags: [Admin - Auth]
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
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: 密码修改成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/password', authenticate, changePasswordValidation, validate, authController.changePassword);

module.exports = router;
