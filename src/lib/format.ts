/** 把 ISO 时间字符串按中国时区格式化成「2026年2月14日」。 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(new Date(iso));
}
