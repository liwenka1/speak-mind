import type { ReactNode } from "react";
import { GitHubIcon, LinkIcon, MailIcon, XIcon } from "@/components/icons/remix";
import { githubUrl, type SiteLink } from "@/config/site";

type SiteLinkListProps = {
  links: SiteLink[];
  /** <ul> 的类名 */
  className?: string;
  /** 每个 <a> 的类名 */
  linkClassName?: string;
  /**
   * 给了就把链接渲染成图标。默认**只有图标**（图标按钮）：这时链接的可访问名与
   * 悬停提示改用 `link.label` —— 看不见文字不等于可以丢掉名字。
   */
  renderIcon?: (link: SiteLink) => ReactNode;
  /** 图标后面还跟着文字（首页「找我」那一行）；不传则只有图标 */
  showLabel?: boolean;
};

/**
 * 外链 → 图标。只看地址（协议、域名），**不看**配置里的显示名 —— 名字是文案、
 * 随时会改，图标不该跟着文案走；认不出来的给一个通用链接图标。
 *
 * 图标统一 16px（`size-4`）：和 14px 的导航文字排在一行时，16px 的图形才和汉字
 * 一样"重"。用的都是 Remix 的 `-line` 变体，笔画粗细一致。
 *
 * 顶栏（图标按钮）与首页「找我」（图标 + 文字）共用，避免两处各写一遍这段判断。
 */
export function iconOf(link: SiteLink) {
  if (link.href.startsWith("mailto:")) return <MailIcon className="size-4" />;
  if (link.href === githubUrl()) return <GitHubIcon className="size-4" />;
  if (/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\//.test(link.href)) {
    return <XIcon className="size-4" />;
  }
  return <LinkIcon className="size-4" />;
}

/**
 * 渲染配置里的外链列表：http(s) 链接新窗口打开并补 rel，mailto 等同窗口跳转。
 *
 * 首页「找我」与顶栏共用，避免两处各写一遍这段判断；顶栏传 `renderIcon`，
 * 把它渲染成一行图标按钮。
 */
export function SiteLinkList({
  links,
  className,
  linkClassName,
  renderIcon,
  showLabel,
}: SiteLinkListProps) {
  return (
    <ul className={className}>
      {links.map((link) => {
        const external = link.href.startsWith("http");
        const icon = renderIcon?.(link) ?? null;
        /** 只有图标、没有文字时，名字得挪到 aria-label / title 上 */
        const iconOnly = icon !== null && !showLabel;

        return (
          <li key={link.href}>
            <a
              href={link.href}
              className={linkClassName}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              {...(iconOnly ? { "aria-label": link.label, title: link.label } : {})}
            >
              {icon}
              {iconOnly ? null : link.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
