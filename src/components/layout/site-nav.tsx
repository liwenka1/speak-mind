"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { sectionPath, siteConfig } from "@/config/site";

/** 首页路径：判断「当前是否是首页」时要用，单独取出来 */
const HOME_HREF = siteConfig.pages.home.href;

/** 导航 = 首页 + 配置里的分区 + 关于（文案与路径都来自 siteConfig） */
const NAV_ITEMS = [
  { href: HOME_HREF, label: siteConfig.pages.home.title },
  ...siteConfig.sections.map((section) => ({
    href: sectionPath(section.label),
    label: section.title,
  })),
  { href: siteConfig.pages.about.href, label: siteConfig.pages.about.title },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:gap-x-5">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === HOME_HREF
            ? pathname === HOME_HREF
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              active
                ? "text-foreground"
                : "text-muted-foreground transition-colors hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
