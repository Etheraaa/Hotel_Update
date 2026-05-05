import type { Database as SqliteDatabase } from "better-sqlite3";
import { Router } from "express";
import { createPhrasingController } from "../controllers/phrasingController.js";

export function createPhrasingRouter(db: SqliteDatabase) {
  const router = Router();
  const controller = createPhrasingController(db);

  router.get("/phrasing/meta", controller.getMeta);
  router.post("/phrasing/generate", controller.generate);

  return router;
}
