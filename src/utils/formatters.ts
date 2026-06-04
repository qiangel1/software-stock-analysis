/**
 * Formatters Utility
 * 
 * Number and date formatting utilities.
 */

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return '-';
  return `¥${price.toFixed(2)}`;
}

/**
 * Format price change
 */
export function formatChange(change: number | null | undefined): string {
  if (change === null || change === undefined) return '-';
  return change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
}

/**
 * Format change percent
 */
export function formatChangePercent(percent: number | null | undefined): string {
  if (percent === null || percent === undefined) return '-';
  return `${percent.toFixed(2)}%`;
}

/**
 * Format large numbers with units
 */
export function formatNumber(num: number | null | undefined, decimals: number = 2): string {
  if (num === null || num === undefined) return '-';
  
  if (num >= 100000000) {
    return (num / 100000000).toFixed(decimals) + '亿';
  }
  if (num >= 10000) {
    return (num / 10000).toFixed(decimals) + '万';
  }
  if (num >= 1000) {
    return num.toLocaleString();
  }
  return num.toFixed(decimals);
}

/**
 * Format volume
 */
export function formatVolume(volume: number | null | undefined): string {
  if (volume === null || volume === undefined) return '-';
  return formatNumber(volume, 0);
}

/**
 * Format date
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format datetime
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

/**
 * Format percent
 */
export function formatPercent(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format market cap
 */
export function formatMarketCap(cap: number | null | undefined): string {
  if (cap === null || cap === undefined) return '-';
  
  if (cap >= 100000000000) {
    return (cap / 100000000000).toFixed(2) + '万亿';
  }
  if (cap >= 100000000) {
    return (cap / 100000000).toFixed(2) + '亿';
  }
  return (cap / 100000000).toFixed(2) + '亿';
}

/**
 * Convert cents to yuan
 */
export function centsToYuan(cents: number | null | undefined): number {
  if (cents === null || cents === undefined) return 0;
  return cents / 100;
}

/**
 * Convert yuan to cents
 */
export function yuanToCents(yuan: number): number {
  return Math.round(yuan * 100);
}
