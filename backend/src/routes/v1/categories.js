const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/categoryController');

/**
 * @swagger
 * /api/v1/categories/tree:
 *   get:
 *     summary: 获取分类树
 *     description: 获取层级结构的分类树，包含父子关系
 *     tags: [Categories]
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
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       description:
 *                         type: string
 *                       parent_id:
 *                         type: integer
 *                         nullable: true
 *                       children:
 *                         type: array
 *                         items:
 *                           type: object
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/tree', categoryController.getCategoryTree);

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: 获取分类列表
 *     description: 获取所有分类的列表
 *     tags: [Categories]
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
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       description:
 *                         type: string
 *                       parent_id:
 *                         type: integer
 *                         nullable: true
 *                       sort_order:
 *                         type: integer
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', categoryController.getCategories);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: 获取分类详情
 *     description: 获取指定ID的分类详情，包含该分类下的文章数量
 *     tags: [Categories]
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
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     description:
 *                       type: string
 *                     parent_id:
 *                       type: integer
 *                       nullable: true
 *                     sort_order:
 *                       type: integer
 *                     post_count:
 *                       type: integer
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', categoryController.getCategory);

/**
 * @swagger
 * /api/v1/categories/{id}/posts:
 *   get:
 *     summary: 获取分类下的文章
 *     description: 获取指定分类下的所有已发布文章
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 分类ID
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
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: published_at
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 排序顺序
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
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id/posts', categoryController.getCategoryPosts);

module.exports = router;
