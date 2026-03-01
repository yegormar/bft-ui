import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: [
      'src/**/*.test.js',
      'tests/regression/**/*.test.js',
      'tests/integration/**/*.test.js',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/e2e/**'],
  },
});
