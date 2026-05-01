import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/Interactive-Farm-Map/',
  server: {
    port: 3000,
    open: true,
    // Custom middleware to handle config file writes
    middlewareMode: false
  },
  plugins: [
    {
      name: 'config-writer',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/save-config' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });
            req.on('end', () => {
              try {
                const configPath = path.join(__dirname, 'config.json');
                fs.writeFileSync(configPath, body, 'utf8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
              } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
              }
            });
          } else {
            next();
          }
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'config.json') {
            return 'config.json';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
