import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { renderScreen } from './renderScreen';
import { base, leads, server } from './server';

it('shows slow-network skeletons and retries a failed list request', async () => {
  let calls = 0;
  server.use(
    http.get(`${base}/leads`, async () => {
      calls++;
      await delay(50);
      return calls === 1
        ? HttpResponse.json(
            {
              error: {
                code: 'internal_error',
                message: 'An unexpected error occurred',
              },
            },
            { status: 500 },
          )
        : HttpResponse.json(leads);
    }),
  );
  const user = userEvent.setup();
  renderScreen();
  expect(
    screen.getByRole('status', { name: 'Loading leads' }),
  ).toBeInTheDocument();
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'An unexpected error occurred',
  );
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(
    await screen.findByRole('button', { name: 'View Sarah Connor' }),
  ).toBeInTheDocument();
});
it('handles an empty list and no matches independently', async () => {
  server.use(http.get(`${base}/leads`, () => HttpResponse.json([])));
  const user = userEvent.setup();
  renderScreen();
  expect(await screen.findByText('No leads yet')).toBeInTheDocument();
  await user.click(
    within(screen.getByRole('group', { name: 'Filter by status' })).getByRole(
      'button',
      { name: 'Lost' },
    ),
  );
  expect(await screen.findByText('No matching leads')).toBeInTheDocument();
});
it('restores dialog focus and traps keyboard navigation', async () => {
  const user = userEvent.setup();
  renderScreen();
  await screen.findByRole('button', { name: 'View Sarah Connor' });
  const trigger = screen.getByRole('button', { name: 'Add New Lead' });
  await user.click(trigger);
  const dialog = screen.getByRole('dialog');
  for (let i = 0; i < 9; i++) {
    await user.tab();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  }
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
it('maps server field errors and prevents a second submission while pending', async () => {
  let submissions = 0;
  server.use(
    http.post(`${base}/leads`, async () => {
      submissions++;
      await delay(150);
      return HttpResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Request validation failed',
            details: [{ field: 'name', message: 'Please check the name' }],
          },
        },
        { status: 400 },
      );
    }),
  );
  const user = userEvent.setup();
  renderScreen();
  await user.click(screen.getByRole('button', { name: 'Add New Lead' }));
  await user.type(screen.getByLabelText('Full Name *'), 'Diana');
  await user.dblClick(screen.getByRole('button', { name: 'Save Lead' }));
  expect(await screen.findByText('Please check the name')).toBeInTheDocument();
  expect(submissions).toBe(1);
  expect(screen.getByLabelText('Full Name *')).toHaveAttribute(
    'aria-invalid',
    'true',
  );
});
it('clears follow-ups without writing a note and supports dialog deep links', async () => {
  window.history.replaceState(null, '', '/?lead=507f1f77bcf86cd799439011');
  const user = userEvent.setup();
  renderScreen();
  const clear = await screen.findByRole('button', { name: 'Clear follow-up' });
  await user.click(clear);
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Clear follow-up' }),
    ).not.toBeInTheDocument(),
  );
  expect(
    within(
      screen.getByRole('list', { name: 'Discussion history' }),
    ).getAllByRole('listitem'),
  ).toHaveLength(1);
});
it('keeps long note/name text available in title tooltips', async () => {
  const lead = leads[0];
  if (!lead) throw new Error('Missing fixture');
  lead.name = 'A'.repeat(120);
  lead.lastNote = 'A long discussion '.repeat(250);
  renderScreen();
  const card = await screen.findByRole('button', { name: `View ${lead.name}` });
  expect(within(card).getByTitle(lead.name)).toHaveTextContent(lead.name);
  expect(card.querySelector('p[title]')).toHaveAttribute(
    'title',
    lead.lastNote,
  );
});
it('retains note text on API failure and maps follow-up errors to its inputs', async () => {
  server.use(
    http.post(`${base}/leads/:id/discussions`, () =>
      HttpResponse.json(
        {
          error: {
            code: 'validation_error',
            message: 'Invalid follow-up',
            details: [
              { field: 'followUpAt', message: 'Please check this follow-up' },
            ],
          },
        },
        { status: 400 },
      ),
    ),
  );
  const user = userEvent.setup();
  renderScreen();
  await user.click(
    await screen.findByRole('button', { name: 'View Sarah Connor' }),
  );
  await user.type(
    await screen.findByLabelText('Log a new discussion'),
    'Keep this note',
  );
  await user.click(screen.getByRole('button', { name: 'Save Note' }));
  expect(
    await screen.findByText('Please check this follow-up'),
  ).toBeInTheDocument();
  expect(screen.getByLabelText('Log a new discussion')).toHaveValue(
    'Keep this note',
  );
});
it('supports browser back URL changes and announces a malformed deep link', async () => {
  const user = userEvent.setup();
  renderScreen();
  await screen.findByRole('button', { name: 'View Sarah Connor' });
  window.history.replaceState(null, '', '/?status=lost');
  fireEvent.popState(window);
  expect(await screen.findByText('No matching leads')).toBeInTheDocument();
  await user.click(
    within(screen.getByRole('group', { name: 'Filter by status' })).getByRole(
      'button',
      { name: 'All' },
    ),
  );
  window.history.replaceState(null, '', '/?lead=missing');
  fireEvent.popState(window);
  expect(await screen.findByRole('alert')).toHaveTextContent('Lead not found');
});
