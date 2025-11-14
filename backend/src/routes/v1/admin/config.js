const express = require('express');
const router = express.Router();
const configController = require('../../../controllers/configController');
const authenticate = require('../../../middlewares/auth');
const requireAdmin = require('../../../middlewares/admin');

// 所有管理员路由都需要认证和管理员权限
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/v1/admin/config:
 *   get:
 *     summary: 获取所有配置
 *     description: 获取系统所有配置项
 *     tags: [Admin - Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                         example: site_name
 *                       value:
 *                         type: string
 *                         example: 我的博客
 *                       type:
 *                         type: string
 *                         enum: [string, number, boolean, json]
 *                         example: string
 *                       description:
 *                         type: string
 *                         example: 网站名称
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', configController.getAllConfigs);

/**
 * @swagger
 * /api/v1/admin/config/{key}:
 *   get:
 *     summary: 获取单个配置
 *     description: 获取指定key的配置项
 *     tags: [Admin - Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: 配置键名
 *         example: site_name
 *     responses:
 *       200:
 *         description: 获取成功
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:key', configController.getConfig);

/**
 * @swagger
 * /api/v1/admin/config:
 *   put:
 *     summary: 更新配置
 *     description: 更新系统配置，支持单个或批量更新
 *     tags: [Admin - Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 description: 单个配置更新
 *                 required:
 *                   - key
 *                   - value
 *                 properties:
 *                   key:
 *                     type: string
 *                     example: site_name
 *                   value:
 *                     type: string
 *                     example: 我的新博客
 *                   type:
 *                     type: string
 *                     enum: [string, number, boolean, json]
 *                     example: string
 *                   description:
 *                     type: string
 *                     example: 网站名称
 *               - type: object
 *                 description: 批量配置更新
 *                 required:
 *                   - configs
 *                 properties:
 *                   configs:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         key:
 *                           type: string
 *                         value:
 *                           type: string
 *                         type:
 *                           type: string
 *                         description:
 *                           type: string
 *     responses:
 *       200:
 *         description: 更新成功
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
 *                   example: 配置更新成功
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/', configController.updateConfig);

/**
 * @swagger
 * /api/v1/admin/config/{key}:
 *   delete:
 *     summary: 删除配置
 *     description: 删除指定key的配置项
 *     tags: [Admin - Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: 配置键名
 *     responses:
 *       200:
 *         description: 删除成功
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
 *                   example: 配置删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:key', configController.deleteConfig);

module.exports = router;
