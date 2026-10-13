import { expect, test } from "@playwright/test";

test.describe("analytics", () => {
  test("loads no third-party tag when NEXT_PUBLIC_YM_ID is not set", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('script[src*="mc.yandex"]')).toHaveCount(0);
  });
});
