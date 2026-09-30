import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntry, getEntriesByLabels, type Entry } from "@/lib/github";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/entry/markdown";
import { sectionPath, siteConfig } from "@/config/site";
import { fill } from "@/lib/template";

/** 与数据层一致的缓存时长；字面量，便于 Next.js 静态分析。 */
export const revalidate = 3600;

export async function generateMetadata(
  props: PageProps<"/entry/[number]">,
): Promise<Metadata> {
  const { number } = await props.params;
  const id = Number(number);
  if (!Number.isInteger(id) || id <= 0) return {};

  try {
    const entry = await getEntry(id);
    return entry ? { title: entry.title } : {};
  } catch {
    return {};
  }
}

/** 构建时把已配置分区里的内容预渲染成静态页；新内容则按需生成并缓存。 */
export async function generateStaticParams() {
  try {
    const entries = await getEntriesByLabels(
      siteConfig.sections.map((section) => section.label),
    );
    return entries.map((entry) => ({ number: String(entry.id) }));
  } catch {
    // 构建时若 GitHub 不可用 / 被限流，退化为「不预渲染」，
    // 交给运行时按需生成，避免整个部署因此失败。
    return [];
  }
}

export default async function EntryPage(props: PageProps<"/entry/[number]">) {
  const { number } = await props.params;
  const id = Number(number);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let entry: Entry | null = null;
  let errorMessage: string | null = null;

  try {
    entry = await getEntry(id);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : siteConfig.text.common.unknownError;
  }

  // 接口明确 404（issue 不存在），进入 Next 的 404 页
  if (!entry && !errorMessage) notFound();

  // 该内容所属的分区（可能有多个），用作返回入口
  const sections = entry
    ? siteConfig.sections.filter((section) =>
        entry.labels.includes(section.label),
      )
    : [];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      {errorMessage ? (
        <>
          <BackHome />
          <p className="mt-10 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {fill(siteConfig.text.entry.error, { error: errorMessage })}
          </p>
        </>
      ) : entry ? (
        <article>
          <header>
            {sections.length > 0 ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                {sections.map((section) => (
                  <Link
                    key={section.label}
                    href={sectionPath(section.label)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {section.title}
                  </Link>
                ))}
              </div>
            ) : (
              <BackHome />
            )}

            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              {entry.title}
            </h1>
            <time
              className="mt-3 inline-block font-mono text-xs text-muted-foreground"
              dateTime={entry.createdAt}
            >
              {formatDate(entry.createdAt)}
            </time>
          </header>

          <div className="mt-8">
            {entry.body ? (
              <Markdown content={entry.body} />
            ) : (
              <p className="text-muted-foreground">
                {siteConfig.text.entry.emptyBody}
              </p>
            )}
          </div>

          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {siteConfig.text.entry.viewOnGitHub}
          </a>
        </article>
      ) : null}
    </main>
  );
}

function BackHome() {
  return (
    <Link
      href={siteConfig.pages.home.href}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      ← {siteConfig.pages.home.title}
    </Link>
  );
}
