const express = require('express');
const router = express.Router();
const statsController = require('../../controllers/statsController');

/**
 * @swagger
 * /api/v1/stats:
 *   get:
 *     summary: 获取博客统计数据
 *     description: 获取博客整体统计信息，包括文章总数、标签总数和总访问量
 *     tags: [Stats]
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
 *                   properties:
 *                     totalPosts:
 *                       type: integer
 *                       description: 已发布文章总数
 *                       example: 50
 *                     totalTags:
 *                       type: integer
 *                       description: 标签总数
 *                       example: 20
 *                     totalViews:
 *                       type: integer
 *                       description: 总访问量
 *                       example: 10000
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', statsController.getStats);

/**
 * @swagger
 * /api/v1/stats/posts:
 *   get:
 *     summary: 获取文章统计信息
 *     description: 获取按状态分组的文章统计信息
 *     tags: [Stats]
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
 *                   properties:
 *                     published:
 *                       type: integer
 *                       description: 已发布文章数
 *                       example: 45
 *                     draft:
 *                       type: integer
 *                       description: 草稿文章数
 *                       example: 5
 *                     archived:
 *                       type: integer
 *                       description: 已归档文章数
 *                       example: 10
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/posts', statsController.getPostStats);

/**
 * @swagger
 * /api/v1/stats/post/{id}/view:
 *   post:
 *     summary: 增加文章浏览量
 *     description: 增加指定文章的浏览量计数
 *     tags: [Stats]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文章ID
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
 *                   example: 浏览量已更新
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/post/:id/view', statsController.incrementPostView);

module.exports = router;
