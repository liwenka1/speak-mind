import Link from "next/link";
import type { DiaryEntry } from "@/lib/github";
import { formatDate } from "@/lib/format";

/**
 * 纯展示组件：接收日记数据并渲染列表。
 * 不直接接触 GitHub / 网络，数据由页面传入，方便以后独立调整 UI。
 */
export function DiaryList({ entries }: { entries: DiaryEntry[] }) {
  return (
    <ul className="mt-12 flex flex-col gap-8">
      {entries.map((entry) => (
        <li key={entry.id}>
          <article className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-base font-medium">
              <Link
                href={`/diary/${entry.id}`}
                className="underline-offset-4 hover:underline"
              >
                {entry.title}
              </Link>
            </h2>
            <time
              className="shrink-0 font-mono text-xs text-muted"
              dateTime={entry.createdAt}
            >
              {formatDate(entry.createdAt)}
            </time>
          </article>
        </li>
      ))}
    </ul>
  );
}
