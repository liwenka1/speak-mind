import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `关于 · ${siteConfig.name}`,
  description: `关于 ${siteConfig.name}`,
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-[15px] leading-7">
      <h1 className="text-3xl font-semibold tracking-tight">关于</h1>

      <div className="mt-8 space-y-4">
        <p>
          {/* TODO: 换成你自己的内容 */}
          这里是「关于」页的占位内容 —— 可以写你是谁、在做什么、为什么写这个站点。
        </p>
        <p className="text-muted-foreground">
          本站用 Next.js 搭建，内容直接以 GitHub Issues
          作为数据源：给 issue 打上对应分区的标签，它就会出现在相应页面里。
        </p>
      </div>
    </main>
  );
}
