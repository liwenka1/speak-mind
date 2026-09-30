import { createElement, Fragment, type ReactNode } from "react";

/**
 * 文案模板工具。
 *
 * `src/config/site.ts` 里的文案可以用 `{name}`、`{label}` 这样的占位符，
 * 渲染时再把值填进去：**句子写在配置里，值来自配置或路由**。
 * 没给值的占位符按原样输出，方便一眼看出漏配。
 */

const PLACEHOLDER = /\{(\w+)\}/g;
const ONE_PLACEHOLDER = /^\{(\w+)\}$/;

/** 填充成纯文本（用于 meta description、页脚版权这类只接受字符串的地方）。 */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(PLACEHOLDER, (placeholder, key: string) =>
    key in values ? String(values[key]) : placeholder,
  );
}

/**
 * 填充成 React 节点，占位符可以换成带样式的元素
 * （比如加粗的作者名、`code` 样式的标签名）。
 *
 * 文本片段原样保留，所以句子里的空格、标点不会被 JSX 的换行规则吃掉。
 */
export function fillNodes(
  template: string,
  nodes: Record<string, ReactNode>,
): ReactNode {
  const parts = template.split(/(\{\w+\})/g);

  return createElement(
    Fragment,
    null,
    ...parts.map((part, index) => {
      const key = ONE_PLACEHOLDER.exec(part)?.[1];
      const node = key === undefined ? undefined : nodes[key];

      // 不是占位符，或占位符没配值：按纯文本渲染
      if (node === undefined || node === null) return part;

      // 包一层 Fragment 并给 key，避免 React 对数组子元素报警告
      return createElement(Fragment, { key: index }, node);
    }),
  );
}
