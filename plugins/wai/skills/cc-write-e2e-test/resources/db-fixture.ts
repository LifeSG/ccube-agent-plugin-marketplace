// Purpose: Provide per-worker PostgreSQL schema isolation for Playwright
//          tests, so parallel workers never share database state.
// Outcome: Each Playwright worker gets its own PostgreSQL schema, created
//          before its first test and dropped after its last. Spec files
//          import `test` and `expect` from this file instead of
//          `@playwright/test`.

import { test as base, expect } from '@playwright/test';
import { randomUUID } from 'crypto';
import pg from 'pg';

// ── Customise these two functions for your project ───────────────────────

/**
 * Run all database migrations inside `schema`.
 * Swap the body for your ORM's programmatic migration API, e.g.:
 *   - Drizzle:  await migrate(drizzle(client), { migrationsFolder: './drizzle' })
 *   - Knex:     await knex.migrate.latest()
 *   - Prisma:   await prisma.$executeRawUnsafe(`SET search_path TO "${schema}"`)
 *               then run `prisma migrate deploy` via child_process
 *   - Plain SQL: read and execute your migration files in order
 */
async function runMigrations(client: pg.Client, schema: string): Promise<void> {
  await client.query(`SET search_path TO "${schema}"`);
  // TODO: replace with your migration runner
  throw new Error(
    `runMigrations not implemented. ` +
      `Edit resources/db-fixture.ts and wire in your migration runner.`,
  );
}

/**
 * Seed `schema` with the minimum fixture rows required by all tests.
 * Keep this lean — only rows that multiple tests depend on belong here.
 * Test-specific data should be created in beforeEach via the API.
 */
async function seedSchema(client: pg.Client, schema: string): Promise<void> {
  await client.query(`SET search_path TO "${schema}"`);
  // TODO: insert your fixture rows here, e.g.:
  // await client.query(`INSERT INTO users (email, pin_hash) VALUES ($1, $2)`,
  //   ['test@example.gov.sg', '<bcrypt hash of test PIN>']);
}

// ── Fixture definition ────────────────────────────────────────────────────

export interface DbFixtures {
  /** The name of the PostgreSQL schema created for this worker. */
  schemaName: string;
  /** A connected pg.Client scoped to this worker's schema. */
  dbClient: pg.Client;
}

export const test = base.extend<Record<string, never>, DbFixtures>({
  /**
   * worker-scoped: created once when the worker starts, shared across
   * every test assigned to that worker, torn down when the worker ends.
   *
   * Schema name format: test_w<workerIndex>_<8-char uuid fragment>
   * This is unique per worker and per run, so concurrent CI pipelines
   * on the same database server never collide.
   */
  schemaName: [
    async ({}, use, workerInfo) => {
      const schema = `test_w${workerInfo.workerIndex}_${randomUUID().slice(0, 8)}`;
      const admin = new pg.Client({
        connectionString: process.env.TEST_DATABASE_URL,
      });
      await admin.connect();

      try {
        await admin.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        await runMigrations(admin, schema);
        await seedSchema(admin, schema);
        await use(schema);
      } finally {
        // Always clean up, even if tests fail
        await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        await admin.end();
      }
    },
    { scope: 'worker' },
  ],

  /**
   * worker-scoped: a pg.Client pre-scoped to the worker's schema via
   * search_path. Use in tests that need to query the DB directly,
   * e.g. to verify a row was written or to set up state that has no
   * API endpoint.
   */
  dbClient: [
    async ({ schemaName }, use) => {
      const client = new pg.Client({
        connectionString: process.env.TEST_DATABASE_URL,
        options: `-c search_path="${schemaName}"`,
      });
      await client.connect();
      await use(client);
      await client.end();
    },
    { scope: 'worker' },
  ],
});

export { expect };
