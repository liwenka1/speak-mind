import Link from "next/link";
import { SiteNav } from "./site-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/config/site";

/** 站点顶栏：左为站名（链回首页），右为导航与主题切换。站名与首页路径都来自 siteConfig。 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
        <Link
          href={siteConfig.pages.home.href}
          className="text-sm font-medium tracking-tight"
        >
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-4">
          <SiteNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
