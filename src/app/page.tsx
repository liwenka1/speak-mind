import Link from "next/link";
import { SiteLinkList } from "@/components/layout/site-links";
import { authorLinks, sectionPath, siteConfig } from "@/config/site";

const linkClass =
  "underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground";

/** 首页文案全部来自 siteConfig.text.home，这里不写死任何句子 */
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
          {text.sections.title}
        </h2>
        <ul className="mt-3 space-y-1.5">
          {siteConfig.sections.map((section) => (
            <li key={section.label}>
              <Link href={sectionPath(section.label)} className={linkClass}>
                {section.title}
              </Link>
            </li>
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
