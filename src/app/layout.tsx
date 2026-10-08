import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/config/site";
import { fill } from "@/lib/template";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * 站名与描述来自 siteConfig；子页面只要给个短标题，
 * 后缀由 template 自动补成「某某 · 站名」。
 *
 * description 里可以写 `{name}`（站名）与 `{author}`（作者显示名），在这里填一次；
 * 子页面要换成自己的 description 时自己填（见关于页）。
 */
const SITE_VALUES = { name: siteConfig.name, author: siteConfig.author.name };

export const metadata: Metadata = {
  // 站点图标由 route handler 生成（src/app/icon/route.ts）而不是 `app/icon.svg`
  // 这个约定文件，所以 Next 不会自动注入它，得在这里写明
  icons: { icon: "/icon" },
  title: {
    default: siteConfig.name,
    template: fill(siteConfig.text.titleTemplate, SITE_VALUES),
  },
  description: fill(siteConfig.description, SITE_VALUES),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={siteConfig.lang}
      suppressHydrationWarning
      className={cn(
        "h-full antialiased",
        notoSans.variable,
        playfairDisplayHeading.variable,
        geistMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
