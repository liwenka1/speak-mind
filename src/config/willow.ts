/**
 * 首页柳枝背景的配置 —— **想调手感只改这里**。
 *
 * 柳枝分两个阶段：
 *
 * 1. **生长**：主枝从屏幕边上伸进来，柳条一根根垂下、叶子一片片展开，`growTime` 秒长完；
 * 2. **摇摆**：形状不再变，只跟着风摆。长完先停 `growPause` 秒，风在 `windRamp` 秒里慢慢起来。
 *
 * 每次进入首页都随机长一棵新的。系统开了「减少动态效果」时不播动画，直接显示长好的样子（不摇）。
 *
 * 画法在 `src/lib/willow.ts`（那里的常数只管形状细节，一般不用动），
 * 组件在 `src/components/willow/willow-background.tsx`。
 */
export type WillowConfig = {
  /* —— 生长 —— */

  /** 生长时长（秒）：从第一根枝到最后一片叶子。换屏幕尺寸、换形状都是这么久 */
  growTime: number;
  /** 长完之后停多久再起风（秒） */
  growPause: number;
  /** 风从 0 加到满用多久（秒）：摆幅是慢慢变大的，不会突然开始动 */
  windRamp: number;

  /* —— 风 —— */

  /** 风力：1 = 和风（长柳条的梢头大约摆 20～30px），0 = 不摇，2 = 大风 */
  wind: number;
  /** 风速（摆动的快慢）：1 = 默认，小于 1 更慢更悠，大于 1 更急 */
  windSpeed: number;

  /* —— 样子 —— */

  /** 柳条疏密：1 = 默认，越大越密（也越费性能） */
  density: number;
  /** 柳条长短：1 = 默认（屏幕两边最长，大约垂到屏幕高度的七成；中间短，给正文留空） */
  length: number;
  /** 不透明度（0～1）：0.3 = 看得见、但不抢正文 */
  opacity: number;
  /**
   * 颜色：浅色 / 深色模式各一个，跟着站内的日夜切换走。
   * canvas 直接用这个值，写成 rgb 或 hex（透明度另由 `opacity` 管）。
   */
  color: { light: string; dark: string };
  /**
   * 中间淡出的遮罩（CSS `mask-image`）：正中透明、越往四周越清楚，正文那块几乎看不到柳枝。
   * 设成 `null` 就不淡出，整棵都一样清楚。
   */
  mask: string | null;

  /* —— 性能 —— */

  /** 摇摆阶段的帧率上限：柳条动得慢，30 帧就够顺，也省电（生长阶段跑满帧） */
  swayFps: number;
};

export const willowConfig: WillowConfig = {
  growTime: 8,
  growPause: 0.6,
  windRamp: 3,

  wind: 1,
  windSpeed: 1,

  density: 1,
  length: 1,
  opacity: 0.3,
  // 墨灰（与站内的暖灰一个色调）。想要柳绿：light "rgb(84 118 62)"、dark "rgb(150 184 120)"
  color: { light: "rgb(110 102 96)", dark: "rgb(184 176 170)" },
  mask: "radial-gradient(ellipse 70% 80% at 50% 45%, transparent 18%, #000 78%)",

  swayFps: 30,
};
