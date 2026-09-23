import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In-memory shared state across dev server connections
let devMaintenanceState = {
  enabled: false,
  scheduledStart: null,
  scheduledEnd: null,
  title: "We'll be back shortly",
  message: "PaletteParadise is undergoing scheduled system upgrades and performance calibration. Public access will resume momentarily.",
  estimatedReturn: null,
  showCountdown: true,
  supportUrl: "mailto:support@kroma.design",
  updatedAt: new Date().toISOString(),
  updatedBy: "System Default",
  lastChangedTimestamp: Date.now(),
};

function devMaintenancePlugin() {
  return {
    name: 'dev-maintenance-api',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0];
        if (url === '/api/maintenance') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.setHeader('Content-Type', 'application/json; charset=utf-8');

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            return res.end();
          }

          if (req.method === 'POST') {
            const authHeader = req.headers['authorization'];
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
              res.statusCode = 401;
              res.end(JSON.stringify({ error: 'Unauthorized', message: 'Bearer authorization token required' }));
              return;
            }

            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', () => {
              try {
                const parsed = JSON.parse(body || '{}');
                devMaintenanceState = {
                  ...devMaintenanceState,
                  ...parsed,
                  updatedAt: new Date().toISOString(),
                  lastChangedTimestamp: Date.now(),
                };
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, state: devMaintenanceState }));
              } catch (err: any) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
              }
            });
            return;
          }

          if (req.method === 'GET') {
            const queryParams = new URL(req.url, `http://${req.headers.host || 'localhost'}`).searchParams;
            const statusCheck = queryParams.get('status_check') === '1' || queryParams.get('check') === '1';

            if (statusCheck && devMaintenanceState.enabled) {
              res.statusCode = 503;
              res.setHeader('Retry-After', '300');
              return res.end(
                JSON.stringify({
                  maintenance: true,
                  status: 'active',
                  ...devMaintenanceState,
                })
              );
            }

            res.statusCode = 200;
            return res.end(JSON.stringify(devMaintenanceState));
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devMaintenancePlugin()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react'],
        },
      },
    },
  },
});
