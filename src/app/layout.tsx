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
 */
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: fill(siteConfig.text.titleTemplate, { name: siteConfig.name }),
  },
  description: siteConfig.description,
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
