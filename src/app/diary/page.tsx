import type { Metadata } from "next";
import Link from "next/link";
import { getDiaryEntries, type DiaryEntry } from "@/lib/github";
import { formatDate } from "@/lib/format";

/** 与数据层一致的缓存时长；字面量，便于 Next.js 静态分析。 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "日记 · speak-mind",
  description: "记录在 GitHub Issues 上的日记与三言两语。",
};

export default async function DiaryPage() {
  let entries: DiaryEntry[] = [];
  let errorMessage: string | null = null;

  try {
    entries = await getDiaryEntries();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "未知错误";
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">日记</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          内容来自 GitHub Issues —— 在仓库里打了{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono dark:bg-white/[.08]">
            diary
          </code>{" "}
          标签的 issue 会出现在这里。
        </p>
      </header>

      {errorMessage ? (
        <p className="mt-12 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          暂时读不到日记：{errorMessage}
        </p>
      ) : entries.length === 0 ? (
        <p className="mt-12 text-zinc-500 dark:text-zinc-400">
          还没有日记。去 GitHub 新建一个带{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono dark:bg-white/[.08]">
            diary
          </code>{" "}
          标签的 issue 试试吧。
        </p>
      ) : (
        <ul className="mt-12 flex flex-col gap-10">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="border-b border-zinc-200 pb-10 last:border-none dark:border-zinc-800"
            >
              <article>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-xl font-medium">
                    <Link
                      href={`/diary/${entry.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {entry.title}
                    </Link>
                  </h2>
                  <time
                    className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400"
                    dateTime={entry.createdAt}
                  >
                    {formatDate(entry.createdAt)}
                  </time>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
