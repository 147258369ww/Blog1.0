const configService = require('../services/configService');
const logger = require('../utils/logger');

/**
 * 配置控制器
 * 处理系统配置相关的 HTTP 请求
 */
class ConfigController {
  /**
   * 获取所有配置（管理员接口）
   * GET /api/v1/admin/config
   */
  async getAllConfigs(req, res, next) {
    try {
      const configs = await configService.getAllConfigs(false);

      res.status(200).json({
        success: true,
        data: configs,
      });
    } catch (error) {
      logger.error('Get all configs error:', error);
      next(error);
    }
  }

  /**
   * 获取单个配置（管理员接口）
   * GET /api/v1/admin/config/:key
   */
  async getConfig(req, res, next) {
    try {
      const { key } = req.params;

      const config = await configService.getConfig(key);

      if (!config) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONFIG_NOT_FOUND',
            message: 'Configuration not found',
          },
        });
      }

      res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      logger.error('Get config error:', error);
      next(error);
    }
  }

  /**
   * 更新配置（管理员接口）
   * PUT /api/v1/admin/config
   * 
   * 支持两种更新方式：
   * 1. 批量更新：body 为配置数组 [{ key, value, type, ... }]
   * 2. 单个更新：body 为单个配置对象 { key, value, type, ... }
   */
  async updateConfig(req, res, next) {
    try {
      const configData = req.body;

      // 判断是批量更新还是单个更新
      if (Array.isArray(configData)) {
        // 批量更新
        const configs = await configService.bulkUpdateConfigs(configData);

        res.status(200).json({
          success: true,
          data: configs,
          message: `Successfully updated ${configs.length} configurations`,
        });
      } else {
        // 单个更新
        const { key, value, type, description, is_public } = configData;

        if (!key) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'MISSING_KEY',
              message: 'Configuration key is required',
            },
          });
        }

        const config = await configService.updateConfig(key, {
          value,
          type,
          description,
          is_public,
        });

        res.status(200).json({
          success: true,
          data: config,
        });
      }
    } catch (error) {
      logger.error('Update config error:', error);
      next(error);
    }
  }

  /**
   * 删除配置（管理员接口）
   * DELETE /api/v1/admin/config/:key
   */
  async deleteConfig(req, res, next) {
    try {
      const { key } = req.params;

      const result = await configService.deleteConfig(key);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Delete config error:', error);

      if (error.message === '配置不存在') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONFIG_NOT_FOUND',
            message: 'Configuration not found',
          },
        });
      }

      next(error);
    }
  }

  /**
   * 获取公开配置（公开接口）
   * GET /api/v1/config
   */
  async getPublicConfigs(req, res, next) {
    try {
      const configs = await configService.getAllConfigs(true);

      res.status(200).json({
        success: true,
        data: configs,
      });
    } catch (error) {
      logger.error('Get public configs error:', error);
      next(error);
    }
  }
}

module.exports = new ConfigController();
