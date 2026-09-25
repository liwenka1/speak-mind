"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/diary", label: "日记" },
] as const;

/** 顶部导航：根据当前路径高亮所在项（需要 pathname，所以是客户端组件）。 */
export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-5 text-sm">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "text-foreground"
                : "text-muted transition-colors hover:text-foreground"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
