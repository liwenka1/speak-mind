import { SiteLinkList } from "@/components/layout/site-links";
import { authorLinks, siteConfig } from "@/config/site";

const linkClass =
  "underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground";

/**
 * 首页文案全部来自 siteConfig.text.home，这里不写死任何句子。
 *
 * 首页**不列分区**：顶栏导航已经把它们全列出来了，再抄一遍只是噪音。
 * 分区页照旧由 /tag/<label> 提供（地址用 sectionPath() 推导）。
 */
const text = siteConfig.text.home;

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
      <section className="space-y-4">
        <p>
          {text.greeting.before}
          <span className="font-medium">{siteConfig.author.name}</span>
          {text.greeting.after}
        </p>
        <p className="text-muted-foreground">{text.intro}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-muted-foreground">
          {text.doing.title}
        </h2>
        <ul className="mt-3 space-y-1.5">
          {text.doing.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-muted-foreground">
          {text.contact.title}
        </h2>
        {/* 链接在 src/config/site.ts 的 author.links / author.email 里配置 */}
        <SiteLinkList
          links={authorLinks()}
          className="mt-3 space-y-1.5"
          linkClassName={linkClass}
        />
      </section>
    </main>
  );
}
