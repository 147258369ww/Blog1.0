const { File } = require('../models');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const { generateFileUrl } = require('../utils/urlHelper');

class FileService {
  /**
   * 保存文件元数据到数据库
   * @param {Object} fileData - 文件数据
   * @param {number} uploaderId - 上传者 ID
   * @param {Object} req - Express 请求对象（用于生成完整 URL）
   * @returns {Promise<Object>} 文件记录
   */
  async saveFileMetadata(fileData, uploaderId, req = null) {
    try {
      const { filename, originalname, mimetype, size, path: filePath } = fileData;
      
      // 确定文件类型
      let fileType = 'other';
      if (mimetype.startsWith('image/')) {
        fileType = 'image';
      } else if (
        mimetype.includes('pdf') ||
        mimetype.includes('document') ||
        mimetype.includes('text') ||
        mimetype.includes('msword') ||
        mimetype.includes('spreadsheet')
      ) {
        fileType = 'document';
      }
      
      // 生成相对路径
      const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');
      const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
      
      // 生成完整的访问 URL（根据环境自动适配）
      const url = generateFileUrl(normalizedPath, req);
      
      // 保存到数据库
      const file = await File.create({
        filename,
        original_name: originalname,
        mime_type: mimetype,
        size,
        path: filePath,
        url, // 保存完整 URL
        file_type: fileType,
        uploader_id: uploaderId,
      });
      
      logger.info(`File metadata saved: ${filename} by user ${uploaderId}, URL: ${url}`);
      return file;
    } catch (error) {
      logger.error('Error saving file metadata:', error);
      throw error;
    }
  }

  /**
   * 获取文件列表
   * @param {Object} filters - 筛选条件
   * @param {Object} pagination - 分页参数
   * @returns {Promise<Object>} 文件列表和分页信息
   */
  async getFiles(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;
      
      const where = {};
      
      // 按文件类型筛选
      if (filters.fileType) {
        where.file_type = filters.fileType;
      }
      
      // 按上传者筛选
      if (filters.uploaderId) {
        where.uploader_id = filters.uploaderId;
      }
      
      const { count, rows } = await File.findAndCountAll({
        where,
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [
          {
            association: 'uploader',
            attributes: ['id', 'username', 'nickname', 'email'],
          },
        ],
      });
      
      return {
        files: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting files:', error);
      throw error;
    }
  }

  /**
   * 根据 ID 获取文件
   * @param {number} fileId - 文件 ID
   * @returns {Promise<Object>} 文件记录
   */
  async getFileById(fileId) {
    try {
      const file = await File.findByPk(fileId, {
        include: [
          {
            association: 'uploader',
            attributes: ['id', 'username', 'nickname', 'email'],
          },
        ],
      });
      
      return file;
    } catch (error) {
      logger.error('Error getting file by ID:', error);
      throw error;
    }
  }

  /**
   * 删除文件（文件系统 + 数据库）
   * @param {number} fileId - 文件 ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteFile(fileId) {
    try {
      // 查找文件记录
      const file = await File.findByPk(fileId);
      
      if (!file) {
        throw new Error('文件不存在');
      }
      
      // 删除文件系统中的文件
      try {
        await fs.unlink(file.path);
        logger.info(`File deleted from filesystem: ${file.path}`);
      } catch (fsError) {
        // 如果文件不存在，记录警告但继续删除数据库记录
        if (fsError.code === 'ENOENT') {
          logger.warn(`File not found in filesystem: ${file.path}`);
        } else {
          throw fsError;
        }
      }
      
      // 删除数据库记录
      await file.destroy();
      logger.info(`File record deleted from database: ${fileId}`);
      
      return true;
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * 批量删除文件
   * @param {Array<number>} fileIds - 文件 ID 数组
   * @returns {Promise<Object>} 删除结果
   */
  async deleteFiles(fileIds) {
    try {
      const results = {
        success: [],
        failed: [],
      };
      
      for (const fileId of fileIds) {
        try {
          await this.deleteFile(fileId);
          results.success.push(fileId);
        } catch (error) {
          results.failed.push({ fileId, error: error.message });
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error deleting files:', error);
      throw error;
    }
  }
}

module.exports = new FileService();
