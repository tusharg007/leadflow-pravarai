import { expect, test } from '@playwright/test';
import {
  leadSchema,
  leadDetailSchema,
} from '../src/features/leads/api/schemas';
test('seeded lead moves into today and status persists after reload', async ({
  page,
  request,
}) => {
  const api = process.env.E2E_API_URL ?? 'http://localhost:4000/api';
  const response = await request.get(`${api}/leads`);
  const leads = leadSchema.array().parse(await response.json());
  const sarah = leads.find((lead) => lead.name === 'Sarah Connor');
  if (!sarah)
    throw new Error('Seed Sarah Connor before running the smoke test');
  const future = new Date();
  future.setDate(future.getDate() + 2);
  expect(
    (
      await request.patch(`${api}/leads/${sarah.id}`, {
        data: { followUpAt: future.toISOString() },
      })
    ).ok(),
  ).toBe(true);
  await page.goto('/');
  await page
    .getByRole('button', { name: 'View Sarah Connor', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const note = `E2E follow-up ${Date.now()}`;
  await page.getByLabel('Log a new discussion').fill(note);
  await page.getByLabel('Set Follow-up', { exact: true }).check();
  const today = await page.evaluate(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  await page.getByLabel('Follow-up date', { exact: true }).fill(today);
  await page.getByLabel('Follow-up time', { exact: true }).fill('14:00');
  await page.getByRole('button', { name: 'Save Note', exact: true }).click();
  await expect(
    page
      .getByRole('list', { name: 'Discussion history' })
      .getByText(note, { exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  const pinned = page.getByRole('region', { name: "Today's follow-ups" });
  await expect(
    pinned.getByRole('button', { name: 'View Sarah Connor', exact: true }),
  ).toBeVisible();
  await pinned
    .getByRole('button', { name: 'View Sarah Connor', exact: true })
    .click();
  await page.getByRole('combobox', { name: 'Lead status' }).click();
  await page.getByRole('option', { name: 'Qualified', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Lead status' })).toHaveText(
    'Qualified',
  );
  await expect
    .poll(
      async () =>
        leadDetailSchema.parse(
          await (await request.get(`${api}/leads/${sarah.id}`)).json(),
        ).status,
    )
    .toBe('qualified');
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'Lead status' })).toHaveText(
    'Qualified',
  );
  await expect(
    page
      .getByRole('list', { name: 'Discussion history' })
      .getByText(note, { exact: true }),
  ).toBeVisible();
});
