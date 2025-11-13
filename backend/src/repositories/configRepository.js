const { Config } = require('../models');

class ConfigRepository {
  /**
   * 创建配置
   */
  async create(configData) {
    return await Config.create(configData);
  }

  /**
   * 根据 key 查找配置
   */
  async findByKey(key) {
    return await Config.findOne({ where: { key } });
  }

  /**
   * 根据 ID 查找配置
   */
  async findById(id) {
    return await Config.findByPk(id);
  }

  /**
   * 查询所有配置
   */
  async findAll(filters = {}) {
    const { is_public } = filters;
    const where = {};

    // 公开配置筛选
    if (is_public !== undefined) {
      where.is_public = is_public;
    }

    const configs = await Config.findAll({
      where,
      order: [['key', 'ASC']],
    });

    return configs;
  }

  /**
   * 更新配置
   */
  async update(key, configData) {
    const config = await this.findByKey(key);
    if (!config) {
      return null;
    }

    await config.update(configData);
    return config;
  }

  /**
   * 批量更新配置
   */
  async bulkUpdate(configsData) {
    const results = [];
    
    for (const { key, value, type, description, is_public } of configsData) {
      let config = await this.findByKey(key);
      
      if (config) {
        // 更新现有配置
        const updateData = {};
        if (value !== undefined) updateData.value = value;
        if (type !== undefined) updateData.type = type;
        if (description !== undefined) updateData.description = description;
        if (is_public !== undefined) updateData.is_public = is_public;
        
        await config.update(updateData);
        results.push(config);
      } else {
        // 创建新配置
        config = await this.create({
          key,
          value,
          type: type || 'string',
          description,
          is_public: is_public || false,
        });
        results.push(config);
      }
    }

    return results;
  }

  /**
   * 删除配置
   */
  async delete(key) {
    const config = await this.findByKey(key);
    if (!config) {
      return null;
    }

    await config.destroy();
    return config;
  }
}

module.exports = new ConfigRepository();
