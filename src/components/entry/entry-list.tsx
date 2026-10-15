import Link from "next/link";
import type { Entry } from "@/lib/github";
import { formatDate } from "@/lib/format";
import { entryPath } from "@/config/site";
import { enterAt } from "@/lib/enter";

/**
 * 纯展示组件：接收内容数据并渲染列表。
 * 不直接接触 GitHub / 网络，数据由页面传入，方便独立调整 UI。
 *
 * 每一条自上而下逐个浮现（规则见 globals.css 的 `.enter`），序号从 1 起按列表顺序数。
 * 列表可能很长，但不用在这里截断序号：`.enter` 自己封顶在 8 拍，后面的一起出来。
 */
export function EntryList({ entries }: { entries: Entry[] }) {
  return (
    <ul className="mt-12 flex flex-col gap-8">
      {entries.map((entry, index) => (
        <li key={entry.id} className="enter" style={enterAt(index + 1)}>
          <article className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-base font-medium">
              <Link
                href={entryPath(entry.id)}
                className="underline-offset-4 hover:underline"
              >
                {entry.title}
              </Link>
            </h2>
            <time
              className="shrink-0 font-mono text-xs text-muted-foreground"
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
