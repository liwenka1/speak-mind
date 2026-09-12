# speak-mind

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 日记（由 GitHub Issues 驱动）

`/diary` 页面把本仓库中**带 `diary` 标签的 issue** 渲染成日记列表，不需要数据库或后台。

**写一条日记**：在 GitHub 上新建 issue → 写好标题和正文 → 给它加上 `diary` 标签（标签名第一次用时可直接新建）。页面缓存 1 小时，稍后刷新即可看到。

**可配置的环境变量**（都带默认值，不配置也能跑）：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `GITHUB_OWNER` | `liwenka1` | 仓库所属用户 / 组织 |
| `GITHUB_REPO` | `speak-mind` | 仓库名 |
| `DIARY_LABEL` | `diary` | 作为日记的标签名 |
| `GITHUB_TOKEN` | 空 | 可选；GitHub 匿名接口限流 60 次/小时，配只读 token 可提升到 5000 次/小时 |

> `GITHUB_TOKEN` 仅在服务端读取，切勿加 `NEXT_PUBLIC_` 前缀。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
