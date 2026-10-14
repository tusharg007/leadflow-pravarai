import { z } from 'zod';
import { apiUrl } from '@/lib/env';
import { errorSchema } from './schemas';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: ReadonlyArray<{
      field: string;
      message: string;
    }> = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export async function apiRequest<T extends z.ZodType>(
  path: string,
  schema: T,
  init?: RequestInit,
): Promise<z.output<T>> {
  let response: Response;
  try {
    const headers = new Headers(init?.headers);
    if (init?.body != null && !headers.has('Content-Type'))
      headers.set('Content-Type', 'application/json');
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError'
    )
      throw error;
    throw new ApiError(
      0,
      'network_error',
      'Unable to reach the API. Please try again.',
    );
  }
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(
      response.status,
      'invalid_response',
      'The API returned an invalid response.',
    );
  }
  if (!response.ok) {
    const parsed = errorSchema.safeParse(json);
    if (!parsed.success)
      throw new ApiError(
        response.status,
        'invalid_response',
        'The API returned an invalid error response.',
      );
    const { code, message, details } = parsed.data.error;
    throw new ApiError(response.status, code, message, details);
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success)
    throw new ApiError(
      response.status,
      'invalid_response',
      'The API response does not match the expected contract.',
    );
  return parsed.data;
}
