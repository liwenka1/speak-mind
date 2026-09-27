import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * 纯展示组件：把 GitHub Issue 的 GFM 正文渲染成 React 节点。
 * 不掺入任何数据获取逻辑，只接收最终要展示的文本。
 */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
