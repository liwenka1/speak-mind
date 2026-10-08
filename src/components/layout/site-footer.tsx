import { siteConfig } from "@/config/site";
import { fill } from "@/lib/template";

/**
 * 站点页脚：只有一行版权。
 *
 * 外链与导航都在顶栏，所以这里不再重复列一遍；
 * **没有上边框** —— 一行 50% 的灰字配留白就够了，画一条横线反而把页面切碎。
 *
 * 容器与正文同宽同左边界；上面的 `main` 带 `flex-1`，所以内容短时它会被推到
 * 视口底部，内容长时正好接在正文后面。
 */
export function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-2xl px-6 pb-10">
      <p className="text-sm text-muted-foreground">
        {fill(siteConfig.text.footer.copyright, {
          year: new Date().getFullYear(),
          name: siteConfig.name,
        })}
      </p>
    </footer>
  );
}
