import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import {
  getComments,
  getEntry,
  getEntriesByLabels,
  type Comment,
  type Entry,
} from "@/lib/github";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/entry/markdown";
import { CommentList } from "@/components/entry/comment-list";
import { sectionPath, sectionsOf, siteConfig } from "@/config/site";
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
    if (!entry) return {};

    /*
      判据必须和页面组件一致：没有分区标签的内容不该展示，那么它也不该把标题
      写进 <head>。metadata 与页面是分别解析的，只在页面里拦会漏掉标题。
    */
    if (sectionsOf(entry).length === 0) return {};

    return { title: entry.title };
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

  const text = siteConfig.text.entry;

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

  // 这条内容属于哪些分区（可能有多个）；既用作返回入口，也是「能不能展示」的判据
  const sections = entry ? sectionsOf(entry) : [];

  /*
    一个分区标签都没命中的 issue 一律不展示。

    否则详情页就是仓库里任意 issue 的公开只读镜像：issue 编号从 1 连续递增，
    一个循环就能把所有 issue 读一遍 —— 包括还没打标签、本来没打算公开的草稿。
    也就是说，详情页的入口应该是**标签**，不是编号。

    代价：「不属于任何分区」的内容不能看了。以前这类内容会退化成「回到首页」的页面，
    现在直接 404 —— 想发就得先给它一个分区标签。
  */
  if (entry && sections.length === 0) notFound();

  /*
    评论是增值内容，所以单独 try/catch：拉不到也不该连正文都看不成。
    `commentCount` 为 0 时直接跳过请求 —— 它和 issue 走同一个缓存 tag、一起失效，
    所以「数出来是 0」就是真的没有评论，没必要再多打一次接口。
  */
  let comments: Comment[] = [];
  let commentsError: string | null = null;

  if (entry && entry.commentCount > 0) {
    try {
      comments = await getComments(entry.id);
    } catch (error) {
      commentsError =
        error instanceof Error
          ? error.message
          : siteConfig.text.common.unknownError;
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      {errorMessage ? (
        <>
          <BackLink
            href={siteConfig.pages.home.href}
            label={siteConfig.pages.home.title}
          />
          <p className="mt-10 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {fill(text.error, { error: errorMessage })}
          </p>
        </>
      ) : entry ? (
        <article>
          <header>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {sections.map((section) => (
                <BackLink
                  key={section.label}
                  href={sectionPath(section.label)}
                  label={section.title}
                />
              ))}
            </div>

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
              <p className="text-muted-foreground">{text.emptyBody}</p>
            )}
          </div>

          {/* 评论区：站内只展示，不能在这里发 —— 底部留一个入口回 GitHub */}
          <section className="mt-16 border-t border-border pt-8">
            <h2 className="text-sm font-medium text-muted-foreground">
              {comments.length > 0
                ? fill(text.comments.title, { count: comments.length })
                : text.comments.titleEmpty}
            </h2>

            {commentsError ? (
              <p className="mt-4 text-sm text-destructive">
                {fill(text.comments.error, { error: commentsError })}
              </p>
            ) : comments.length > 0 ? (
              <CommentList comments={comments} />
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                {text.comments.empty}
              </p>
            )}

            {/*
              「看原文」和「去评论」是同一个地址，所以只有这一条链接 ——
              不让同一个地址在页面上出现两次。
            */}
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-block text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {text.comments.join}
            </a>
          </section>
        </article>
      ) : null}
    </main>
  );
}

/**
 * 返回入口：回到这条内容所属的分区（错误页里则回首页）。
 *
 * 图标在文字前面，视觉上就是「退回」；lucide 图标自带 aria-hidden，
 * 所以读屏只会念分区名 / 「首页」。
 */
function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" />
      {label}
    </Link>
  );
}
