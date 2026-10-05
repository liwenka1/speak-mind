import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * 纯展示组件：把 GitHub Issue 的 GFM 正文渲染成 React 节点。
 * 不掺入任何数据获取逻辑，只接收最终要展示的文本。
 *
 * 排版交给 shadcn/typeset：`typeset` 打开样式、`typeset-article` 是中文预设
 * （文件与预设分别见 `src/app/typeset.css` 和 `globals.css`），
 * 所以这里不再手写任何元素样式。
 */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="typeset typeset-article">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
