/**
 * 日期格式化工具函数
 */

/**
 * 格式化日期
 * @param date 日期字符串或 Date 对象
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: string | Date | undefined | null,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化为相对时间
 * @param date 日期字符串或 Date 对象
 * @returns 相对时间字符串，如 "刚刚"、"3分钟前"、"2小时前"
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) return ''

  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  if (months < 12) return `${months}个月前`
  return `${years}年前`
}

/**
 * 格式化为日期（不含时间）
 * @param date 日期字符串或 Date 对象
 * @returns 格式化后的日期字符串，如 "2025-01-15"
 */
export function formatDateOnly(date: string | Date | undefined | null): string {
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 格式化为时间（不含日期）
 * @param date 日期字符串或 Date 对象
 * @returns 格式化后的时间字符串，如 "14:30:00"
 */
export function formatTimeOnly(date: string | Date | undefined | null): string {
  return formatDate(date, 'HH:mm:ss')
}
