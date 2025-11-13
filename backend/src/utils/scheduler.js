const cron = require('node-cron');
const postService = require('../services/postService');
const logger = require('./logger');

/**
 * 初始化定时任务
 */
function initScheduledTasks() {
  // 每小时同步浏览量到数据库（每小时的第 0 分钟执行）
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running scheduled task: sync view counts');
      await postService.syncViewCountsToDatabase();
    } catch (error) {
      logger.error('Scheduled task failed: sync view counts', error);
    }
  });

  logger.info('Scheduled tasks initialized');
}

module.exports = {
  initScheduledTasks,
};
