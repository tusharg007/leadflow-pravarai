import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    fileParallelism: false,
    testTimeout: 15000,
    // A cold Windows install downloads a large MongoDB archive before starting tests.
    hookTimeout: 300000,
  },
});
