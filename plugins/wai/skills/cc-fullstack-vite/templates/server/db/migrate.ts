import { sql } from './client.js';

export async function runMigrations(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id         BIGSERIAL   PRIMARY KEY,
      title      TEXT        NOT NULL,
      completed  BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
