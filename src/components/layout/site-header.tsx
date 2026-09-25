import Link from "next/link";
import { SiteNav } from "./site-nav";

/** 站点顶栏：左为站名，右为导航。 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/70">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-base font-semibold tracking-tight">
          speak-mind
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
