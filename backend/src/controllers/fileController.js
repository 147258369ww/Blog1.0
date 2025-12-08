const fileService = require('../services/fileService');
const logger = require('../utils/logger');

class FileController {
  /**
   * 上传文件
   * POST /api/v1/admin/files/upload
   */
  async uploadFile(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: '请选择要上传的文件',
          },
        });
      }
      
      // 传递 req 对象，用于自动检测基础 URL
      const file = await fileService.saveFileMetadata(req.file, req.user.id, req);
      
      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('file:upload', uid, {
          resourceType: 'file',
          resourceId: file.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
          filename: file.filename,
        });
      } catch (_) {}
      res.status(201).json({
        success: true,
        data: {
          id: file.id,
          filename: file.filename,
          original_name: file.original_name,
          mime_type: file.mime_type,
          size: file.size,
          url: file.url, // 返回完整 URL
          file_type: file.file_type,
          created_at: file.created_at,
        },
      });
    } catch (error) {
      logger.error('Error uploading file:', error);
      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('file:upload', uid, {
          status: 'failure',
          resourceType: 'file',
          resourceId: null,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
          error: error.message,
        });
      } catch (_) {}
      next(error);
    }
  }

  /**
   * 获取文件列表
   * GET /api/v1/admin/files
   */
  async getFiles(req, res, next) {
    try {
      const { page, limit, fileType, uploaderId } = req.query;
      
      const filters = {};
      if (fileType) {
        filters.fileType = fileType;
      }
      if (uploaderId) {
        filters.uploaderId = parseInt(uploaderId, 10);
      }
      
      const pagination = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      };
      
      const result = await fileService.getFiles(filters, pagination);
      
      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('file:list', uid, {
          resourceType: 'file',
          resourceId: null,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
        });
      } catch (_) {}
      res.json({
        success: true,
        data: result.files,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error getting files:', error);
      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('file:list', uid, {
          status: 'failure',
          resourceType: 'file',
          resourceId: null,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
          error: error.message,
        });
      } catch (_) {}
      next(error);
    }
  }

  /**
   * 获取文件详情
   * GET /api/v1/admin/files/:id
   */
  async getFileById(req, res, next) {
    try {
      const { id } = req.params;
      
      const file = await fileService.getFileById(parseInt(id, 10));
      
      if (!file) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: '文件不存在',
          },
        });
      }
      
      res.json({
        success: true,
        data: file,
      });
      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('file:get', uid, {
          resourceType: 'file',
          resourceId: id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
        });
      } catch (_) {}
    } catch (error) {
      logger.error('Error getting file:', error);
      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('file:get', uid, {
          status: 'failure',
          resourceType: 'file',
          resourceId: req.params?.id || null,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
          error: error.message,
        });
      } catch (_) {}
      next(error);
    }
  }

  /**
   * 删除文件
   * DELETE /api/v1/admin/files/:id
   */
  async deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      
      await fileService.deleteFile(parseInt(id, 10));
      
      res.json({
        success: true,
        message: '文件删除成功',
      });
      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('file:delete', uid, {
          resourceType: 'file',
          resourceId: id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
        });
      } catch (_) {}
    } catch (error) {
      if (error.message === '文件不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: error.message,
          },
        });
      }
      
      logger.error('Error deleting file:', error);
      try {
        const AuditLogger = require('../utils/audit');
        const uid = req.user?.id || null;
        AuditLogger.log('file:delete', uid, {
          status: 'failure',
          resourceType: 'file',
          resourceId: req.params?.id || null,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          route: req.originalUrl,
          method: req.method,
          error: error.message,
        });
      } catch (_) {}
      next(error);
    }
  }
}

module.exports = new FileController();
