const express = require('express');
const router = express.Router();
const fileController = require('../../../controllers/fileController');
const { upload } = require('../../../middlewares/upload');
const auth = require('../../../middlewares/auth');
const admin = require('../../../middlewares/admin');

/**
 * @swagger
 * /api/v1/admin/files/upload:
 *   post:
 *     summary: 上传文件
 *     tags: [Admin - Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的文件（图片最大5MB，其他文件最大10MB）
 *     responses:
 *       201:
 *         description: 文件上传成功
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
 *                     filename:
 *                       type: string
 *                     original_name:
 *                       type: string
 *                     mime_type:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     url:
 *                       type: string
 *                     file_type:
 *                       type: string
 *                       enum: [image, document, other]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 请求错误（未选择文件或文件类型/大小不符合要求）
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 */
router.post('/upload', auth, admin, upload.single('file'), fileController.uploadFile);

/**
 * @swagger
 * /api/v1/admin/files:
 *   get:
 *     summary: 获取文件列表
 *     tags: [Admin - Files]
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
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *           enum: [image, document, other]
 *         description: 文件类型筛选
 *       - in: query
 *         name: uploaderId
 *         schema:
 *           type: integer
 *         description: 上传者ID筛选
 *     responses:
 *       200:
 *         description: 文件列表
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
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 */
router.get('/', auth, admin, fileController.getFiles);

/**
 * @swagger
 * /api/v1/admin/files/{id}:
 *   get:
 *     summary: 获取文件详情
 *     tags: [Admin - Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文件ID
 *     responses:
 *       200:
 *         description: 文件详情
 *       404:
 *         description: 文件不存在
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 */
router.get('/:id', auth, admin, fileController.getFileById);

/**
 * @swagger
 * /api/v1/admin/files/{id}:
 *   delete:
 *     summary: 删除文件
 *     tags: [Admin - Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 文件ID
 *     responses:
 *       200:
 *         description: 文件删除成功
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
 *                   example: 文件删除成功
 *       404:
 *         description: 文件不存在
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限
 */
router.delete('/:id', auth, admin, fileController.deleteFile);

module.exports = router;
