/**
 * 日期时间工具函数
 * 数据库存储 UTC 时间，应用层转换为东八区时间显示
 */

/**
 * 将 UTC 时间转换为东八区时间字符串
 * @param {Date|string} utcTime - UTC 时间
 * @param {string} format - 格式化选项 'datetime' | 'date' | 'time'
 * @returns {string} 东八区时间字符串
 */
function toBeijingTime(utcTime, format = 'datetime') {
  if (!utcTime) return null;
  
  const date = new Date(utcTime);
  
  // 转换为东八区时间（UTC+8）
  const options = {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  
  if (format === 'date') {
    delete options.hour;
    delete options.minute;
    delete options.second;
  } else if (format === 'time') {
    delete options.year;
    delete options.month;
    delete options.day;
  }
  
  return date.toLocaleString('zh-CN', options);
}

/**
 * 将 UTC 时间转换为 ISO 8601 格式的东八区时间
 * @param {Date|string} utcTime - UTC 时间
 * @returns {string} ISO 8601 格式的东八区时间
 */
function toBeijingISO(utcTime) {
  if (!utcTime) return null;
  
  const date = new Date(utcTime);
  // 获取东八区时间戳（UTC + 8小时）
  const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  
  // 格式化为 ISO 8601 格式
  return beijingTime.toISOString().replace('Z', '+08:00');
}

/**
 * 格式化时间为友好显示
 * @param {Date|string} utcTime - UTC 时间
 * @returns {string} 友好的时间显示（如：刚刚、5分钟前、今天 14:30）
 */
function formatRelativeTime(utcTime) {
  if (!utcTime) return null;
  
  const date = new Date(utcTime);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return toBeijingTime(utcTime, 'date');
  }
}

/**
 * 转换模型数据中的时间字段
 * @param {Object} data - 模型数据对象
 * @param {Array<string>} fields - 需要转换的时间字段名数组
 * @returns {Object} 转换后的数据对象
 */
function convertModelTimestamps(data, fields = ['created_at', 'updated_at']) {
  if (!data) return data;
  
  const converted = { ...data };
  
  fields.forEach(field => {
    if (converted[field]) {
      converted[field] = toBeijingISO(converted[field]);
    }
  });
  
  return converted;
}

/**
 * 批量转换数组中的时间字段
 * @param {Array<Object>} dataArray - 数据对象数组
 * @param {Array<string>} fields - 需要转换的时间字段名数组
 * @returns {Array<Object>} 转换后的数据数组
 */
function convertArrayTimestamps(dataArray, fields = ['created_at', 'updated_at']) {
  if (!Array.isArray(dataArray)) return dataArray;
  
  return dataArray.map(data => convertModelTimestamps(data, fields));
}

module.exports = {
  toBeijingTime,
  toBeijingISO,
  formatRelativeTime,
  convertModelTimestamps,
  convertArrayTimestamps,
};
