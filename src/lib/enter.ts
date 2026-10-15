import type { CSSProperties } from "react";

/**
 * 入场动画的序号工具。
 *
 * 元素挂上 `.enter` 后，用 `style={enterAt(n)}` 报出自己是第几块 —— `--i` 决定它
 * 晚多久出现（延时、时长、上限都在 globals.css 的 `.enter`）。className 照常手写，
 * 这里只给 style：两样分开，元素自己的类名不会被盖掉。
 *
 * 序号**从 1 起**（第一块也停一拍再出现），按排版顺序往下数；超过上限的一起出来。
 */
export function enterAt(stage: number): CSSProperties {
  return { "--i": stage } as CSSProperties;
}
