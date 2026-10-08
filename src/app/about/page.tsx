import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fill } from "@/lib/template";

/** 页面文案里 `{author}` 的值：meta description 与正文段落共用同一份 */
const AUTHOR_VALUES = { author: siteConfig.author.name };

export const metadata: Metadata = {
  // 后缀「· 站名」由根布局的 title.template 统一补上，这里只给短标题
  title: siteConfig.pages.about.title,
  description: fill(siteConfig.text.about.description, {
    title: siteConfig.pages.about.title,
    ...AUTHOR_VALUES,
  }),
};

/** 关于页：正文段落全部来自 siteConfig.text.about，里面的 `{author}` 在这里填 */
export default function AboutPage() {
  const text = siteConfig.text.about;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      {/*
        页面名不再用大标题重复 —— 顶栏导航已经高亮「关于」。
        留一个 sr-only 的 h1 只是给屏幕阅读器和文档大纲用，视觉上不显示。
      */}
      <h1 className="sr-only">{siteConfig.pages.about.title}</h1>

      <div className="space-y-4">
        <p>{fill(text.lead, AUTHOR_VALUES)}</p>
        {text.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-muted-foreground">
            {fill(paragraph, AUTHOR_VALUES)}
          </p>
        ))}
      </div>
    </main>
  );
}
