import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { renderScreen } from './renderScreen';
import { base, server, leads, listRequests } from './server';
import type { Lead } from '@/features/leads/api/types';
import { localDateValue } from '@/features/leads/lib/format';
const sarahId = '507f1f77bcf86cd799439011';

it('opens the timeline and moves a note follow-up into today without reload', async () => {
  const user = userEvent.setup();
  const { client } = renderScreen();
  await user.click(
    await screen.findByRole('button', { name: 'View Sarah Connor' }),
  );
  const dialog = await screen.findByRole('dialog');
  await within(dialog).findByText('Sent pricing tier PDF.');
  await user.type(
    within(dialog).getByLabelText('Log a new discussion'),
    'Morning follow-up',
  );
  await user.click(within(dialog).getByLabelText('Set Follow-up'));
  fireEvent.change(within(dialog).getByLabelText('Follow-up date'), {
    target: { value: localDateValue(new Date()) },
  });
  fireEvent.change(within(dialog).getByLabelText('Follow-up time'), {
    target: { value: '14:00' },
  });
  server.use(
    http.get(`${base}/leads`, async () => {
      await delay(500);
      return HttpResponse.json(leads);
    }),
  );
  await user.click(within(dialog).getByRole('button', { name: 'Save Note' }));
  await waitFor(() =>
    expect(
      client
        .getQueryData<Lead[]>(['leads', {}])
        ?.find((lead) => lead.id === sarahId)?.lastNote,
    ).toBe('Morning follow-up'),
  );
  await user.keyboard('{Escape}');
  expect(
    within(
      screen.getByRole('region', { name: "Today's follow-ups" }),
    ).getByRole('button', { name: 'View Sarah Connor' }),
  ).toBeInTheDocument();
  expect(window.location.search).not.toContain('lead=');
});

it('adds a lead and shows it immediately in the list', async () => {
  const user = userEvent.setup();
  renderScreen();
  await screen.findByRole('button', { name: 'View Sarah Connor' });
  await user.click(screen.getByRole('button', { name: 'Add New Lead' }));
  await user.type(screen.getByLabelText('Full Name *'), 'Diana Prince');
  await user.click(screen.getByRole('button', { name: 'Save Lead' }));
  expect(
    await screen.findByRole('button', { name: 'View Diana Prince' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('updates status optimistically and persists the response', async () => {
  const user = userEvent.setup();
  const { client } = renderScreen();
  await user.click(
    await screen.findByRole('button', { name: 'View Sarah Connor' }),
  );
  await user.click(
    await screen.findByRole('combobox', { name: 'Lead status' }),
  );
  await user.click(screen.getByRole('option', { name: 'Won' }));
  await waitFor(() =>
    expect(
      client
        .getQueryData<Lead[]>(['leads', {}])
        ?.find((lead) => lead.id === sarahId)?.status,
    ).toBe('won'),
  );
  await user.keyboard('{Escape}');
  expect(
    within(
      await screen.findByRole('button', { name: 'View Sarah Connor' }),
    ).getByText('Won'),
  ).toBeInTheDocument();
});

it('rolls back an optimistic status change after API failure', async () => {
  server.use(
    http.patch(`${base}/leads/:id`, async () => {
      await delay(200);
      return HttpResponse.json(
        {
          error: {
            code: 'internal_error',
            message: 'An unexpected error occurred',
          },
        },
        { status: 500 },
      );
    }),
  );
  const user = userEvent.setup();
  const { client } = renderScreen();
  await user.click(
    await screen.findByRole('button', { name: 'View Sarah Connor' }),
  );
  await user.click(
    await screen.findByRole('combobox', { name: 'Lead status' }),
  );
  await user.click(screen.getByRole('option', { name: 'Won' }));
  await waitFor(() =>
    expect(
      client
        .getQueryData<Lead[]>(['leads', {}])
        ?.find((lead) => lead.id === sarahId)?.status,
    ).toBe('won'),
  );
  await waitFor(() =>
    expect(
      client
        .getQueryData<Lead[]>(['leads', {}])
        ?.find((lead) => lead.id === sarahId)?.status,
    ).toBe('proposal_sent'),
  );
  expect(
    screen.getByRole('combobox', { name: 'Lead status' }),
  ).toHaveTextContent('Proposal Sent');
});

it('filters both sections and debounces name search with URL state', async () => {
  const user = userEvent.setup();
  renderScreen();
  await screen.findByRole('button', { name: 'View Sarah Connor' });
  await user.click(
    within(screen.getByRole('group', { name: 'Filter by status' })).getByRole(
      'button',
      { name: 'Contacted' },
    ),
  );
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'View Sarah Connor' }),
    ).not.toBeInTheDocument(),
  );
  expect(window.location.search).toContain('status=contacted');
  await user.click(
    within(screen.getByRole('group', { name: 'Filter by status' })).getByRole(
      'button',
      { name: 'All' },
    ),
  );
  await user.type(screen.getByLabelText('Search leads by name'), 'Sarah');
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'View Bill Lumbergh' }),
    ).not.toBeInTheDocument(),
  );
  expect(
    listRequests.filter((url) => new URL(url).searchParams.has('q')),
  ).toHaveLength(1);
  expect(window.location.search).toContain('q=Sarah');
});
