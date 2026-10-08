"use client";

import { useRef, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@/components/icons/remix";
import { siteConfig } from "@/config/site";

const subscribeNoop = () => () => {};
/** 服务端（以及客户端首帧）返回 false，水合结束后返回 true。 */
const getIsHydrated = () => true;
const getIsHydratedOnServer = () => false;

/** 扩散圆的动画时长（ms）—— globals.css 里那段伪元素规则是它的另一半 */
const REVEAL_DURATION = 480;

/** 系统「减弱动态效果」是否开着 */
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * 日夜模式切换：一个按钮直接切换浅色 / 深色。
 *
 * 外观与顶栏其它条目一致 —— 60% 透明、hover 到 100%，没有底色也没有边框，
 * 所以这里用原生 `<button>` 而不是 shadcn 的 `Button`（它是真按钮、不是链接，
 * 但不需要 button 组件那身皮；ghost 的 hover 底色会让它和旁边的分区链接不同款）。
 *
 * 切换本身用 View Transitions 做「从按钮扩散」：整页被快照成新旧两层，再让**新**
 * 层从一个圆放大到盖满视口（伪元素那半规则在 globals.css）。
 *
 * - 圆心取按钮自己的中心，而不是鼠标坐标 —— 键盘触发（Enter / Space）根本没有
 *   坐标，取按钮位置两种触发方式才一致；按钮在右上角，看着就是「从右上角扩散」。
 * - 半径取按钮中心到视口四个角里最远的距离，任何窗口尺寸都能盖满。
 * - `flushSync` 不能省：主题类名由 next-themes 在 effect 里写到 `<html>` 上，
 *   不强制同步刷一遍，快照取到的「新层」还是旧主题，动画就成了原地淡入。
 * - 浏览器不支持 View Transitions、或用户要求减少动效 → 直接切主题，没有动画，
 *   功能完全不受影响。
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
  const buttonRef = useRef<HTMLButtonElement>(null);
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

  const toggle = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const button = buttonRef.current;

    if (!button || !document.startViewTransition || prefersReducedMotion()) {
      setTheme(next);
      return;
    }

    const { top, left, right, bottom } = button.getBoundingClientRect();
    const x = (left + right) / 2;
    const y = (top + bottom) / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${radius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: REVEAL_DURATION,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      // 过渡被打断（比如动画没跑完用户又点了一下）时 ready 会 reject，忽略即可：
      // 主题本身已经切好了，只是没有圆
      .catch(() => {});
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      title={label}
      onClick={toggle}
      className="inline-flex items-center rounded-md opacity-60 transition-opacity outline-none hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {/* 图标与联系方式统一 16px（按钮组件默认那条只给 14px） */}
      <MoonIcon className="size-4 dark:hidden" />
      <SunIcon className="hidden size-4 dark:block" />
    </button>
  );
}
