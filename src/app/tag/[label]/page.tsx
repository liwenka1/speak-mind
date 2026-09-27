import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEntriesByLabel, type Entry } from "@/lib/github";
import { findSection, siteConfig } from "@/config/site";
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
    title: `${section.title} · ${siteConfig.name}`,
    description: `${siteConfig.name} 的${section.title}`,
  };
}

export default async function SectionPage(props: PageProps<"/tag/[label]">) {
  const { label } = await props.params;
  const section = findSection(label);
  if (!section) notFound();

  let entries: Entry[] = [];
  let errorMessage: string | null = null;

  try {
    entries = await getEntriesByLabel(section.label);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "未知错误";
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          {section.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          来自 GitHub Issues —— 打了{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
            {section.label}
          </code>{" "}
          标签的内容会出现在这里。
        </p>
      </header>

      {errorMessage ? (
        <p className="mt-12 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          暂时读不到内容：{errorMessage}
        </p>
      ) : entries.length === 0 ? (
        <p className="mt-12 text-muted-foreground">
          这里还是空的。去 GitHub 新建一个带{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
            {section.label}
          </code>{" "}
          标签的 issue 试试吧。
        </p>
      ) : (
        <EntryList entries={entries} />
      )}
    </main>
  );
}
