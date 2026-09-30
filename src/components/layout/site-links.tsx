import type { SiteLink } from "@/config/site";

type SiteLinkListProps = {
  links: SiteLink[];
  /** <ul> 的类名 */
  className?: string;
  /** 每个 <a> 的类名 */
  linkClassName?: string;
};

/**
 * 渲染配置里的外链列表：http(s) 链接新窗口打开并补 rel，mailto 等同窗口跳转。
 *
 * 首页「找我」与页脚共用，避免两处各写一遍这段判断。
 */
export function SiteLinkList({
  links,
  className,
  linkClassName,
}: SiteLinkListProps) {
  return (
    <ul className={className}>
      {links.map((link) => {
        const external = link.href.startsWith("http");

        return (
          <li key={link.href}>
            <a
              href={link.href}
              className={linkClassName}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
