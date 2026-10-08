import type { ReactNode } from "react";
import type { SiteLink } from "@/config/site";

type SiteLinkListProps = {
  links: SiteLink[];
  /** <ul> 的类名 */
  className?: string;
  /** 每个 <a> 的类名 */
  linkClassName?: string;
  /**
   * 给了就把文字换成图标（「图标按钮」）：图标由它决定，链接的可访问名与悬停
   * 提示仍用 `link.label` —— 看不见文字不等于可以丢掉名字。
   */
  renderIcon?: (link: SiteLink) => ReactNode;
};

/**
 * 渲染配置里的外链列表：http(s) 链接新窗口打开并补 rel，mailto 等同窗口跳转。
 *
 * 首页「找我」与顶栏共用，避免两处各写一遍这段判断；顶栏额外传 `renderIcon`，
 * 把它渲染成一行图标按钮。
 */
export function SiteLinkList({
  links,
  className,
  linkClassName,
  renderIcon,
}: SiteLinkListProps) {
  return (
    <ul className={className}>
      {links.map((link) => {
        const external = link.href.startsWith("http");
        const icon = renderIcon?.(link) ?? null;

        return (
          <li key={link.href}>
            <a
              href={link.href}
              className={linkClassName}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              {...(icon ? { "aria-label": link.label, title: link.label } : {})}
            >
              {icon ?? link.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
