import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(currentDir, "../../backend");
const defaultDbPath = resolve(currentDir, "../../data/app.db");
const dbPath =
  typeof process.env.DB_PATH === "string" && process.env.DB_PATH.trim().length > 0
    ? process.env.DB_PATH.trim()
    : defaultDbPath;
const runtimeRequire = eval("require") as NodeRequire;
const Database = runtimeRequire(resolve(backendRoot, "node_modules/better-sqlite3")) as new (
  path: string
) => any;
// Frontend server routes and RSC pages read backend services from compiled output,
// so frontend startup should always happen after a backend build.
const { createHotelService } = runtimeRequire(
  resolve(backendRoot, "dist/src/services/hotelService.js")
) as {
  createHotelService: (db: any) => any;
};
const { createSubmissionService } = runtimeRequire(
  resolve(backendRoot, "dist/src/services/submissionService.js")
) as {
  createSubmissionService: (db: any) => any;
};
const { createPhrasingService } = runtimeRequire(
  resolve(backendRoot, "dist/src/services/phrasingService.js")
) as {
  createPhrasingService: (db: any) => any;
};

const globalForDb = globalThis as typeof globalThis & {
  hotelUpgradeDb?: any;
};

function getDb() {
  if (!globalForDb.hotelUpgradeDb) {
    globalForDb.hotelUpgradeDb = new Database(dbPath);
  }

  return globalForDb.hotelUpgradeDb;
}

export function getHotelApi() {
  return createHotelService(getDb());
}

export function getSubmissionApi() {
  return createSubmissionService(getDb());
}

export function getPhrasingApi() {
  return createPhrasingService(getDb());
}
