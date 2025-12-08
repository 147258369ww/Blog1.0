const logger = require('./logger');
const auditLogRepository = require('../repositories/auditLogRepository');

class AuditLogger {
  static log(action, userId, details = {}) {
    try {
      logger.info('AUDIT', {
        action,
        userId,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}
    try {
      const payload = {
        user_id: userId || null,
        action,
        status: details.status || 'success',
        resource_type: details.resourceType || null,
        resource_id: details.resourceId || null,
        ip: details.ip || null,
        user_agent: details.userAgent || null,
        route: details.route || null,
        method: details.method || null,
        request_id: details.requestId || null,
        details,
      };
      auditLogRepository.create(payload).catch(() => {});
    } catch (_) {}
  }
}

module.exports = AuditLogger;
