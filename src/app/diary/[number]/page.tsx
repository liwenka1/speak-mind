import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDiaryEntry, getDiaryEntries, type DiaryEntry } from "@/lib/github";
import { formatDate } from "@/lib/format";
import { DiaryMarkdown } from "@/components/diary/markdown";

/** 与数据层一致的缓存时长；字面量，便于 Next.js 静态分析。 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "日记 · speak-mind",
  description: "记录在 GitHub Issues 上的日记与三言两语。",
};

/** 构建时把已有日记预渲染成静态页；新日记则按需生成并缓存。 */
export async function generateStaticParams() {
  try {
    const entries = await getDiaryEntries();
    return entries.map((entry) => ({ number: String(entry.id) }));
  } catch {
    // 构建时若 GitHub 不可用 / 被限流，退化为「不预渲染」，
    // 交给运行时按需生成，避免整个部署因此失败。
    return [];
  }
}

export default async function Page(props: PageProps<"/diary/[number]">) {
  const { number } = await props.params;
  const id = Number(number);
  if (!Number.isInteger(id) || id <= 0) notFound();

  let entry: DiaryEntry | null = null;
  let errorMessage: string | null = null;

  try {
    entry = await getDiaryEntry(id);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "未知错误";
  }

  // 接口明确 404（issue 不存在），进入 Next 的 404 页
  if (!entry && !errorMessage) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <Link
        href="/diary"
        className="text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
      >
        ← 返回日记
      </Link>

      {errorMessage ? (
        <p className="mt-10 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          暂时读不到这篇日记：{errorMessage}
        </p>
      ) : entry ? (
        <article className="mt-8">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight">{entry.title}</h1>
            <time
              className="mt-3 inline-block text-sm text-zinc-500 dark:text-zinc-400"
              dateTime={entry.createdAt}
            >
              {formatDate(entry.createdAt)}
            </time>
          </header>

          <div className="mt-8">
            {entry.body ? (
              <DiaryMarkdown content={entry.body} />
            ) : (
              <p className="text-zinc-500 dark:text-zinc-400">（无正文）</p>
            )}
          </div>

          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block text-sm text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            在 GitHub 查看 →
          </a>
        </article>
      ) : null}
    </main>
  );
}
