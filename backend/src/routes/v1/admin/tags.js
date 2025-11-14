const express = require('express');
const router = express.Router();
const tagController = require('../../../controllers/tagController');
const authenticate = require('../../../middlewares/auth');
const requireAdmin = require('../../../middlewares/admin');

// 所有管理员路由都需要认证和管理员权限
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/v1/admin/tags:
 *   get:
 *     summary: 获取所有标签列表
 *     description: 获取所有标签列表（管理员视图）
 *     tags: [Admin - Tags]
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
router.get('/', tagController.getTags);

/**
 * @swagger
 * /api/v1/admin/tags/{id}:
 *   get:
 *     summary: 获取标签详情
 *     description: 获取指定ID的标签详情
 *     tags: [Admin - Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 标签ID
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
router.get('/:id', tagController.getTag);

/**
 * @swagger
 * /api/v1/admin/tags:
 *   post:
 *     summary: 创建标签
 *     description: 创建新的文章标签
 *     tags: [Admin - Tags]
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
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 description: 标签名称
 *                 example: JavaScript
 *               slug:
 *                 type: string
 *                 description: URL友好标识（唯一）
 *                 example: javascript
 *               color:
 *                 type: string
 *                 description: 标签颜色（十六进制）
 *                 example: "#3178c6"
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
router.post('/', tagController.createTag);

/**
 * @swagger
 * /api/v1/admin/tags/{id}:
 *   put:
 *     summary: 更新标签
 *     description: 更新指定ID的标签信息
 *     tags: [Admin - Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 标签ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               color:
 *                 type: string
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
router.put('/:id', tagController.updateTag);

/**
 * @swagger
 * /api/v1/admin/tags/{id}:
 *   delete:
 *     summary: 删除标签
 *     description: 删除指定ID的标签（需要先检查是否有文章关联）
 *     tags: [Admin - Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 标签ID
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
 *                   example: 标签删除成功
 *       400:
 *         description: 该标签下有文章，无法删除
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', tagController.deleteTag);

module.exports = router;
