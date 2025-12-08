const { AuditLog } = require('../models');
const { Op } = require('sequelize');

class AuditLogRepository {
  async create(logData) {
    return await AuditLog.create(logData);
  }

  async findById(id) {
    return await AuditLog.findByPk(id);
  }

  async findAll(filters = {}, pagination = {}) {
    const { userId, action, status, start, end, resourceType } = filters;
    let { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC' } = pagination;
    const where = {};
    if (userId) where.user_id = userId;
    if (action) where.action = action;
    if (resourceType) where.resource_type = resourceType;
    if (status) where.status = status;
    if (start || end) {
      const range = {};
      if (start) range[Op.gte] = new Date(start);
      if (end) range[Op.lte] = new Date(end);
      where.created_at = range;
    }
    const queryOptions = {
      where,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    };
    const { count, rows } = await AuditLog.findAndCountAll(queryOptions);
    return {
      logs: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    };
  }
}

module.exports = new AuditLogRepository();
