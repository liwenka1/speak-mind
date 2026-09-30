import { SiteLinkList } from "./site-links";
import { authorLinks, repoUrl, siteConfig } from "@/config/site";
import { fill } from "@/lib/template";

/** 页脚链接：本站源码 + 配置里的作者外链。 */
const FOOTER_LINKS = [
  { label: siteConfig.text.links.source, href: repoUrl() },
  ...authorLinks(),
];

/** 站点页脚：版权与链接全部来自 siteConfig，组件里不写死文案。 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-8 text-sm text-muted-foreground">
        <span>
          {fill(siteConfig.text.footer.copyright, {
            year: new Date().getFullYear(),
            name: siteConfig.name,
          })}
        </span>
        <SiteLinkList
          links={FOOTER_LINKS}
          className="flex flex-wrap items-center gap-x-4 gap-y-1"
          linkClassName="transition-colors hover:text-foreground"
        />
      </div>
    </footer>
  );
}
