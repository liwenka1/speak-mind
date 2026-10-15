import { ArrowUpRightIcon } from "lucide-react";
import { SiteLinkList, iconOf } from "@/components/layout/site-links";
import { authorLinks, repoUrl, siteConfig } from "@/config/site";
import { enterAt } from "@/lib/enter";
import { fill } from "@/lib/template";

/**
 * 首页：一个居中的窄列，**上面一行是名字，下面全是正文段落**。
 *
 * 名字（h1）**刻意不参与入场动画**：标题一上来就在，随后正文自上而下浮现 —— 层次
 * 是"标题定住、内容进场"，整体不显得整页在动。
 *
 * 正文依次是首段自我介绍、「在做」（一个项目一行：项目名 badge + 一句话描述）、
 * 最后是「找我」那一行联系方式。分区不在这里再列一遍：顶栏导航已经把它们全列出来了。
 *
 * **出场顺序 = 排版顺序**：每一块挂上 `.enter` 并用 `enterAt()` 给出自己的序号
 * （延时 `序号 × 90ms`，规则见 globals.css）。纯 CSS，服务端渲染就带上了，不需要
 * 客户端组件。
 *
 * 句子全部来自 siteConfig.text.home，这里不写死文案。
 */
const text = siteConfig.text.home;

/** 文案里 `{author}` 的值 */
const VALUES = { author: siteConfig.author.name };

/**
 * 出场序号：**从 1 起**（第一块也停一拍再出现），顺序是
 * 首段 1 → 「在做」引子 2 → 每个项目 3… →「找我」引子 → 联系方式那一行。
 * 大标题不在序号里 —— 它不参与动画。`.enter` 最多等 8 拍：项目多到总块数
 * 超过 8 时，超出的几块会一起出来。
 */
const INTRO_STAGE = 1;
const DOING_STAGE = 2;
/** 「在做」占 1 块引子 + 每个项目 1 块，「找我」的引子紧随其后 */
const CONTACT_STAGE = DOING_STAGE + 1 + text.doing.items.length;

export default function Home() {
  const { name } = siteConfig.author;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      {/*
        大标题就是名字本身 —— 顶栏左上角是站标（没有字样），所以这里不是重复。
        它**不挂 `.enter`**：标题不动，正文才逐个浮现（否则整页一起动，反而糊）。
        标题字体由 globals.css 里 h1–h6 那条规则统一给（含中文兜底）。
      */}
      <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>

      <article className="mt-8 space-y-6">
        <p className="enter" style={enterAt(INTRO_STAGE)}>
          {fill(text.intro, VALUES)}
        </p>

        {/*
          「在做」：一个项目一行 —— 左边项目名 badge（点进去是仓库），右边一句话描述；
          项目与描述都来自配置（text.doing.items）。

          宽屏两栏对齐：<ul> 是两栏网格（badge 那栏按最长的名字定宽），每个 <li> 用
          subgrid 跨两栏 —— 描述的左边缘对齐成一条线、长了只在右栏里折行，而每一行
          仍是一个整块，能挂 `.enter`。窄屏放不下两栏，就 badge 在上、描述在下。
        */}
        <div className="space-y-3">
          <p className="enter" style={enterAt(DOING_STAGE)}>
            {text.doing.title}
          </p>
          <ul className="grid gap-y-3 sm:grid-cols-[max-content_1fr] sm:gap-x-4 sm:gap-y-2">
            {text.doing.items.map((project, index) => (
              <li
                key={project.repo}
                className="enter sm:col-span-2 sm:grid sm:grid-cols-subgrid sm:items-baseline"
                style={enterAt(DOING_STAGE + 1 + index)}
              >
                {/*
                  badge 就是链接，和 SiteLinkList 同一套「新窗口 + rel」；但每行右边还有
                  描述，套不进 SiteLinkList，所以直接写 <a>。

                  是灰底小标签而不是按钮 —— 按钮的样子只给「全页唯一的动作」（见分区页
                  的空状态）。看得出能点靠两样：名字后面的 ↗（和空状态「去 GitHub 写一条」
                  同一个图标），以及悬停底色 `muted-hover`（见 globals.css）。

                  `justify-self-start`：网格里的格子默认撑满栏宽，不加的话短名字的 badge
                  会被拉得和最长的那个一样宽。
                */}
                <a
                  href={repoUrl(project.repo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-0.5 justify-self-start rounded bg-muted px-1.5 py-0.5 text-sm leading-5 whitespace-nowrap transition-colors hover:bg-muted-hover"
                >
                  {project.repo}
                  <ArrowUpRightIcon className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
                </a>
                <p className="mt-1 sm:mt-0">{project.text}</p>
              </li>
            ))}
          </ul>
        </div>

        {/*
          「找我」就一行：图标 + 文字，内容与顺序都直接来自 authorLinks() ——
          和右上角是同一份，所以两处永远不会走散（要改顺序就改配置）。
        */}
        <div className="space-y-3">
          <p className="enter" style={enterAt(CONTACT_STAGE)}>
            {text.contact.title}
          </p>
          {/* 让包着 <ul> 的这层入场：SiteLinkList 不必知道有动画这回事 */}
          <div className="enter" style={enterAt(CONTACT_STAGE + 1)}>
            <SiteLinkList
              links={authorLinks()}
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
              linkClassName="inline-flex items-center gap-1.5 opacity-60 transition-opacity hover:opacity-100"
              renderIcon={iconOf}
              showLabel
            />
          </div>
        </div>
      </article>
    </main>
  );
}
