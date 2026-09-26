/** 站点页脚。 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} speak-mind</span>
        <a
          href="https://github.com/liwenka1/speak-mind"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
