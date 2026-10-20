"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useTheme } from "next-themes";
import { willowConfig } from "@/config/willow";
import { startWillow, type Willow } from "@/lib/willow";

/** 中间淡出的遮罩（配置里设成 null 就不加） */
const maskStyle: CSSProperties | undefined = willowConfig.mask
  ? { maskImage: willowConfig.mask, WebkitMaskImage: willowConfig.mask }
  : undefined;

/**
 * 全站共用的背景柳枝：先长出来，长完随风摆（画法见 `src/lib/willow.ts`，手感在 `src/config/willow.ts`）。
 * 挂在根布局里，切换页面时不会重新挂载 —— 只有刷新或第一次打开才重新长一棵。
 *
 * 一张 `fixed` 铺满视口的 canvas，`-z-10` 压在正文下面：页面背景色由 body 传给了根画布，
 * 负 z-index 的元素正好画在它上面、正文下面。`pointer-events-none` 不挡点击，打印时隐藏。
 *
 * 颜色跟着站内的日夜切换走：`resolvedTheme` 由 next-themes 给出，客户端首帧就是真实值
 * （只在 effect 里用，不参与渲染，所以不会有水合不一致）。
 */
export function WillowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const willowRef = useRef<Willow | null>(null);
  const { resolvedTheme } = useTheme();
  const color =
    resolvedTheme === "dark" ? willowConfig.color.dark : willowConfig.color.light;

  // 挂载时开始长（根布局里只挂载一次：刷新或第一次打开），卸载时停掉
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const willow = startWillow(canvas, willowConfig);
    willowRef.current = willow;
    return () => {
      willow.destroy();
      willowRef.current = null;
    };
  }, []);

  // 给上当前主题的颜色；切换日夜模式时再换。排在上面那个 effect 后面，挂载时也会立刻跑一次
  useEffect(() => {
    willowRef.current?.setColor(color);
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 size-full print:hidden"
      style={maskStyle}
    />
  );
}
