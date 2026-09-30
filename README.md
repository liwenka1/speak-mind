# speak-mind

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 内容（由 GitHub Issues 驱动）

站点内容直接来自本仓库的 **GitHub Issues**，不需要数据库或后台。

### 站点配置

站点的**所有信息与文案**都集中在 [`src/config/site.ts`](src/config/site.ts)，组件里不写死任何一句话 —— 改站名、改口号、改措辞都只动这一个文件。

```ts
name: "speak-mind",        // 顶栏站名 / 页脚版权 / <title> 后缀
lang: "zh-CN",             // <html lang>
description: "…",          // 首页的 meta description
author: {
  name: "liwenka1",        // 首页自我介绍里的名字（会加粗显示）
  email: "",               // 填了就自动出现在首页「找我」与页脚
  links: [{ label: "GitHub", href: "https://github.com/liwenka1" }],
},
repo: { owner: "liwenka1", name: "speak-mind" },  // 内容仓库，页脚「源码」链接由它推导
pages: {
  home: { href: "/", title: "首页" },
  about: { href: "/about", title: "关于" },
},
sections: [
  { title: "日记", label: "diary" },
  { title: "三言两语", label: "note" },
  { title: "随笔", label: "essay" },
],
text: {                    // 页面文案，按页面分组
  home: {
    greeting: { before: "Hey! 我是 ", after: "，一个喜欢把想法随手记下来的人。" },
    intro: "…",
    doing: { title: "在做", items: ["…", "…"] },
    sections: { title: "分区", hint: " —— 打上 {label} 标签的 issue" },
    contact: { title: "找我" },
  },
  about: { description: "关于 {name}", lead: "…", paragraphs: ["…"] },
  section: { … },          // 分区列表页的说明 / 空状态 / 出错提示
  entry: { … },            // 内容详情页的文案
  footer: { copyright: "© {year} {name}", source: "源码" },
  titleTemplate: "%s · {name}",
  theme: { … }, common: { … },
},
```

文案里的 `{xxx}` 是占位符，渲染时才填值：`{name}` 站名、`{label}` 分区标签、`{title}` 分区名、`{year}` 年份、`{error}` 错误信息。占位符既能渲染成带样式的元素（比如分区页里的 `{label}` 会显示成 `code` 样式），也能用在 `<title>` 这种纯文本里；**没配值的占位符会原样显示**，方便一眼看出漏配。实现见 [`src/lib/template.ts`](src/lib/template.ts)。

- 导航结构是 **首页 + 分区 + 关于**：首尾两项来自 `pages`，中间的分区来自 `sections`。
- `sections` 里 `title` 是显示名，`label` 是对应的 GitHub issue 标签；增删分区、改名字、换标签都只改这里（数量不限）。
- 每个分区会自动生成一个静态页 `/tag/<label>`。
- 子页面标题不用自己拼站名：`text.titleTemplate` 会补成「某某 · 站名」。
- 「关于」页正文按段配置：`lead` 是首段（正常字色），`paragraphs` 是后续段落（浅色），可增删。

### 写内容

在 GitHub 上新建 issue → 写好标题和正文 → 打上对应分区的标签（标签名第一次用时可直接新建）。页面缓存 1 小时，稍后刷新即可看到。

### 路由

| 路径 | 说明 |
| --- | --- |
| `/` | 首页（自我介绍） |
| `/tag/<label>` | 分区列表 |
| `/entry/<编号>` | 内容详情 |
| `/about` | 关于 |

### 环境变量

| 变量 | 说明 |
| --- | --- |
| `GITHUB_TOKEN` | 可选；GitHub 匿名接口限流 60 次/小时，配只读 token 可提升到 5000 次/小时 |

> `GITHUB_TOKEN` 仅在服务端读取，切勿加 `NEXT_PUBLIC_` 前缀。站点名、仓库与分区都写在 `src/config/site.ts` 里，不放环境变量。

### 部署到 Vercel

1. 把仓库导入 Vercel 即可，无需额外构建配置。
2. 在 **Settings → Environment Variables** 中添加 `GITHUB_TOKEN`（只读 PAT）。
   - **强烈建议配置**：Vercel 的构建与函数使用**共享出口 IP**，GitHub 匿名接口 60 次/小时的额度很容易被其它用户耗尽，会导致构建失败或页面报错；配了 token 则是 5000 次/小时（按你的 token 计）。

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

字体通过 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 加载：标题用 Playfair Display（衬线），正文用 Noto Sans，中文会自动回退到系统字体（宋体 / 黑体）。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
