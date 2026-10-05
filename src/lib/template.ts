/**
 * 文案模板工具。
 *
 * `src/config/site.ts` 里的文案可以用 `{name}`、`{title}` 这样的占位符，
 * 渲染时再把值填进去：**句子写在配置里，值来自配置或路由**。
 * 没给值的占位符按原样输出，方便一眼看出漏配。
 */

const PLACEHOLDER = /\{(\w+)\}/g;

/** 填充占位符（meta description、页脚版权、错误提示这类纯文本都用它）。 */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(PLACEHOLDER, (placeholder, key: string) =>
    key in values ? String(values[key]) : placeholder,
  );
}
