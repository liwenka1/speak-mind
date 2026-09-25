import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <section>
        <h1 className="text-4xl font-semibold tracking-tight">
          你好，我是 liwenka1 👋
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          {/* TODO: 换成你自己的自我介绍 */}
          这里写一句自我介绍：比如你是谁、在做什么、最近在折腾什么。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/diary"
            className="flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            翻看日记
          </Link>
          <a
            href="https://github.com/liwenka1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-zinc-700 dark:hover:bg-white/[.06]"
          >
            GitHub
          </a>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-medium">关于本站</h2>
        <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
          这是一个用 Next.js 搭建的个人站点。日记部分把 GitHub Issues
          当作内容源——在仓库里打上{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            diary
          </code>{" "}
          标签的 issue，就会出现在{" "}
          <Link href="/diary" className="underline underline-offset-4">
            日记
          </Link>{" "}
          页面里。
        </p>
      </section>
    </main>
  );
}
