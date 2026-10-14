import { afterEach, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { apiRequest, ApiError } from '@/features/leads/api/client';

afterEach(() => vi.restoreAllMocks());
it('sends GET requests without a Content-Type header', async () => {
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response('[]', { status: 200 }));
  await apiRequest('/leads', z.array(z.unknown()), {
    method: 'GET',
    headers: new Headers({ Accept: 'application/json' }),
  });
  const headers = new Headers(fetch.mock.calls[0]?.[1]?.headers);
  expect(headers.has('Content-Type')).toBe(false);
  expect(headers.get('Accept')).toBe('application/json');
});
it('adds JSON Content-Type for a body and preserves an explicit caller value', async () => {
  const fetch = vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response('{}', { status: 200 }));
  await apiRequest('/leads', z.unknown(), { method: 'POST', body: '{}' });
  expect(
    new Headers(fetch.mock.calls[0]?.[1]?.headers).get('Content-Type'),
  ).toBe('application/json');
  await apiRequest('/leads', z.unknown(), {
    method: 'POST',
    body: '{}',
    headers: [['Content-Type', 'application/problem+json']],
  });
  expect(
    new Headers(fetch.mock.calls[1]?.[1]?.headers).get('Content-Type'),
  ).toBe('application/problem+json');
});
it('rejects successful responses that violate the schema', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('{"name":42}', { status: 200 }),
  );
  await expect(
    apiRequest('/leads', z.object({ name: z.string() })),
  ).rejects.toMatchObject({ code: 'invalid_response' });
});
it('preserves field errors from the API envelope', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(
      JSON.stringify({
        error: {
          code: 'validation_error',
          message: 'Invalid',
          details: [{ field: 'name', message: 'Required' }],
        },
      }),
      { status: 400 },
    ),
  );
  await expect(apiRequest('/leads', z.unknown())).rejects.toMatchObject({
    status: 400,
    details: [{ field: 'name', message: 'Required' }],
  });
});
it('normalizes network failures without exposing low-level errors', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(
    new TypeError('private diagnostics'),
  );
  await expect(apiRequest('/leads', z.unknown())).rejects.toBeInstanceOf(
    ApiError,
  );
  await expect(apiRequest('/leads', z.unknown())).rejects.toMatchObject({
    code: 'network_error',
    status: 0,
  });
});
it('preserves aborts so cancelled queries do not become network errors', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(
    new DOMException('Cancelled', 'AbortError'),
  );
  await expect(apiRequest('/leads', z.unknown())).rejects.toMatchObject({
    name: 'AbortError',
  });
});
it('handles non-JSON and malformed error responses', async () => {
  vi.spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(new Response('HTML', { status: 502 }))
    .mockResolvedValueOnce(new Response('{}', { status: 500 }));
  await expect(apiRequest('/leads', z.unknown())).rejects.toMatchObject({
    code: 'invalid_response',
  });
  await expect(apiRequest('/leads', z.unknown())).rejects.toMatchObject({
    code: 'invalid_response',
  });
});
