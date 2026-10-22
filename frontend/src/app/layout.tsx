import type { Metadata } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { siteConfig } from "@/lib/constants/site";
import { themeInitScript } from "@/lib/theme";
import { YandexMetrika } from "@/lib/analytics/yandex-metrika";
import "./globals.css";

const geist = Geist({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin", "cyrillic"],
  style: ["italic"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: "Математика и информатика — задачи, разборы и занятия",
  description: siteConfig.description,
  applicationName: siteConfig.name,
  formatDetection: { telephone: false, address: false, email: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${geist.variable} ${sourceSerif.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        {children}
        <YandexMetrika />
      </body>
    </html>
  );
}
