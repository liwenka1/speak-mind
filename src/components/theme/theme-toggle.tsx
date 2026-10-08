"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@/components/icons/remix";
import { siteConfig } from "@/config/site";

const subscribeNoop = () => () => {};
/** 服务端（以及客户端首帧）返回 false，水合结束后返回 true。 */
const getIsHydrated = () => true;
const getIsHydratedOnServer = () => false;

/**
 * 日夜模式切换：一个按钮直接切换浅色 / 深色。
 *
 * 外观与顶栏其它条目一致 —— 60% 透明、hover 到 100%，没有底色也没有边框，
 * 所以这里用原生 `<button>` 而不是 shadcn 的 `Button`（它是真按钮、不是链接，
 * 但不需要 button 组件那身皮；ghost 的 hover 底色会让它和旁边的分区链接不同款）。
 *
 * 首次访问默认跟随系统（由 ThemeProvider 的 defaultTheme="system" 决定）。
 * 图标靠 `dark:` 变体显隐 —— 可见性由 <html class="dark"> 决定，
 * 该类由 next-themes 的首屏脚本在绘制前写好，因此图标不会闪烁。
 *
 * 但 `resolvedTheme` 不能直接参与渲染：next-themes 只在浏览器里读取
 * localStorage / prefers-color-scheme，服务端恒为 undefined，而客户端首帧
 * 就能算出真实值（如系统深色 → "dark"）。两边算出的 aria-label 不同会触发
 * React 水合报错（且 React 不会修正该属性），所以水合完成前按“未确定”渲染。
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    getIsHydrated,
    getIsHydratedOnServer,
  );

  const isDark = isHydrated && resolvedTheme === "dark";
  const { theme } = siteConfig.text;
  // 水合完成前主题还没定下来，用中性文案，别让读屏念出相反的操作
  const label = isHydrated
    ? isDark
      ? theme.toLight
      : theme.toDark
    : theme.unknown;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex items-center rounded-md opacity-60 transition-opacity outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {/* 图标与联系方式统一 16px（按钮组件默认那条只给 14px） */}
      <MoonIcon className="size-4 dark:hidden" />
      <SunIcon className="hidden size-4 dark:block" />
    </button>
  );
}
