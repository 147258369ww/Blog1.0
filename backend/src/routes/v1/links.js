const express = require('express');
const router = express.Router();
const linkController = require('../../controllers/linkController');

/**
 * @swagger
 * /api/v1/links:
 *   get:
 *     summary: 获取活跃友链列表
 *     description: 获取所有状态为活跃的友情链接列表
 *     tags: [Links]
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
 *                         example: 示例网站
 *                       url:
 *                         type: string
 *                         format: uri
 *                         example: https://example.com
 *                       description:
 *                         type: string
 *                         example: 这是一个示例网站
 *                       logo:
 *                         type: string
 *                         format: uri
 *                         example: https://example.com/logo.png
 *                       sort_order:
 *                         type: integer
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', linkController.getActiveLinks);

module.exports = router;
