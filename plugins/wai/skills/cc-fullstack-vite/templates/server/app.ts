import Koa from 'koa';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import bodyParser from '@koa/bodyparser';
import serve from 'koa-static';
import { existsSync } from 'fs';
import path from 'path';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { healthRouter } from './routes/health.js';
import { apiRouter } from './routes/api.js';

export function createApp(): Koa {
  const app = new Koa();

  app.use(errorHandler());

  if (process.env['NODE_ENV'] !== 'production') {
    app.use(cors());
  }

  app.use(helmet());
  app.use(bodyParser({ jsonLimit: '100kb' }));
  app.use(requestLogger());

  app.use(healthRouter.routes());
  app.use(healthRouter.allowedMethods());
  app.use(apiRouter.routes());
  app.use(apiRouter.allowedMethods());

  // In production, serve the Vite-built frontend from dist/client/
  const clientDir = path.join(process.cwd(), 'dist', 'client');
  if (existsSync(clientDir)) {
    app.use(serve(clientDir));

    // SPA fallback — serve index.html for non-API GET requests
    app.use(async (ctx) => {
      if (ctx.method === 'GET' && !ctx.path.startsWith('/api')) {
        const indexHtml = path.join(clientDir, 'index.html');
        if (existsSync(indexHtml)) {
          ctx.type = 'html';
          const { createReadStream } = await import('fs');
          ctx.body = createReadStream(indexHtml);
        }
      }
    });
  }

  return app;
}
