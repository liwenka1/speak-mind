import { SiteLinkList, iconOf } from "@/components/layout/site-links";
import { authorLinks, repoUrl, siteConfig } from "@/config/site";
import { fill } from "@/lib/template";

/**
 * 首页：一个居中的窄列，**上面一行是名字，下面全是正文段落**。
 *
 * 结构压到最简 —— 名字（h1）、一段自我介绍、「在做」（短标签 + 说明，项目名渲染成
 * 内联小标签）、最后是「找我」那一行联系方式。分区不在这里再列一遍：顶栏导航已经
 * 把它们全列出来了。
 *
 * 句子全部来自 siteConfig.text.home，这里不写死文案。
 */
const text = siteConfig.text.home;

/** 文案里 `{author}` 的值 */
const VALUES = { author: siteConfig.author.name };

export default function Home() {
  const { name } = siteConfig.author;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      {/*
        大标题就是名字本身 —— 顶栏左上角是站标（没有字样），所以这里不是重复。
        标题字体由 globals.css 里 h1–h6 那条规则统一给（含中文兜底）。
      */}
      <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>

      <article className="mt-8 space-y-6">
        <p>{fill(text.intro, VALUES)}</p>

        {/* 「在做」：一条一行，短标签中黑，项目名是句子里的内联小标签 */}
        <p>
          {text.doing.title}：
          {text.doing.items.map((item) => (
            <span key={item.label} className="block">
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
            </span>
          ))}
        </p>

        {/*
          「找我」就一行：图标 + 文字，内容与顺序都直接来自 authorLinks() ——
          和右上角是同一份，所以两处永远不会走散（要改顺序就改配置）。
        */}
        <div className="space-y-3">
          <p>{text.contact.title}</p>
          <SiteLinkList
            links={authorLinks()}
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
            linkClassName="inline-flex items-center gap-1.5 opacity-60 transition-opacity hover:opacity-100"
            renderIcon={iconOf}
            showLabel
          />
        </div>
      </article>
    </main>
  );
}
