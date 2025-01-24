/**
 * 格式化数字，添加千位分隔符
 * @param value 要格式化的数字
 * @param locale 地区设置，默认为中文
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number, locale = 'zh-CN'): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * 格式化金额
 * @param value 要格式化的金额
 * @param currency 货币代码，默认为人民币
 * @param locale 地区设置，默认为中文
 * @returns 格式化后的字符串
 */
export function formatCurrency(value: number, currency = 'CNY', locale = 'zh-CN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * 格式化日期时间
 * @param date 要格式化的日期
 * @param locale 地区设置，默认为中文
 * @returns 格式化后的字符串
 */
export function formatDateTime(date: Date | string, locale = 'zh-CN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化日期
 * @param date 要格式化的日期
 * @param locale 地区设置，默认为中文
 * @returns 格式化后的字符串
 */
export function formatDate(date: Date | string, locale = 'zh-CN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 格式化时间
 * @param date 要格式化的日期
 * @param locale 地区设置，默认为中文
 * @returns 格式化后的字符串
 */
export function formatTime(date: Date | string, locale = 'zh-CN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数，默认为 2
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * 格式化百分比
 * @param value 要格式化的数值
 * @param decimals 小数位数，默认为 2
 * @returns 格式化后的字符串
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 格式化距离现在的时间
 * @param date 要格式化的日期
 * @returns 格式化后的字符串
 */
export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) return `${years}年前`;
  if (months > 0) return `${months}个月前`;
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  if (seconds > 0) return `${seconds}秒前`;
  return '刚刚';
}
