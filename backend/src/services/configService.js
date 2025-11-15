const configRepository = require('../repositories/configRepository');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');

class ConfigService {
  constructor() {
    // 缓存键前缀
    this.CACHE_PREFIX = 'config:';
    // 缓存 TTL: 1 小时
    this.CACHE_TTL = 3600;
  }

  /**
   * 生成缓存键
   */
  getCacheKey(key) {
    return `${this.CACHE_PREFIX}${key}`;
  }

  /**
   * 获取所有配置的缓存键
   */
  getAllConfigsCacheKey() {
    return `${this.CACHE_PREFIX}all`;
  }

  /**
   * 根据 key 获取配置
   */
  async getConfig(key) {
    try {
      // 先从缓存获取
      const cacheKey = this.getCacheKey(key);
      const cachedConfig = await cacheService.get(cacheKey);

      if (cachedConfig) {
        logger.debug(`Config cache hit: ${key}`);
        return cachedConfig;
      }

      // 缓存未命中，从数据库查询
      logger.debug(`Config cache miss: ${key}`);
      const config = await configRepository.findByKey(key);

      if (!config) {
        return null;
      }

      // 解析配置值
      const parsedConfig = {
        key: config.key,
        value: config.getParsedValue(),
        type: config.type,
        description: config.description,
        is_public: config.is_public,
      };

      // 存入缓存
      await cacheService.set(cacheKey, parsedConfig, this.CACHE_TTL);

      return parsedConfig;
    } catch (error) {
      logger.error('Error getting config:', error);
      throw error;
    }
  }

  /**
   * 获取所有配置
   */
  async getAllConfigs(isPublicOnly = false) {
    try {
      // 先从缓存获取
      const cacheKey = isPublicOnly 
        ? `${this.getAllConfigsCacheKey()}:public`
        : this.getAllConfigsCacheKey();
      
      const cachedConfigs = await cacheService.get(cacheKey);

      if (cachedConfigs) {
        logger.debug('All configs cache hit');
        return cachedConfigs;
      }

      // 缓存未命中，从数据库查询
      logger.debug('All configs cache miss');
      const filters = isPublicOnly ? { is_public: true } : {};
      const configs = await configRepository.findAll(filters);

      // 解析所有配置值
      const parsedConfigs = configs.map(config => ({
        key: config.key,
        value: config.getParsedValue(),
        type: config.type,
        description: config.description,
        is_public: config.is_public,
      }));

      // 存入缓存
      await cacheService.set(cacheKey, parsedConfigs, this.CACHE_TTL);

      return parsedConfigs;
    } catch (error) {
      logger.error('Error getting all configs:', error);
      throw error;
    }
  }

  /**
   * 更新单个配置
   */
  async updateConfig(key, configData) {
    try {
      const { value, type, description, is_public } = configData;

      // 查找配置
      let config = await configRepository.findByKey(key);

      if (!config) {
        // 如果配置不存在，创建新配置
        config = await configRepository.create({
          key,
          value: this.serializeValue(value, type || 'string'),
          type: type || 'string',
          description,
          is_public: is_public || false,
        });
      } else {
        // 更新现有配置
        const updateData = {};
        
        if (value !== undefined) {
          updateData.value = this.serializeValue(value, type || config.type);
        }
        if (type !== undefined) updateData.type = type;
        if (description !== undefined) updateData.description = description;
        if (is_public !== undefined) updateData.is_public = is_public;

        config = await configRepository.update(key, updateData);
      }

      // 清除缓存
      await this.clearConfigCache(key);

      logger.info(`Config updated: ${key}`);

      return {
        key: config.key,
        value: config.getParsedValue(),
        type: config.type,
        description: config.description,
        is_public: config.is_public,
      };
    } catch (error) {
      logger.error('Error updating config:', error);
      throw error;
    }
  }

  /**
   * 批量更新配置
   */
  async bulkUpdateConfigs(configsData) {
    try {
      const results = [];

      for (const configData of configsData) {
        const { key, value, type, description, is_public } = configData;

        // 序列化值
        const serializedValue = type === 'json' ? value : this.serializeValue(value, type || 'string');

        // 更新或创建配置
        const result = await this.updateConfig(key, {
          value: serializedValue,
          type,
          description,
          is_public,
        });

        results.push(result);
      }

      logger.info(`Bulk updated ${results.length} configs`);

      return results;
    } catch (error) {
      logger.error('Error bulk updating configs:', error);
      throw error;
    }
  }

  /**
   * 序列化配置值
   */
  serializeValue(value, type) {
    if (value === null || value === undefined) {
      return null;
    }

    switch (type) {
      case 'number':
        return String(value);
      case 'boolean':
        return String(value);
      case 'json':
        return typeof value === 'string' ? value : JSON.stringify(value);
      default:
        return String(value);
    }
  }

  /**
   * 清除配置缓存
   */
  async clearConfigCache(key = null) {
    try {
      if (key) {
        // 清除单个配置缓存
        const cacheKey = this.getCacheKey(key);
        await cacheService.delete(cacheKey);
      }

      // 清除所有配置列表缓存
      await cacheService.delete(this.getAllConfigsCacheKey());
      await cacheService.delete(`${this.getAllConfigsCacheKey()}:public`);

      logger.debug(`Config cache cleared${key ? `: ${key}` : ''}`);
    } catch (error) {
      logger.error('Error clearing config cache:', error);
    }
  }

  /**
   * 删除配置
   */
  async deleteConfig(key) {
    try {
      const config = await configRepository.findByKey(key);

      if (!config) {
        throw new Error('配置不存在');
      }

      await configRepository.delete(key);

      // 清除缓存
      await this.clearConfigCache(key);

      logger.info(`Config deleted: ${key}`);

      return { message: '配置已删除' };
    } catch (error) {
      logger.error('Error deleting config:', error);
      throw error;
    }
  }
}

module.exports = new ConfigService();
