const express = require('express');
const router = express.Router();
const categoryController = require('../../../controllers/categoryController');
const authenticate = require('../../../middlewares/auth');
const requireAdmin = require('../../../middlewares/admin');

// 所有管理员路由都需要认证和管理员权限
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/v1/admin/categories:
 *   get:
 *     summary: 获取所有分类列表
 *     description: 获取所有分类列表（管理员视图）
 *     tags: [Admin - Categories]
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
router.get('/', categoryController.getCategories);

/**
 * @swagger
 * /api/v1/admin/categories/tree:
 *   get:
 *     summary: 获取分类树
 *     description: 获取包含层级结构的完整分类树
 *     tags: [Admin - Categories]
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
router.get('/tree', categoryController.getCategoryTree);

/**
 * @swagger
 * /api/v1/admin/categories/{id}:
 *   get:
 *     summary: 获取分类详情
 *     description: 获取指定ID的分类详情
 *     tags: [Admin - Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
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
router.get('/:id', categoryController.getCategory);

/**
 * @swagger
 * /api/v1/admin/categories:
 *   post:
 *     summary: 创建分类
 *     description: 创建新的文章分类
 *     tags: [Admin - Categories]
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
 *                 description: 分类名称
 *                 example: 技术分享
 *               slug:
 *                 type: string
 *                 description: URL友好标识（唯一）
 *                 example: tech-sharing
 *               description:
 *                 type: string
 *                 description: 分类描述
 *                 example: 技术相关的文章分类
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *                 description: 父分类ID（用于创建子分类）
 *                 example: null
 *               sort_order:
 *                 type: integer
 *                 default: 0
 *                 description: 排序顺序
 *                 example: 0
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
router.post('/', categoryController.createCategory);

/**
 * @swagger
 * /api/v1/admin/categories/{id}:
 *   put:
 *     summary: 更新分类
 *     description: 更新指定ID的分类信息
 *     tags: [Admin - Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
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
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *                 nullable: true
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
router.put('/:id', categoryController.updateCategory);

/**
 * @swagger
 * /api/v1/admin/categories/{id}:
 *   delete:
 *     summary: 删除分类
 *     description: 删除指定ID的分类（需要先检查是否有文章关联）
 *     tags: [Admin - Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
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
 *                   example: 分类删除成功
 *       400:
 *         description: 该分类下有文章，无法删除
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', categoryController.deleteCategory);

/**
 * @swagger
 * /api/v1/admin/categories/sort:
 *   put:
 *     summary: 更新分类排序
 *     description: 批量更新分类的排序权重
 *     tags: [Admin - Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - id
 *                 - sort
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: 分类ID
 *                 sort:
 *                   type: integer
 *                   description: 排序权重
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/sort', categoryController.updateCategorySort);

module.exports = router;
