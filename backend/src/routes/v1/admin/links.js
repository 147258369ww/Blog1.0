const express = require('express');
const router = express.Router();
const linkController = require('../../../controllers/linkController');
const authenticate = require('../../../middlewares/auth');
const requireAdmin = require('../../../middlewares/admin');

// 所有管理员路由都需要认证和管理员权限
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/v1/admin/links:
 *   get:
 *     summary: 获取所有友链列表
 *     description: 获取所有友情链接列表，包括活跃和不活跃的
 *     tags: [Admin - Links]
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', linkController.getAllLinks);

/**
 * @swagger
 * /api/v1/admin/links/{id}:
 *   get:
 *     summary: 获取友链详情
 *     description: 获取指定ID的友链详情
 *     tags: [Admin - Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 友链ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', linkController.getLink);

/**
 * @swagger
 * /api/v1/admin/links:
 *   post:
 *     summary: 创建友链
 *     description: 创建新的友情链接
 *     tags: [Admin - Links]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - url
 *             properties:
 *               name:
 *                 type: string
 *                 description: 网站名称
 *                 example: 示例网站
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: 网站URL（需符合RFC 3986标准）
 *                 example: https://example.com
 *               description:
 *                 type: string
 *                 description: 网站描述
 *                 example: 这是一个示例网站
 *               logo:
 *                 type: string
 *                 format: uri
 *                 description: 网站Logo URL
 *                 example: https://example.com/logo.png
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *                 description: 友链状态
 *               sort_order:
 *                 type: integer
 *                 default: 0
 *                 description: 排序顺序
 *     responses:
 *       201:
 *         description: 创建成功
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
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', linkController.createLink);

/**
 * @swagger
 * /api/v1/admin/links/{id}:
 *   put:
 *     summary: 更新友链
 *     description: 更新指定ID的友链信息
 *     tags: [Admin - Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 友链ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: uri
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               sort_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', linkController.updateLink);

/**
 * @swagger
 * /api/v1/admin/links/{id}:
 *   delete:
 *     summary: 删除友链
 *     description: 删除指定ID的友链
 *     tags: [Admin - Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 友链ID
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
 *                   example: 友链删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', linkController.deleteLink);

module.exports = router;
