import type { CSSProperties } from "react";
import { SiteLinkList, iconOf } from "@/components/layout/site-links";
import { authorLinks, repoUrl, siteConfig } from "@/config/site";
import { fill } from "@/lib/template";

/**
 * 首页：一个居中的窄列，**上面一行是名字，下面全是正文段落**。
 *
 * 名字（h1）**刻意不参与入场动画**：标题一上来就在，随后正文自上而下浮现 —— 层次
 * 是"标题定住、内容进场"，整体不显得整页在动。
 *
 * 正文依次是首段自我介绍、「在做」（短标签 + 说明，项目名渲染成内联小标签）、
 * 最后是「找我」那一行联系方式。分区不在这里再列一遍：顶栏导航已经把它们全列出来了。
 *
 * **出场顺序 = 排版顺序**：每一块挂上 `.enter` 并给出自己的序号（延时 `序号 × 90ms`，
 * 规则见 globals.css）。纯 CSS，服务端渲染就带上了，不需要客户端组件。
 *
 * 句子全部来自 siteConfig.text.home，这里不写死文案。
 */
const text = siteConfig.text.home;

/** 文案里 `{author}` 的值 */
const VALUES = { author: siteConfig.author.name };

/**
 * 出场序号：**从 1 起**（第一块也停一拍再出现），顺序是
 * 首段 1 → 「在做」引子 2 → 每条 3… →「找我」引子 → 联系方式那一行。
 * 大标题不在序号里 —— 它不参与动画。
 */
const INTRO_STAGE = 1;
const DOING_STAGE = 2;
/** 「在做」占 1 块引子 + 每条 1 块，「找我」的引子紧随其后 */
const CONTACT_STAGE = DOING_STAGE + 1 + text.doing.items.length;

/** 第 `stage` 块入场：`--i` 决定它晚多久出现（见 globals.css 的 `.enter`） */
function enterAt(stage: number): CSSProperties {
  return { "--i": stage } as CSSProperties;
}

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

        {/* 「在做」：一条一行，短标签中黑，项目名是句子里的内联小标签 */}
        <div className="space-y-1">
          <p className="enter" style={enterAt(DOING_STAGE)}>
            {text.doing.title}：
          </p>
          {text.doing.items.map((item, index) => (
            <p
              key={item.label}
              className="enter"
              style={enterAt(DOING_STAGE + 1 + index)}
            >
              <span className="font-medium">{item.label}</span>
              {item.text ? `：${item.text}` : null}
              {/*
                内联小标签用的是和 SiteLinkList 同一套「新窗口 + rel」的处理，
                但它是正文里的一句话，套不了 <ul>/<li>，所以直接写 <a>。
              */}
              {item.repos?.map((repo) => (
                <a
                  key={repo}
                  href={repoUrl(repo)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-1 inline-block rounded bg-muted px-1.5 py-0.5 text-sm leading-5 whitespace-nowrap transition-colors hover:bg-accent"
                >
                  {repo}
                </a>
              ))}
              {item.after}
            </p>
          ))}
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
