import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getEntriesByLabel, type Entry } from "@/lib/github";
import { findSection, siteConfig } from "@/config/site";
import { fill, fillNodes } from "@/lib/template";
import { EntryList } from "@/components/entry/entry-list";

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
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          {section.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {fillNodes(text.hint, { label: <LabelCode>{section.label}</LabelCode> })}
        </p>
      </header>

      {errorMessage ? (
        <p className="mt-12 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {fill(text.error, { error: errorMessage })}
        </p>
      ) : entries.length === 0 ? (
        <p className="mt-12 text-muted-foreground">
          {fillNodes(text.empty, { label: <LabelCode>{section.label}</LabelCode> })}
        </p>
      ) : (
        <EntryList entries={entries} />
      )}
    </main>
  );
}

/** 行内 code 样式的标签名，出现在说明与空状态文案里 */
function LabelCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{children}</code>
  );
}
