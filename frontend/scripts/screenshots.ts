import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function captureScreenshots(url: string): Promise<void> {
  const dir = fileURLToPath(
    new URL('../../docs/screenshots/', import.meta.url),
  );
  await mkdir(dir, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      timezoneId: process.env.TZ ?? 'Asia/Kolkata',
    });
    await page.goto(url);
    await page
      .getByRole('button', { name: 'View Sarah Connor', exact: true })
      .waitFor();
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        )
        .toBe(true);
      await page.screenshot({
        path: `${dir}/list-${width}.png`,
        fullPage: true,
      });
      await page
        .getByRole('button', { name: 'Add New Lead', exact: true })
        .click();
      const dialog = page.getByRole('dialog');
      const bounds = await dialog.boundingBox();
      if (!bounds || bounds.x < 0 || bounds.x + bounds.width > width)
        throw new Error(`Dialog overflows viewport at ${width}`);
      for (let i = 0; i < 9; i++) {
        await page.keyboard.press('Tab');
        expect(
          await dialog.evaluate((element) =>
            element.contains(document.activeElement),
          ),
        ).toBe(true);
      }
      if (width === 1280)
        await page.screenshot({ path: `${dir}/add-lead-dialog.png` });
      await page.keyboard.press('Escape');
      await expect(
        page.getByRole('button', { name: 'Add New Lead', exact: true }),
      ).toBeFocused();
      await page
        .getByRole('button', { name: 'View Sarah Connor', exact: true })
        .click();
      await page.getByLabel('Log a new discussion').waitFor();
      await expect(
        page.getByRole('button', { name: 'Save Note', exact: true }),
      ).toBeInViewport();
      if (width === 1280)
        await page.screenshot({ path: `${dir}/timeline-dialog.png` });
      await page.keyboard.press('Escape');
    }
    await page
      .getByRole('button', { name: 'View Bill Lumbergh', exact: true })
      .screenshot({ path: `${dir}/overdue-lead.png` });
  } finally {
    await browser.close();
  }
}
