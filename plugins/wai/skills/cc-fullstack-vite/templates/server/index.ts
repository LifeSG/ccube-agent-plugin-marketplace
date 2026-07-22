import 'dotenv/config';
import { createApp } from './app.js';
import { runMigrations } from './db/migrate.js';
import { seedIfEmpty } from './db/seed.js';
import type { Server } from 'http';

const port = parseInt(process.env['PORT'] ?? '__BACKEND_PORT__', 10);
const app = createApp();

async function start(): Promise<void> {
  await runMigrations();
  await seedIfEmpty();

  const server: Server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  function shutdown(): void {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 5000);
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err: unknown) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
