import { afterEach, describe, expect, it, vi } from "vitest";

const SITE = "https://example.com";

async function loadSeoModules() {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", SITE);
  vi.resetModules();

  const site = await import("@/lib/constants/site");
  const metadata = await import("@/lib/seo/metadata");
  const jsonLd = await import("@/lib/seo/json-ld");
  const robotsModule = await import("@/app/robots");

  return {
    siteConfig: site.siteConfig,
    absoluteUrl: metadata.absoluteUrl,
    buildMetadata: metadata.buildMetadata,
    ...jsonLd,
    robots: robotsModule.default,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("SEO absolute URLs", () => {
  it("uses NEXT_PUBLIC_SITE_URL for canonical, Open Graph and JSON-LD", async () => {
    const seo = await loadSeoModules();

    expect(seo.siteConfig.url).toBe(SITE);
    expect(seo.absoluteUrl("/zadachi")).toBe(`${SITE}/zadachi`);

    const meta = JSON.parse(
      JSON.stringify(
        seo.buildMetadata({
          title: "Банк задач",
          description: "Описание",
          path: "/zadachi",
          ogImage: "/og/test.png",
        }),
      ),
    ) as {
      alternates: { canonical: string };
      openGraph: { url: string; images: Array<{ url: string }> };
      twitter: { images: string[] };
    };

    expect(meta.alternates.canonical).toBe(`${SITE}/zadachi`);
    expect(meta.openGraph.url).toBe(`${SITE}/zadachi`);
    expect(meta.openGraph.images[0].url).toBe(`${SITE}/og/test.png`);
    expect(meta.twitter.images[0]).toBe(`${SITE}/og/test.png`);

    expect(seo.webSiteJsonLd().url).toBe(SITE);
    expect(
      String(
        seo.articleJsonLd({
          title: "Статья",
          description: "Описание",
          path: "/articles/razbor",
          published: "2026-01-01",
        }).mainEntityOfPage,
      ),
    ).toBe(`${SITE}/articles/razbor`);
    expect(
      String(
        seo.learningResourceJsonLd({
          name: "Задача",
          description: "Описание",
          path: "/zadachi/1",
        }).url,
      ),
    ).toBe(`${SITE}/zadachi/1`);

    const crumbs = seo.breadcrumbJsonLd([{ name: "Главная", path: "/" }])
      .itemListElement as Array<{ item: string }>;
    expect(crumbs[0].item).toBe(`${SITE}/`);

    expect(String(seo.personJsonLd({ name: "X", image: "/photo.jpg" }).image)).toBe(
      `${SITE}/photo.jpg`,
    );
  });

  it("builds robots.txt sitemap and host on the same domain", async () => {
    const seo = await loadSeoModules();
    const data = seo.robots();

    expect(data.sitemap).toBe(`${SITE}/sitemap.xml`);
    expect(data.host).toBe("example.com");

    const serialized = JSON.stringify(data);
    expect(serialized).not.toContain("localhost");
    expect(serialized).not.toContain("example.test");
  });
});
