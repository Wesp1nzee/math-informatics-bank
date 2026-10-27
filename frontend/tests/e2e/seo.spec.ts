import { expect, test } from "@playwright/test";

const PAGES = [
  { path: "/", title: /математика и информатика/i },
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

      const ogImage = page.locator('meta[property="og:image"]');
      await expect(ogImage).toHaveCount(1);
      await expect(ogImage).toHaveAttribute("content", /^https?:\/\/.+/);
    });
  }

  test("robots.txt and sitemap.xml are generated", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("Sitemap:");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    const body = await sitemap.text();
    expect(body).toMatch(/\/zadachi\/\d+<\/loc>/);
    expect(body).toContain("/articles/proizvodnaya-smysl-grafik-kasatelnaya</loc>");
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

  test("task and article pages expose a generated og image", async ({
    page,
    request,
  }) => {
    await page.goto("/zadachi");
    const taskHref = await page
      .locator('a[href^="/zadachi/"]')
      .first()
      .getAttribute("href");
    expect(taskHref).toMatch(/^\/zadachi\/\d+$/);

    for (const path of [
      taskHref as string,
      "/articles/proizvodnaya-smysl-grafik-kasatelnaya",
    ]) {
      await page.goto(path);

      const og = page.locator('meta[property="og:image"]');
      await expect(og).toHaveCount(1);

      const content = await og.getAttribute("content");
      expect(content).toMatch(/opengraph-image/);

      const pathname = new URL(content ?? "").pathname;
      const response = await request.get(pathname);
      expect(response.status(), path).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/png");
    }
  });
});
