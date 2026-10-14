import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { leadSchema } from '../src/features/leads/api/schemas';

export async function captureScreenshots(
  url: string,
  api: string,
): Promise<void> {
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
    const colors = await page.getByText(/^Overdue:/).evaluate((element) => {
      const style = getComputedStyle(element.parentElement ?? element);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.fillStyle = style.color;
      ctx.fillRect(0, 0, 1, 1);
      const foreground = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = style.backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      return {
        foreground,
        background: Array.from(ctx.getImageData(0, 0, 1, 1).data),
      };
    });
    const luminance = (values: number[]) =>
      values
        .slice(0, 3)
        .map((value) => {
          const c = value / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        })
        .reduce(
          (sum, value, index) =>
            sum + value * ([0.2126, 0.7152, 0.0722][index] ?? 0),
          0,
        );
    const foreground = luminance(colors.foreground);
    const background = luminance(colors.background);
    const contrast =
      (Math.max(foreground, background) + 0.05) /
      (Math.min(foreground, background) + 0.05);
    expect(contrast).toBeGreaterThanOrEqual(4.5);
    const result = leadSchema
      .array()
      .parse(await (await page.request.get(`${api}/leads`)).json());
    const lead = result[0];
    if (!lead) throw new Error('Missing seed');
    await page.route('**/api/leads*', async (route) => {
      if (new URL(route.request().url()).pathname.endsWith('/leads'))
        await route.fulfill({
          json: [
            {
              ...lead,
              name: 'A'.repeat(120),
              company: 'B'.repeat(120),
              lastNote: 'N'.repeat(5000),
            },
          ],
        });
      else await route.continue();
    });
    for (const width of [360, 768, 1280]) {
      await page.setViewportSize({ width, height: width === 360 ? 640 : 900 });
      await page.reload();
      await page
        .getByRole('button', { name: `View ${'A'.repeat(120)}`, exact: true })
        .waitFor();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  } finally {
    await browser.close();
  }
}
