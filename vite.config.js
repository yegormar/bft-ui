import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function exit(message) {
  console.error('[vite config]', message);
  process.exit(1);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  let apiPort = '';
  if (mode === 'development') {
    const raw = env.VITE_API_PORT || env.API_PORT;
    if (raw === undefined || raw === '') {
      exit(
        'VITE_API_PORT or API_PORT is required in development (for /api proxy). Set in .env (see .env.example or env.example).'
      );
    }
    const port = parseInt(raw, 10);
    if (Number.isNaN(port) || port < 1 || port > 65535) {
      exit(`VITE_API_PORT/API_PORT must be 1-65535. Got: ${raw}`);
    }
    apiPort = String(port);
  }

  if (mode === 'production') {
    if (env.VITE_API_BASE_URL === undefined || env.VITE_API_BASE_URL === '') {
      exit('VITE_API_BASE_URL is required for production build. Set in .env (see .env.example).');
    }
    if (env.VITE_APP_NAME === undefined || env.VITE_APP_NAME === '') {
      exit('VITE_APP_NAME is required for production build. Set in .env (see .env.example).');
    }
  }

  const apiTarget = apiPort ? `http://localhost:${apiPort}` : '';

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    server: {
      proxy: apiTarget
        ? {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
            },
          }
        : {},
    },
  };
});
