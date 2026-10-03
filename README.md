# speak-mind

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 内容（由 GitHub Issues 驱动）

站点内容直接来自本仓库的 **GitHub Issues**，不需要数据库或后台。

### 站点配置

站点的**所有信息与文案**都集中在 [`src/config/site.ts`](src/config/site.ts)，组件里不写死任何一句话 —— 改站名、改口号、改措辞都只动这一个文件。

```ts
name: "speak-mind",          // 顶栏站名 / 页脚版权 / <title> 后缀
lang: "zh-CN",               // <html lang>，也是日期格式化的语言
timeZone: "Asia/Shanghai",   // 日期显示的时区
description: "…",            // 首页的 meta description
author: {
  name: "liwenka1",          // 首页自我介绍里的名字（会加粗显示）
  email: "",                 // 填了就自动出现在首页「找我」与页脚
  links: [],                 // 其他平台外链；GitHub 主页不用写这里
},
github: { user: "liwenka1", repo: "speak-mind" },  // 个人主页与仓库地址都由它推导
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
  about: { description: "{title} {name}", lead: "…", paragraphs: ["…"] },
  section: {               // 分区列表页
    description: "{name} 的{title}",
    hint: "来自 GitHub Issues —— 打了 {label} 标签的内容会出现在这里。",
    empty: {               // 没有内容时渲染空状态（shadcn 的 Empty 组件）
      description: "打上 {label} 标签的 issue 会自动出现在这个分区里。",
      action: "去 GitHub 写一条",   // 跳到新建 issue，标签已预填
    },
    error: "暂时读不到内容：{error}",   // 读取失败时也用 Empty 渲染
  },
  entry: { … },            // 内容详情页的文案
  footer: { copyright: "© {year} {name}" },
  links: { github: "GitHub", email: "邮箱", source: "源码" },  // 推导链接的显示名
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
- 分区还没内容时渲染**空状态**（shadcn 的 [`Empty`](src/components/ui/empty.tsx)）：图标 + `text.section.empty` 的说明，加一个链接按钮直接跳到 GitHub 新建 issue 并**预填该分区标签**（地址由 `newIssueUrl()` 推导）。空状态不带大标题，也不加边框（用 registry 默认版式）。读取失败时复用同一套 `Empty` 外壳，图标带 destructive 色调。有内容时上方才显示 `hint`，避免同一句话说两遍。

### 去重规则

同一个**事实**只写一次，其他地方一律引用或推导：

- **URL 不是独立事实**：GitHub 主页（`githubUrl()`）、仓库地址（`repoUrl()`）、新建 issue（`newIssueUrl()`）、分区页路径（`sectionPath()`）、详情页路径（`entryPath()`）全部由配置拼出来 —— 配置里、组件里都不要手写 `https://github.com/...` 或 `/tag/xxx`。
- **名字不重抄**：页面名字写在 `pages` / `sections` 里，别处的文案要引用就写占位符（如关于页 description 的 `{title}`）。
- **值恰好相同 ≠ 同一个事实**：`author.name`（显示名）与 `github.user`（GitHub 用户名）当前都是 `liwenka1`，但将来会各自变化（比如显示名改成中文名），所以故意分开配置，不要合并。
- `lang` / `timeZone` 也同时供日期格式化使用（见 [`src/lib/format.ts`](src/lib/format.ts)），改一处全站生效。

有些重复是**故意保留**的（去重只针对「会一起变化的事实」）：`github.repo` 与 `name` 可能同值但语义不同（不默认取站名，避免静默指向错仓库）；`package.json` 的包名读不到 TS 配置；README 的示例需与配置同步。

### 写内容

在 GitHub 上新建 issue → 写好标题和正文 → 打上对应分区的标签（标签名第一次用时可直接新建）。页面缓存 1 小时，稍后刷新即可看到。

### 评论

评论会**只读展示**在内容详情页底部（`/entry/<编号>`）。站点不提供发表评论的能力 —— 想参与就点评论区底部的「去 GitHub 参与讨论」，回到对应的 issue。

- 评论条数直接来自 GitHub 的 issue 对象；**只有确实有评论时**才去请求评论列表。正文与评论分别降级 —— 评论读不到不影响读正文。
- 评论的 Markdown 与正文共用同一套渲染（GFM），**不启用 raw HTML**。
- 头像用原生 `<img>` 渲染，不走 `next/image`：后者的域名白名单是构建期配置，而头像地址是运行时数据，没配上的域会让整个页面报错 —— 不值得为一个装饰性头像连累正文。

### 路由

| 路径 | 说明 |
| --- | --- |
| `/` | 首页（自我介绍） |
| `/tag/<label>` | 分区列表 |
| `/entry/<编号>` | 内容详情 |
| `/about` | 关于 |

> 页面名由顶栏导航的高亮承担，页面里不再重复一个大标题。为了屏幕阅读器和文档大纲，每个页面仍保留一个 `sr-only` 的 `<h1>`（视觉上不显示）。内容详情页的 `<h1>` 是 issue 自己的标题，不属于重复，保留显示。

### 环境变量

| 变量 | 说明 |
| --- | --- |
| `GITHUB_TOKEN` | 可选；GitHub 匿名接口限流 60 次/小时，配只读 token 可提升到 5000 次/小时 |
| `REVALIDATE_SECONDS` | 可选；内容缓存时长（秒），默认 `3600`。本地调试设 `1` 可做到「写完刷新就能看到」 |

> 这两个变量都**仅在服务端读取**，切勿加 `NEXT_PUBLIC_` 前缀。站点名、仓库与分区属于站点信息，写在 `src/config/site.ts` 里 —— 环境变量只放**部署相关的密钥与策略**。
>
> **缓存其实有两层**，`REVALIDATE_SECONDS` 只管第一层：
>
> 1. **数据缓存**：GitHub 响应的缓存时长，由 `REVALIDATE_SECONDS` 控制（本地用 `.env.local` 覆盖）。
> 2. **页面缓存**：`src/app/tag/[label]/page.tsx` 与 `src/app/entry/[number]/page.tsx` 里的 `export const revalidate = 3600`。Next 要求这里是字面量（要静态分析），所以它读不了环境变量 —— 调整线上更新策略时，这两处要跟 `REVALIDATE_SECONDS` 一起改。

### 内容更新后秒级刷新（可选）

默认只靠 `REVALIDATE_SECONDS` 定时过期，最长要等一个 TTL 才看得到更新。配上 GitHub Webhook 就能做到**发布即刷新**，平时零轮询开销：

1. 生成本地/线上各自的 secret：`openssl rand -hex 32`
2. 在部署环境里配上它（Vercel → Settings → Environment Variables）：`GITHUB_WEBHOOK_SECRET=<刚生成的值>`
3. 仓库 → Settings → Webhooks → Add webhook：
   - **Payload URL**：`https://<你的域名>/api/revalidate`
   - **Content type**：`application/json`
   - **Secret**：与第 2 步**完全一致**
   - **Which events**：勾 **Issues** 与 **Issue comments**
4. GitHub 会先发一个 `ping`，接口返回 `{"ok":true}` 就算接通了。

之后 issue 的**新建 / 修改 / 删除 / 关闭 / 重开 / 打标签 / 取消标签**，以及评论的**新增 / 修改 / 删除**都会立刻刷新；其他事件（push、assigned…）会被忽略。不配这个 webhook 也完全能用，只是更新延迟由 TTL 决定。

**接口防护**（实现见 [`src/app/api/revalidate/route.ts`](src/app/api/revalidate/route.ts)）：

- 只接受 POST；必须带 `X-Hub-Signature-256`，用 secret 对**原始请求体**做 HMAC-SHA256 并**常量时间比较** —— 没有 secret 的人无法触发刷新，所以不需要额外的限流。
- **没配 secret 就直接 500**（fail closed），绝不会「跳过校验」裸奔；站点其余功能不受影响。
- 签名通过之后才判断事件类型与仓库，只认本仓库的 `issues` 事件。
- 认证失败一律同一个 401，不回显 payload 或错误细节。

本地 dev 收不到 webhook（除非开隧道），日常仍用 `.env.local` 里的 `REVALIDATE_SECONDS=1`。想单独测这个接口，自己签一个 payload：

```bash
SECRET=...    # 与 .env.local 里的 GITHUB_WEBHOOK_SECRET 一致
BODY='{"action":"opened","repository":{"full_name":"liwenka1/speak-mind"}}'
SIG="sha256=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')"

curl -i -X POST http://localhost:3000/api/revalidate \
  -H "X-GitHub-Event: issues" \
  -H "X-Hub-Signature-256: $SIG" \
  --data "$BODY"
# 200 = 通过；把签名改一个字符再试 → 401
```

### 部署到 Vercel

1. 把仓库导入 Vercel 即可，无需额外构建配置。
2. 在 **Settings → Environment Variables** 中添加 `GITHUB_TOKEN`（只读 PAT）。
   - **强烈建议配置**：Vercel 的构建与函数使用**共享出口 IP**，GitHub 匿名接口 60 次/小时的额度很容易被其它用户耗尽，会导致构建失败或页面报错；配了 token 则是 5000 次/小时（按你的 token 计）。有评论的内容详情页会多一次请求（正文 + 评论各一个），`GITHUB_TOKEN` 就更值得配了。

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
