import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server, resetData } from './server';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterAll(() => server.close());

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetData();
  window.history.replaceState(null, '', '/');
});

// Radix uses browser pointer APIs that jsdom does not implement.
Object.defineProperty(HTMLElement.prototype, 'hasPointerCapture', {
  value: () => false,
});
Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  value: () => undefined,
});
Object.defineProperty(HTMLElement.prototype, 'releasePointerCapture', {
  value: () => undefined,
});
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: () => undefined,
});
