import { SITE_LOGO_PATH, SITE_LOGO_VIEW_BOX } from "@/components/layout/site-logo";

/**
 * 站点图标（favicon）：与顶栏那个「wk」**同一个字形**，只换两个参数 ——
 *
 * - **笔画 4.5**（顶栏是 3）：比顶栏略粗一点就够，十几像素里再粗就成一团了。这个数是按
 *   「墨迹像素量」跟参照站的 favicon 对齐出来的 —— 他 16/32/48px 是 25/115/275 个墨迹
 *   像素，我们是 25/118/270，基本一致（之前用 12 时明显粗了一倍，被你一眼看出来）；
 * - **不做动画**（标签页里毫无意义），并加一段 `prefers-color-scheme` 的样式：
 *   浏览器是深色就画浅色、浅色就画深色。这是参照站的做法。
 *
 * 为什么用 route 而不是直接放 `app/icon.svg` 这个静态文件：那样 `d` 就得手抄一份，
 * 改了顶栏的标记很容易忘了改图标。这里直接复用 `SITE_LOGO_PATH`，一处改、两处生效。
 *
 * 为什么路径是 `/icon` 而不是 `/icon.svg`：目录名写成 `icon.svg` 会撞上 Next 的
 * 元数据文件约定（它会把 `app/icon.svg` 当成静态图标去解析，构建立刻报 module
 * not found）；换个不带扩展名的路由段就没这问题，浏览器只看 Content-Type。
 * 代价是约定文件没了，得在根布局的 metadata 里显式声明（见 layout.tsx）。
 *
 * 注意 favicon 只能跟**系统**的明暗（`prefers-color-scheme`），跟不了站内的
 * `.dark` 类 —— 用户在站内手动切主题时，标签页图标不一定跟着变（参照站也是这样）。
 */
export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${SITE_LOGO_VIEW_BOX}">
  <style>
    .a { stroke: #262322 }
    @media (prefers-color-scheme: dark) { .a { stroke: #faf9f8 } }
  </style>
  <path class="a" d="${SITE_LOGO_PATH}" fill="none" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // 内容只随代码变；给个不太长的缓存，换字形后不至于长时间卡在旧图上
      "Cache-Control": "public, max-age=3600",
    },
  });
}
