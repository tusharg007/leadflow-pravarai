import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { LeadScreen } from '@/features/leads/components/LeadScreen';
export function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const rendered = render(
    <QueryClientProvider client={client}>
      <LeadScreen />
    </QueryClientProvider>,
  );
  return { client, ...rendered };
}
