import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", title: /Математика и информатика/ },
  { path: "/zadachi", title: /Банк задач/ },
  { path: "/matematika", title: /Математика/ },
  { path: "/informatika", title: /Информатика/ },
  { path: "/articles", title: /Статьи и разборы/ },
  { path: "/podgotovka", title: /Репетиторство/ },
  { path: "/diagnostika", title: /Диагностика/ },
];

test.describe("SEO basics", () => {
  for (const { path, title } of PAGES) {
    test(`${path} has one h1, a title, a description and a canonical`, async ({
      page,
    }) => {
      await page.goto(path);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(title);

      const description = page.locator('meta[name="description"]');
      await expect(description).toHaveAttribute("content", /.{40,}/);

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute("href", /^https?:\/\/.+/);

      expect(await page.locator('meta[property="og:image"]').count()).toBe(0);
    });
  }

  test("robots.txt and sitemap.xml are generated", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const body = await sitemap.text();
    expect(body).toContain("/zadachi/1042</loc>");
    expect(body).toContain("/articles/kak-chitat-chuzhoy-kod</loc>");
    expect(body).not.toContain("/zadachi/does-not-exist");
  });

  test("structured data is valid JSON-LD", async ({ page }) => {
    await page.goto("/");
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ""));

    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(() => JSON.parse(block)).not.toThrow();
    }
  });
});
