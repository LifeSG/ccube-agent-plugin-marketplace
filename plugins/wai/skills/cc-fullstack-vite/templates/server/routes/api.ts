import Router from '@koa/router';
import { sql } from '../db/client.js';

// Inlined per shared/ rootDir constraint — do not import from shared/
interface Item {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const apiRouter = new Router({ prefix: '/api' });

apiRouter.get('/items', async (ctx) => {
  const rows = await sql`
    SELECT id, title, completed, created_at, updated_at
    FROM items ORDER BY created_at DESC
  `;
  ctx.body = {
    data: rows.map((r) => ({
      id: r['id'] as number,
      title: r['title'] as string,
      completed: r['completed'] as boolean,
      createdAt: (r['created_at'] as Date).toISOString(),
      updatedAt: (r['updated_at'] as Date).toISOString(),
    })),
  };
});

apiRouter.post('/items', async (ctx) => {
  const { title } = ctx.request.body as { title?: string };
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    ctx.status = 400;
    ctx.body = { error: { message: 'title is required' } };
    return;
  }
  const [row] = await sql`
    INSERT INTO items (title) VALUES (${title.trim()})
    RETURNING id, title, completed, created_at, updated_at
  `;
  ctx.status = 201;
  ctx.body = {
    data: {
      id: row['id'] as number,
      title: row['title'] as string,
      completed: row['completed'] as boolean,
      createdAt: (row['created_at'] as Date).toISOString(),
      updatedAt: (row['updated_at'] as Date).toISOString(),
    },
  };
});
