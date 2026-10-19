import type { Page } from "@playwright/test";

/**
 * Open the first featured task without hard-coding database ids. The home hero
 * links to it with "Попробовать задачу"; this works with JavaScript disabled,
 * unlike the catalogue, whose list is streamed inside a Suspense boundary.
 */
export async function openDerivativeTask(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("link", { name: "Попробовать задачу" }).click();
}
