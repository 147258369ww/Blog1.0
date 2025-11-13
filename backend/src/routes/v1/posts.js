const express = require('express');
const router = express.Router();
const postController = require('../../controllers/postController');

/**
 * @swagger
 * /api/v1/posts/search:
 *   get:
 *     summary: 搜索文章
 *     description: 使用关键词搜索已发布的文章（标题和内容），按相关度排序
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *         example: JavaScript
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
 *     responses:
 *       200:
 *         description: 搜索成功
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
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       summary:
 *                         type: string
 *                       cover_image:
 *                         type: string
 *                       view_count:
 *                         type: integer
 *                       published_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/search', postController.searchPosts);

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: 获取已发布文章列表
 *     description: 获取所有已发布的文章列表，支持分页、筛选和排序
 *     tags: [Posts]
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
 *         name: category
 *         schema:
 *           type: integer
 *         description: 分类ID筛选
 *       - in: query
 *         name: tag
 *         schema:
 *           type: integer
 *         description: 标签ID筛选
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, oldest, popular]
 *           default: latest
 *         description: 排序方式
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
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       summary:
 *                         type: string
 *                       cover_image:
 *                         type: string
 *                       view_count:
 *                         type: integer
 *                       published_at:
 *                         type: string
 *                         format: date-time
 *                       category:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', postController.getPublishedPosts);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   get:
 *     summary: 获取文章详情
 *     description: 获取指定ID的已发布文章详情，并增加浏览量
 *     tags: [Posts]
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
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     summary:
 *                       type: string
 *                     content:
 *                       type: string
 *                     cover_image:
 *                       type: string
 *                     view_count:
 *                       type: integer
 *                     is_featured:
 *                       type: boolean
 *                     allow_comments:
 *                       type: boolean
 *                     published_at:
 *                       type: string
 *                       format: date-time
 *                     author:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         username:
 *                           type: string
 *                         nickname:
 *                           type: string
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         slug:
 *                           type: string
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           color:
 *                             type: string
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', postController.getPublishedPost);

module.exports = router;
