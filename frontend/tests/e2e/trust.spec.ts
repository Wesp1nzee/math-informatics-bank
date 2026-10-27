import { expect, test } from "@playwright/test";

test.describe("trust and offer", () => {
  test("FAQ disclosure opens and shows its answer", async ({ page }) => {
    await page.goto("/podgotovka");

    const question = page.getByText("Как проходит пробное занятие?");
    await expect(question).toBeVisible();
    await question.click();

    await expect(
      page.getByText(/Начинаем с диагностики: разбираем несколько задач/),
    ).toBeVisible();
  });

  test("FAQPage and Service structured data are present", async ({ page }) => {
    await page.goto("/podgotovka");

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ""));

    const parsed = blocks.map((block) => JSON.parse(block) as { "@type"?: string });
    const types = parsed.map((entry) => entry["@type"]);

    expect(types).toContain("FAQPage");
    expect(types).toContain("Service");
  });

  test("unconfigured teacher and pricing blocks stay hidden", async ({ page }) => {
    await page.goto("/podgotovka");

    await expect(page.locator("#tutor-title")).toHaveCount(0);
    await expect(page.getByText("Стоимость и отзывы")).toHaveCount(0);
    await expect(page.getByText("Стоимость обсуждаем после диагностики")).toHaveCount(
      0,
    );
  });

  test("hero offers a trial lesson and access to the task bank", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");

    await expect(
      page.locator('a[href="/podgotovka#request"]:visible').first(),
    ).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: "Открыть меню" }).click();
    }
    await expect(page.locator('a[href="/zadachi"]:visible').first()).toBeVisible();
  });
});
