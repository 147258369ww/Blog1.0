const express = require('express');
const router = express.Router();
const postController = require('../../../controllers/postController');
const authenticate = require('../../../middlewares/auth');
const requireAdmin = require('../../../middlewares/admin');

// 所有管理员路由都需要认证和管理员权限
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/v1/admin/posts:
 *   get:
 *     summary: 获取所有文章列表
 *     description: 获取所有文章列表，包括草稿、已发布、已归档和已删除的文章
 *     tags: [Admin - Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: 文章状态筛选
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: 分类ID筛选
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含已删除的文章
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
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', postController.getAllPosts);

/**
 * @swagger
 * /api/v1/admin/posts/{id}:
 *   get:
 *     summary: 获取文章详情
 *     description: 获取指定ID的文章详情（包括草稿和已删除的文章）
 *     tags: [Admin - Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
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
router.get('/:id', postController.getPost);

/**
 * @swagger
 * /api/v1/admin/posts:
 *   post:
 *     summary: 创建文章
 *     description: 创建新文章，可以设置为草稿或直接发布
 *     tags: [Admin - Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category_id
 *             properties:
 *               title:
 *                 type: string
 *                 description: 文章标题
 *                 example: 我的第一篇博客
 *               slug:
 *                 type: string
 *                 description: URL友好标识（可选，不提供则自动生成）
 *                 example: my-first-blog
 *               summary:
 *                 type: string
 *                 description: 文章摘要
 *                 example: 这是我的第一篇博客文章
 *               content:
 *                 type: string
 *                 description: 文章内容（Markdown格式）
 *                 example: "# 标题\n\n这是内容..."
 *               cover_image:
 *                 type: string
 *                 description: 封面图片URL
 *                 example: /uploads/images/cover.jpg
 *               category_id:
 *                 type: integer
 *                 description: 分类ID
 *                 example: 1
 *               tag_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 标签ID数组
 *                 example: [1, 2, 3]
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 default: draft
 *                 description: 文章状态
 *               is_featured:
 *                 type: boolean
 *                 default: false
 *                 description: 是否精选
 *               allow_comments:
 *                 type: boolean
 *                 default: true
 *                 description: 是否允许评论
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
router.post('/', postController.createPost);

/**
 * @swagger
 * /api/v1/admin/posts/{id}:
 *   put:
 *     summary: 更新文章
 *     description: 更新指定ID的文章信息
 *     tags: [Admin - Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               summary:
 *                 type: string
 *               content:
 *                 type: string
 *               cover_image:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               tag_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               is_featured:
 *                 type: boolean
 *               allow_comments:
 *                 type: boolean
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
 *                 data:
 *                   type: object
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
router.put('/:id', postController.updatePost);

/**
 * @swagger
 * /api/v1/admin/posts/{id}:
 *   delete:
 *     summary: 删除文章
 *     description: 软删除指定ID的文章（可以恢复）
 *     tags: [Admin - Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
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
 *                   example: 文章删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', postController.deletePost);

/**
 * @swagger
 * /api/v1/admin/posts/{id}/status:
 *   patch:
 *     summary: 更新文章状态
 *     description: 更新指定ID的文章状态
 *     tags: [Admin - Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 description: 文章状态
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
 *                 data:
 *                   type: object
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
router.patch('/:id/status', postController.updatePostStatus);

/**
 * @swagger
 * /api/v1/admin/posts/{id}/restore:
 *   post:
 *     summary: 恢复已删除的文章
 *     description: 恢复指定ID的已删除文章
 *     tags: [Admin - Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
 *     responses:
 *       200:
 *         description: 恢复成功
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
 *                   example: 文章恢复成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:id/restore', postController.restorePost);

module.exports = router;
