import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";

import { siteConfig } from "@/lib/constants/site";
import "./globals.css";

const geist = Geist({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
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
    /*
     * `suppressHydrationWarning` covers attributes that browser extensions
     * (e.g. LanguageTool adds `data-lt-installed`) inject into <html> before
     * React hydrates. It only silences mismatches on this element's own
     * attributes — not on its subtree.
     *
     * `data-scroll-behavior="smooth"` tells the Next.js router that smooth
     * scrolling is enabled in CSS, so it can suppress it during route
     * transitions (see the Next 16 upgrade guide).
     */
    <html
      lang="ru"
      className={`${geist.variable} ${instrumentSerif.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      {/*
       * `suppressHydrationWarning` also covers extensions that annotate
       * <body> (Grammarly adds `data-gr-ext-installed` and similar). The
       * element only carries a static className, so nothing real is masked.
       */}
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
