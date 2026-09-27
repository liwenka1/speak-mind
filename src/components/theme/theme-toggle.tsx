"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 日夜模式切换：一个按钮直接切换浅色 / 深色。
 *
 * 首次访问默认跟随系统（由 ThemeProvider 的 defaultTheme="system" 决定）。
 * 图标靠 `dark:` 变体显隐 —— 可见性由 <html class="dark"> 决定，
 * 该类由 next-themes 的首屏脚本在绘制前写好，因此不会闪烁、也无水合不一致。
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={resolvedTheme === "dark" ? "切换到浅色" : "切换到深色"}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
    </Button>
  );
}
