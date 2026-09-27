"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { sectionPath, siteConfig } from "@/config/site";

/** 导航 = 首页 + 配置里的分区 + 关于 */
const NAV_ITEMS = [
  { href: "/", label: "首页" },
  ...siteConfig.sections.map((section) => ({
    href: sectionPath(section.label),
    label: section.title,
  })),
  { href: "/about", label: "关于" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm sm:gap-x-5">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

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
