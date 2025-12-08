const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const logDir = path.join(process.cwd(), 'logs');

function isSafeName(name) {
  return /^[a-zA-Z0-9_.-]+\.log$/.test(name);
}

function resolveLogPath(name) {
  const p = path.resolve(logDir, name);
  if (!p.startsWith(logDir)) return null;
  return p;
}

class SystemLogController {
  async listLogs(req, res, next) {
    try {
      const files = await fs.promises.readdir(logDir);
      const items = [];
      for (const f of files) {
        if (!f.endsWith('.log')) continue;
        const full = path.join(logDir, f);
        const stat = await fs.promises.stat(full);
        items.push({ name: f, size: stat.size, modifiedAt: stat.mtime.toISOString() });
      }
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      logger.error('List logs error:', error);
      next(error);
    }
  }

  async getLog(req, res, next) {
    try {
      const { name } = req.params;
      const lines = parseInt(req.query.lines, 10) || 200;
      if (!isSafeName(name)) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_LOG_NAME', message: 'Invalid log name' } });
      }
      const p = resolveLogPath(name);
      if (!p || !fs.existsSync(p)) {
        return res.status(404).json({ success: false, error: { code: 'LOG_NOT_FOUND', message: 'Log file not found' } });
      }
      const content = await fs.promises.readFile(p, 'utf8');
      const arr = content.split(/\r?\n/);
      const tail = arr.slice(Math.max(0, arr.length - lines));
      res.status(200).json({ success: true, data: { name, lines: tail } });
    } catch (error) {
      logger.error('Get log error:', error);
      next(error);
    }
  }

  async downloadLog(req, res, next) {
    try {
      const { name } = req.params;
      if (!isSafeName(name)) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_LOG_NAME', message: 'Invalid log name' } });
      }
      const p = resolveLogPath(name);
      if (!p || !fs.existsSync(p)) {
        return res.status(404).json({ success: false, error: { code: 'LOG_NOT_FOUND', message: 'Log file not found' } });
      }
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
      fs.createReadStream(p).pipe(res);
    } catch (error) {
      logger.error('Download log error:', error);
      next(error);
    }
  }

  async clearLog(req, res, next) {
    try {
      const { name } = req.params;
      if (!isSafeName(name)) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_LOG_NAME', message: 'Invalid log name' } });
      }
      const p = resolveLogPath(name);
      if (!p || !fs.existsSync(p)) {
        return res.status(404).json({ success: false, error: { code: 'LOG_NOT_FOUND', message: 'Log file not found' } });
      }
      await fs.promises.truncate(p, 0);
      res.status(200).json({ success: true, message: 'Log cleared' });
    } catch (error) {
      logger.error('Clear log error:', error);
      next(error);
    }
  }
}

module.exports = new SystemLogController();

