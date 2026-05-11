import { defineConfig } from 'vitest/config';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 120000,
    hookTimeout: 30000,
    reporters: ['verbose'],
    include: ['src/tests/**/*.test.ts', 'src/tests/**/*.e2e.ts', 'src/tests/e2e/*.ts'],
    setupFiles: ['src/tests/setup.ts'],
    sequence: {
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
