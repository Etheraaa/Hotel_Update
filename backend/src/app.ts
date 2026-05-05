import express from "express";
import type { Database as SqliteDatabase } from "better-sqlite3";
import { join } from "node:path";
import { openDatabase } from "./db/connection.js";
import { createHotelsRouter } from "./routes/hotels.js";
import { createPhrasingRouter } from "./routes/phrasing.js";
import { createSubmissionsRouter } from "./routes/submissions.js";

type CreateAppOptions = {
  db?: SqliteDatabase;
};

export function resolveDefaultDatabasePath() {
  return process.env.DB_PATH ?? join(process.cwd(), "../data/app.db");
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const db = options.db ?? openDatabase(resolveDefaultDatabasePath());

  app.use(express.json());
  app.use((_request, response, next) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

    if (_request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }

    next();
  });

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api", createHotelsRouter(db));
  app.use("/api", createPhrasingRouter(db));
  app.use("/api", createSubmissionsRouter(db));

  return app;
}
