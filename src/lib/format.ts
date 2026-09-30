import { siteConfig } from "@/config/site";

/** 把 ISO 时间字符串按配置里的语言与时区格式化成「2026年2月14日」。 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(siteConfig.lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: siteConfig.timeZone,
  }).format(new Date(iso));
}
