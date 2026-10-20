# speak-mind

VVenKAI 的个人站，分博客、日记、随笔三个分区。

内容就是这个仓库的 **GitHub Issues**：写一条 issue、打上分区标签，它就出现在站上；issue 下面的评论就是评论区。不需要数据库，也没有后台。

技术栈：Next.js 16 · React 19 · Tailwind CSS 4 · shadcn/ui

## 写内容

1. 在本仓库新建 issue，标题和正文（Markdown）就是文章。
2. 打上分区标签：`blog` 博客、`diary` 日记、`essay` 随笔（标签第一次用时在 GitHub 上新建）。**没打标签的 issue 不会公开。**
3. 关闭 issue 是从列表下架（详情页链接还能打开）；去掉标签才是彻底下线。

评论在详情页底部只读展示，想参与讨论就去对应的 issue 下留言。

## 配置

站名、作者、分区和页面文案都在 [`src/config/site.ts`](src/config/site.ts)，改这一个文件就行。

## 本地开发

```bash
pnpm install
pnpm dev   # http://localhost:3000
```

可选的环境变量见 [`.env.example`](.env.example)（复制成 `.env.local` 再填）。

## 部署

导入 Vercel 即可，不需要额外的构建配置。环境变量都只在服务端读取：

| 变量 | 作用 |
| --- | --- |
| `GITHUB_TOKEN` | 只读 token，GitHub 接口限额从 60 次/小时提到 5000 次/小时；线上建议配 |
| `REVALIDATE_SECONDS` | 内容缓存时长（秒），默认 `3600` |
| `GITHUB_WEBHOOK_SECRET` | 配合下面的 webhook：issue 一有改动，站上立刻刷新 |

想让改动立刻生效，就在仓库 **Settings → Webhooks** 加一个：Payload URL 填 `https://<你的域名>/api/revalidate`，Content type 选 `application/json`，Secret 与 `GITHUB_WEBHOOK_SECRET` 一致，事件勾 **Issues** 和 **Issue comments**。不配也能用，只是要等缓存过期。

## License

[MIT](LICENSE)
