const auditLogRepository = require('../repositories/auditLogRepository');
const logger = require('../utils/logger');

class AuditLogController {
  async getAuditLogs(req, res, next) {
    try {
      const { page, limit, sortBy, sortOrder, userId, action, status, start, end, resourceType } = req.query;
      const filters = { userId, action, status, start, end, resourceType };
      const pagination = { page, limit, sortBy, sortOrder };
      const result = await auditLogRepository.findAll(filters, pagination);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      logger.error('Get audit logs error:', error);
      next(error);
    }
  }

  async getAuditLog(req, res, next) {
    try {
      const { id } = req.params;
      const log = await auditLogRepository.findById(id);
      if (!log) {
        return res.status(404).json({ success: false, error: { code: 'AUDIT_LOG_NOT_FOUND', message: 'Audit log not found' } });
      }
      res.status(200).json({ success: true, data: log });
    } catch (error) {
      logger.error('Get audit log error:', error);
      next(error);
    }
  }
}

module.exports = new AuditLogController();
