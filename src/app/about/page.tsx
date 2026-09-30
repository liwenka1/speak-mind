import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { fill } from "@/lib/template";

export const metadata: Metadata = {
  // 后缀「· 站名」由根布局的 title.template 统一补上，这里只给短标题
  title: siteConfig.pages.about.title,
  description: fill(siteConfig.text.about.description, {
    name: siteConfig.name,
  }),
};

/** 关于页：正文段落全部来自 siteConfig.text.about */
export default function AboutPage() {
  const text = siteConfig.text.about;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-[15px] leading-7">
      <h1 className="text-3xl font-semibold tracking-tight">
        {siteConfig.pages.about.title}
      </h1>

      <div className="mt-8 space-y-4">
        <p>{text.lead}</p>
        {text.paragraphs.map((paragraph) => (
          <p key={paragraph} className="text-muted-foreground">
            {paragraph}
          </p>
        ))}
      </div>
    </main>
  );
}
