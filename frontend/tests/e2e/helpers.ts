import type { Page } from "@playwright/test";

export async function openDerivativeTask(page: Page): Promise<void> {
  await page.goto("/zadachi/1");
}
