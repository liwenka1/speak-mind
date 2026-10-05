import type { Comment } from "@/lib/github";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/entry/markdown";

/**
 * 纯展示组件：渲染一条 issue 下的评论列表。
 *
 * **只读** —— 这里没有输入框，想发言请去 GitHub（入口在详情页的评论区底部）。
 * 和 `EntryList` / `Markdown` 一样，数据由外部传入，不接触网络。
 */
export function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <ol className="mt-6 flex flex-col gap-8">
      {comments.map((comment) => (
        <li key={comment.id} className="flex gap-3">
          {/*
            头像是装饰性的（作者名就在旁边），所以 alt 留空，读屏不会重复念。

            这里**故意用原生 `<img>`**，不用 next/image：后者的域名白名单是构建期
            配置，而头像地址是运行时从 GitHub 拿的 —— 某个域没配上就会让**整个详情页**
            报错。为一个装饰性的 32px 头像连累正文不值得，头像本身也没什么可优化的。
          */}
          {comment.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- 见上：头像域来自运行时数据，不该受构建期的白名单约束
            <img
              src={comment.avatarUrl}
              alt=""
              width={32}
              height={32}
              className="mt-0.5 size-8 shrink-0 rounded-full"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <a
                href={comment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium underline-offset-4 hover:underline"
              >
                {comment.author}
              </a>
              <time
                className="font-mono text-xs text-muted-foreground"
                dateTime={comment.createdAt}
              >
                {formatDate(comment.createdAt)}
              </time>
            </div>

            <div className="mt-2">
              <Markdown content={comment.body} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
