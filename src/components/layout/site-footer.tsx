/** 站点页脚。 */
export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto w-full max-w-3xl px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">
        © {new Date().getFullYear()} speak-mind · 由{" "}
        <a
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:underline"
        >
          Next.js
        </a>{" "}
        与 GitHub Issues 驱动
      </div>
    </footer>
  );
}
