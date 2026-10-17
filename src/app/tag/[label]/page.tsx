import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowUpRightIcon,
  SquarePenIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { getEntriesByLabel, type Entry } from "@/lib/github";
import { findSection, newIssueUrl, repoUrl, siteConfig } from "@/config/site";
import { fill } from "@/lib/template";
import { enterAt } from "@/lib/enter";
import { EntryList } from "@/components/entry/entry-list";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/** 与数据层一致的缓存时长；字面量，便于 Next.js 静态分析。 */
export const revalidate = 3600;

/** 为配置里的每个分区预生成一个静态页。 */
export function generateStaticParams() {
  return siteConfig.sections.map((section) => ({ label: section.label }));
}

export async function generateMetadata(
  props: PageProps<"/tag/[label]">,
): Promise<Metadata> {
  const { label } = await props.params;
  const section = findSection(label);
  if (!section) return {};
  return {
    // 后缀「· 站名」由根布局的 title.template 统一补上
    title: section.title,
    description: fill(siteConfig.text.section.description, {
      name: siteConfig.name,
      title: section.title,
    }),
  };
}

export default async function SectionPage(props: PageProps<"/tag/[label]">) {
  const { label } = await props.params;
  const section = findSection(label);
  if (!section) notFound();

  const text = siteConfig.text.section;

  let entries: Entry[] = [];
  let errorMessage: string | null = null;

  try {
    entries = await getEntriesByLabel(section.label);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : siteConfig.text.common.unknownError;
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      {/*
        分区名不再用大标题重复 —— 顶栏导航已经高亮当前分区。
        留一个 sr-only 的 h1 只是给屏幕阅读器和文档大纲用，视觉上不显示。
      */}
      <h1 className="sr-only">{section.title}</h1>

      {errorMessage ? (
        <Empty>
          {/* 报错不挂 `.enter`：出错要立刻看到，不跟着排队入场 */}
          <EmptyHeader>
            <EmptyMedia variant="icon" className="text-destructive">
              <TriangleAlertIcon />
            </EmptyMedia>
            <EmptyDescription>
              {fill(text.error, { error: errorMessage })}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : entries.length === 0 ? (
        <Empty>
          {/*
            空状态分两块入场：先是图标 + 标题 + 说明，再是两个动作（规则见 globals.css
            的 `.enter`）。Empty 的各部件会把 className / style 原样透传，所以不用改
            vendored 的 empty.tsx。
          */}
          <EmptyHeader className="enter" style={enterAt(1)}>
            <EmptyMedia variant="icon">
              <SquarePenIcon />
            </EmptyMedia>
            <EmptyTitle>{text.empty.title}</EmptyTitle>
            {/*
              官方 Empty 的 example 里标题下面还有这行说明。它不是装饰：留白
              要周围的文字撑着，只有标题时空状态就是一块没有信息的空白。
            */}
            <EmptyDescription>
              {fill(text.empty.description, { label: section.label })}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="enter" style={enterAt(2)}>
            {/*
              唯一的动作不该是描边小按钮：它是全页仅有的视觉落点，所以用实心
              的 default（官方 example 的主动作也是实心）。

              这是个跳转链接：用 Button 的 render 换成 <a>，同时把 nativeButton
              设为 false —— 否则 Base UI 会按按钮处理它，给链接加上 role="button" /
              tabindex，读屏会把链接念成按钮。
            */}
            <Button
              variant="default"
              size="sm"
              nativeButton={false}
              render={
                <a
                  href={newIssueUrl(section.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {text.empty.action}
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
            {/*
              次级入口：想问「这是什么」而不是立刻动手的人，从这里去本仓库的 GitHub 页
              —— README 就是这个站最完整的说明（官方 example 里对应那个 Learn more ↗）。
              是外链：新窗口打开、图标用 ↗，地址由 repoUrl() 推导；nativeButton 同样要设 false。
            */}
            <Button
              variant="link"
              size="sm"
              className="text-muted-foreground"
              nativeButton={false}
              render={
                <a
                  href={repoUrl(siteConfig.github.repo)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {text.empty.guide}
              <ArrowUpRightIcon data-icon="inline-end" />
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <EntryList entries={entries} />
      )}
    </main>
  );
}
