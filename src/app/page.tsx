import Link from "next/link";

const linkClass =
  "underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16 text-[15px] leading-7">
      <section className="space-y-4">
        <p>
          Hey! 我是 <span className="font-medium">liwenka1</span>
          {/* TODO: 换成你自己的介绍 */}
          ，一个喜欢把想法随手记下来的人。
        </p>
        <p className="text-muted-foreground">
          这里放一段更长的自我介绍：比如你在做什么、关心什么、平时写点什么。
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-muted-foreground">在做</h2>
        <ul className="mt-3 space-y-1.5">
          {/* TODO: 换成你真正在做的事 */}
          <li>某个项目 / 工作 —— 一句话说明</li>
          <li>另一件事 —— 一句话说明</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-muted-foreground">找我</h2>
        <ul className="mt-3 space-y-1.5">
          <li>
            <a
              href="https://github.com/liwenka1"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              GitHub
            </a>
          </li>
          {/* TODO: 换成你的邮箱 / 其它平台 */}
          <li>邮箱（待填）</li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-muted-foreground">日记</h2>
        <p className="mt-3">
          三言两语都记在 GitHub Issues 里 —— 仓库中打上{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
            diary
          </code>{" "}
          标签的 issue，会出现在{" "}
          <Link href="/diary" className={linkClass}>
            日记
          </Link>{" "}
          页面。
        </p>
      </section>
    </main>
  );
}
