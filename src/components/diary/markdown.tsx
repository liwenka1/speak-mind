import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * 纯展示组件：把 GitHub Issue 的 GFM 正文渲染成 React 节点。
 * 不掺入任何数据获取逻辑，只接收最终要展示的文本。
 */
export function DiaryMarkdown({ content }: { content: string }) {
  return (
    <div className="diary-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
