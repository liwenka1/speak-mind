import { Playfair_Display } from "next/font/google";
import { ArrowUpRightIcon } from "lucide-react";
import { SiteLinkList, iconOf } from "@/components/layout/site-links";
import { WillowBackground } from "@/components/willow/willow-background";
import { authorLinks, repoUrl, siteConfig } from "@/config/site";
import { enterAt } from "@/lib/enter";
import { fill } from "@/lib/template";
import { cn } from "@/lib/utils";

/**
 * 首页：一个居中的窄列，**上面是名字和一句座右铭，下面全是正文段落**。
 *
 * 名字（h1）与座右铭**刻意不参与入场动画**：标题一上来就在，随后正文自上而下浮现
 * —— 层次是"标题定住、内容进场"，整体不显得整页在动。
 *
 * 正文依次是首段自我介绍（下面紧跟一行别的叫法）、「在做」（一行项目名 badge，
 * 点进去是仓库）、最后是「找我」那一行联系方式。分区不在这里再列一遍：顶栏导航已经
 * 把它们全列出来了。
 *
 * **出场顺序 = 排版顺序**：每一块挂上 `.enter` 并用 `enterAt()` 给出自己的序号
 * （延时 `序号 × 90ms`，规则见 globals.css）。纯 CSS，服务端渲染就带上了，不需要
 * 客户端组件。
 *
 * 背景是一棵柳树（`WillowBackground`，只在首页）：先长出来，长完随风摆。它固定铺满视口、
 * 压在正文下面，不占排版位置；想调手感改 `src/config/willow.ts`。
 *
 * 句子全部来自 siteConfig.text.home，这里不写死文案。
 */
const text = siteConfig.text.home;

/** 文案里 `{author}` 的值 */
const VALUES = { author: siteConfig.author.name };

/**
 * 出场序号：**从 1 起**（第一块也停一拍再出现），顺序是
 * 首段 1 → 「在做」引子 2 → 项目那一行 3 →「找我」引子 4 → 联系方式那一行 5。
 * 大标题不在序号里 —— 它不参与动画。两行链接都是整行算一块（不是一个链接一拍），
 * 所以项目再多，序号也不变。
 */
const INTRO_STAGE = 1;
const DOING_STAGE = 2;
/** 「在做」占 2 块（引子 + 项目那一行），「找我」的引子紧随其后 */
const CONTACT_STAGE = DOING_STAGE + 2;

/**
 * 座右铭用的 **Playfair Display 真斜体**。
 *
 * 根布局里那份 Playfair 只有正体；不另外加载斜体的话，`italic` 只会让浏览器把正体
 * 硬掰斜（faux italic）—— Playfair 的斜体是另画的一套字形，掰出来的差一截。
 *
 * **只在这一页声明**：next/font 在哪个文件里调用，就只在对应的路由上预加载。放进根布局
 * 的话，每个页面都会多预加载一个只有首页用得上的斜体文件。
 */
const playfairItalic = Playfair_Display({
  subsets: ["latin"],
  style: "italic",
});

export default function Home() {
  const { name, motto } = siteConfig.author;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      {/* 柳枝背景：fixed 铺满视口、压在正文下面，放在哪儿都不影响排版 */}
      <WillowBackground />
      {/*
        大标题就是名字本身 —— 顶栏左上角是站标（没有字样），所以这里不是重复。
        它**不挂 `.enter`**：标题不动，正文才逐个浮现（否则整页一起动，反而糊）。
        标题字体由 globals.css 里 h1–h6 那条规则统一给（含中文兜底）。
      */}
      <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
      {/*
        座右铭紧贴着名字，和名字算同一块 —— 同样**不挂 `.enter`**：名字和这句一起先在，
        下面的正文再逐个浮现。文案来自 author.motto，留空就不渲染这一行。
      */}
      {motto ? (
        <p
          className={cn(
            playfairItalic.className,
            "mt-2 text-lg text-muted-foreground italic",
          )}
        >
          {motto}
        </p>
      ) : null}

      <article className="mt-8 space-y-6">
        {/*
          首段 + 紧跟着的一行别的叫法（aka，留空则不显示）：两行算一块、一起入场，
          中间不空行 —— 它是自我介绍的后半句，不是新的一段。

          `text-pretty`：窄屏折行时别让最后一行只剩一个字（「者。」「好。」）；
          不支持 `text-wrap: pretty` 的浏览器照常折行。
        */}
        <div className="enter text-pretty" style={enterAt(INTRO_STAGE)}>
          <p>{fill(text.intro, VALUES)}</p>
          {text.aka ? <p>{fill(text.aka, VALUES)}</p> : null}
        </div>

        {/*
          「在做」：一行项目名 badge，点进去是仓库；项目来自配置（text.doing.items，
          只写仓库名）。不带描述 —— 项目是做什么的，仓库里写着。

          和「找我」一样**整行算一块**入场；放不下就自动换行（窄屏会折成两三行）。
          badge 自带底色，彼此隔 8px 就分得开，不用像「找我」那样隔 16px。
        */}
        <div className="space-y-3">
          {/* 引子是浅色：它只是给下面的内容起个头（「找我」同款） */}
          <p
            className="enter text-muted-foreground"
            style={enterAt(DOING_STAGE)}
          >
            {text.doing.title}
          </p>
          <ul
            className="enter flex flex-wrap gap-2"
            style={enterAt(DOING_STAGE + 1)}
          >
            {text.doing.items.map((repo) => (
              <li key={repo}>
                {/*
                  badge 就是链接，和 SiteLinkList 同一套「新窗口 + rel」；但 ↗ 跟在名字
                  后面（SiteLinkList 的图标在前），套不进去，所以直接写 <a>。

                  是灰底小标签而不是按钮 —— 按钮的样子只给「全页唯一的动作」（见分区页
                  的空状态）。看得出能点靠两样：名字后面的 ↗（和空状态「去 GitHub 写一条」
                  同一个图标），以及悬停底色 `muted-hover`（见 globals.css）。
                */}
                <a
                  href={repoUrl(repo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-sm leading-5 whitespace-nowrap transition-colors hover:bg-muted-hover"
                >
                  {repo}
                  <ArrowUpRightIcon className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/*
          「找我」就一行：图标 + 文字，内容与顺序都直接来自 authorLinks() ——
          和右上角是同一份，所以两处永远不会走散（要改顺序就改配置）。

          每个链接是「浅色图标 + 实色文字 + 底下一条细线」，悬停时**只有那条线**变实，
          图标和文字都不动。不用顶栏那套 60% 透明：顶栏是一排安静的入口，这里是正文里
          的链接，字得看得清；能点靠那条线来提示。图标仍是顶栏同一套 Remix 线性图标
          （见 iconOf）。

          线的变化是 300ms 的渐变，曲线用 CSS 的 `ease-in-out` 关键字（与参考的
          antfu.me 一致）。别换成 Tailwind 的 `ease-in-out` 类：它其实是
          `cubic-bezier(0.4, 0, 0.2, 1)`，前 150ms 就走完八成，看着还是像直接跳过去；
          CSS 关键字是前后对称的，变化均匀铺满 300ms。
        */}
        <div className="space-y-3">
          <p
            className="enter text-muted-foreground"
            style={enterAt(CONTACT_STAGE)}
          >
            {text.contact.title}
          </p>
          {/* 让包着 <ul> 的这层入场：SiteLinkList 不必知道有动画这回事 */}
          <div className="enter" style={enterAt(CONTACT_STAGE + 1)}>
            <SiteLinkList
              links={authorLinks()}
              className="flex flex-wrap items-center gap-x-4 gap-y-3"
              linkClassName="inline-flex items-center gap-1.5 border-b border-border transition-colors duration-300 ease-[ease-in-out] hover:border-foreground [&_svg]:text-muted-foreground"
              renderIcon={iconOf}
              showLabel
            />
          </div>
        </div>
      </article>
    </main>
  );
}
