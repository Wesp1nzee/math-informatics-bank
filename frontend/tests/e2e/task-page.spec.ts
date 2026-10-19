import { expect, test } from "@playwright/test";

import { openDerivativeTask } from "./helpers";

test.describe("task page", () => {
  test("checks the answer and reveals the solution", async ({ page }) => {
    await openDerivativeTask(page);

    await expect(
      page.getByRole("heading", { level: 1, name: /Производная/ }),
    ).toBeVisible();

    const answer = page.getByLabel("Ваш ответ");
    await answer.fill("3");
    await page.getByRole("button", { name: "Проверить" }).click();

    await expect(page.getByText("Верно.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Решение" })).toBeVisible();
    await expect(page.getByText("Подставляем x = 2")).toBeVisible();
  });

  test("rejects a wrong answer without revealing it", async ({ page }) => {
    await openDerivativeTask(page);

    await page.getByLabel("Ваш ответ").fill("12");
    await page.getByRole("button", { name: "Проверить" }).click();

    await expect(page.getByText(/Пока неверно/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Решение" })).not.toBeVisible();
  });

  test("shows related tasks that link to real pages", async ({ page }) => {
    await openDerivativeTask(page);

    const currentPath = new URL(page.url()).pathname;
    const related = page.locator('section[aria-labelledby="related-tasks-title"]');
    await expect(related).toBeVisible();

    const links = related.getByRole("link");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    const href = await links.first().getAttribute("href");
    expect(href).toMatch(/^\/zadachi\/\d+$/);
    expect(href).not.toBe(currentPath);
  });

  test("every catalogue card resolves to a 200 page", async ({ page, request }) => {
    await page.goto("/zadachi");
    const hrefs = await page
      .locator('a[href^="/zadachi/"]')
      .evaluateAll((nodes) =>
        Array.from(new Set(nodes.map((node) => node.getAttribute("href") ?? ""))),
      );

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
    }
  });
});
