const logger = require('./logger');

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
  }
}

module.exports = AuditLogger;

