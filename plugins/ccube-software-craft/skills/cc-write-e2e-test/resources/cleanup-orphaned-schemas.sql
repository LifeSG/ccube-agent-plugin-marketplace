-- Purpose: Remove orphaned per-worker PostgreSQL schemas left behind by
--          crashed or killed Playwright workers.
--
-- When to run:
--   - Before each CI job (add as a step before `npx playwright test`)
--   - As a scheduled database maintenance job
--
-- Usage:
--   psql $TEST_DATABASE_URL -f resources/cleanup-orphaned-schemas.sql
--
-- Safe: only drops schemas whose names match the pattern created by
-- db-fixture.ts: test_w<workerIndex>_<8-char uuid hex fragment>
-- Production schemas are never touched.

DO $$
DECLARE
  rec RECORD;
  dropped_count INT := 0;
BEGIN
  FOR rec IN
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name ~ '^test_w[0-9]+_[0-9a-f]{8}$'
    ORDER BY schema_name
  LOOP
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', rec.schema_name);
    RAISE NOTICE 'Dropped orphaned schema: %', rec.schema_name;
    dropped_count := dropped_count + 1;
  END LOOP;

  IF dropped_count = 0 THEN
    RAISE NOTICE 'No orphaned test schemas found.';
  ELSE
    RAISE NOTICE 'Cleanup complete: % schema(s) dropped.', dropped_count;
  END IF;
END $$;
