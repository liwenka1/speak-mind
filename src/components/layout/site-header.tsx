import Link from "next/link";
import { SiteLinkList, iconOf } from "./site-links";
import { SiteLogo } from "./site-logo";
import { SiteNav } from "./site-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { authorLinks, siteConfig } from "@/config/site";

/**
 * 站点顶栏。
 *
 * **全宽、两侧分布**：站名贴页面左边，导航 + 联系方式 + 主题切换
 * 贴页面右边 —— 顶栏横跨整个窗口，正文仍是居中的窄列（`max-w-2xl`），所以宽屏上
 * 顶栏是"张开"的，不会被挤成窄窄一坨。
 *
 * **不是常驻工具条**：没有背景、没有下边框、不 sticky —— 它只是页面最上面的一行，
 * 跟着内容一起滚走。层次交给留白与透明度，不交给边框。
 *
 * 右侧所有条目（导航 / 三个联系方式 / 主题切换）**共用同一套间距与 hover**：
 * 60% 透明、hover 到 100%，没有底色、没有边框 —— 图标按钮看起来就该像旁边那些
 * 分区链接，而不是一排控件。联系方式不放「源码」（作者不要）；窄屏只藏掉联系方式，
 * 主题切换始终在（首页「找我」里另有完整的一行）。
 */
export function SiteHeader() {
  return (
    <header className="flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 pt-8">
      {/*
        左上角是站标（wk 连写，会自己写一遍再擦掉），不再显示站名字样 —— 名字仍在
        <title> 后缀、页脚版权，以及这个链接的可访问名里。标记大小一个数就能调。
      */}
      <Link
        href={siteConfig.pages.home.href}
        aria-label={siteConfig.name}
        title={siteConfig.name}
        className="inline-flex shrink-0"
      >
        <SiteLogo className="size-10" />
      </Link>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:gap-x-5">
        <SiteNav />
        {/*
          类名直接写字，既不套 <Button> 也不用 buttonVariants()：这几个是**链接**，
          外观又要和左边的导航文字一致（只有透明度变化）。套 <Button> 会被 Base UI
          加上 role="button" / tabindex，读屏会把链接念成按钮。
        */}
        <SiteLinkList
          links={authorLinks()}
          className="hidden items-center gap-x-4 sm:flex sm:gap-x-5"
          linkClassName="opacity-60 transition-opacity hover:opacity-100"
          renderIcon={iconOf}
        />
        <ThemeToggle />
      </div>
    </header>
  );
}
