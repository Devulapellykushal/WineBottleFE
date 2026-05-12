import path from 'node:path';
import { fileURLToPath } from 'node:url';

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

import _config from './_config.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const HOST = _config.server.host;
const PORT = _config.server.port;

/** @type {import('vite').UserConfig} */
export default {
  server: {
    host: HOST,
    port: PORT,
    proxy: {
      '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/mockups': { target: 'http://127.0.0.1:8000', changeOrigin: true }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src')
    }
  },
  plugins: [
    react({ include: /\.(jsx|tsx)$/ }),
    legacy({
      renderLegacyChunks: false,
      modernTargets: ['chrome >= 100', 'edge >= 100', 'firefox >= 100', 'safari >= 16', 'ios >= 16']
    }),
    glsl(),
    {
      name: 'configurator-route-html',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const pathname = req.url?.split('?')[0];
          if (pathname === '/configurator' || pathname === '/configurator/') {
            req.url = '/configurator.html';
          }
          if (pathname === '/bottle' || pathname === '/bottle/') {
            req.url = '/bottle-engraving.html';
          }
          if (pathname === '/configurebottle' || pathname === '/configurebottle/') {
            req.url = '/configurebottle.html';
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(dirname, 'index.html'),
        configurator: path.resolve(dirname, 'configurator.html'),
        bottle: path.resolve(dirname, 'bottle-engraving.html'),
        configurebottle: path.resolve(dirname, 'configurebottle.html'),
        next: path.resolve(dirname, 'next.html')
      }
    }
  }
};
