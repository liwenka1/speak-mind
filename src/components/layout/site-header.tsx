import Link from "next/link";
import { SiteNav } from "./site-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/** 站点顶栏：左为站名，右为导航与主题切换。 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-sm font-medium tracking-tight">
          speak-mind
        </Link>
        <div className="flex items-center gap-5">
          <SiteNav />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
