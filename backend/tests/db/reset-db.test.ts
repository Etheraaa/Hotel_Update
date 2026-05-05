import Database from "better-sqlite3";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { resetDatabase } from "../../../data/scripts/reset-db";
import { resetDatabaseFile } from "../../../data/scripts/reset-db";

test("resetDatabase creates seeded hotels", () => {
  const db = new Database(":memory:");

  resetDatabase(db);

  const row = db.prepare("select count(*) as count from hotels").get() as { count: number };
  expect(row.count).toBeGreaterThanOrEqual(8);
});

test("resetDatabase creates upgrade stats and raw cases", () => {
  const db = new Database(":memory:");

  resetDatabase(db);

  const stats = db.prepare("select count(*) as count from upgrade_stats").get() as {
    count: number;
  };
  const cases = db.prepare("select count(*) as count from raw_upgrade_cases").get() as {
    count: number;
  };

  expect(stats.count).toBeGreaterThan(0);
  expect(cases.count).toBeGreaterThan(0);
});

test("resetDatabaseFile creates a sqlite file at the requested path", () => {
  const dbPath = join(tmpdir(), `hotel-upgrade-test-${Date.now()}.db`);

  resetDatabaseFile(dbPath);

  expect(existsSync(dbPath)).toBe(true);

  rmSync(dbPath, { force: true });
});
