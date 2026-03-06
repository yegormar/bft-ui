import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

/** Version string: 'dev' in dev server, ISO timestamp on each build. */
let buildVersion = 'dev';

function buildVersionPlugin() {
  return {
    name: 'build-version',
    resolveId(id) {
      if (id === 'virtual:build-version') return '\0virtual:build-version';
      return null;
    },
    load(id) {
      if (id === '\0virtual:build-version') {
        return `export const version = ${JSON.stringify(buildVersion)};`;
      }
      return null;
    },
    buildStart() {
      buildVersion = new Date().toISOString();
    },
    writeBundle(options) {
      const dir = options.dir;
      if (!dir) return;
      const versionPath = path.join(dir, 'version.json');
      fs.writeFileSync(versionPath, JSON.stringify({ version: buildVersion }) + '\n');
    },
  };
}

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
    plugins: [buildVersionPlugin(), react()],
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
