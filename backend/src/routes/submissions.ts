import type { Database as SqliteDatabase } from "better-sqlite3";
import { Router } from "express";
import { createSubmissionController } from "../controllers/submissionController.js";

export function createSubmissionsRouter(db: SqliteDatabase) {
  const router = Router();
  const controller = createSubmissionController(db);

  router.get("/submissions/meta", controller.getMeta);
  router.get("/submissions/hotels", controller.searchHotels);
  router.get("/submissions/hotels/:hotelId/room-options", controller.getRoomOptions);
  router.post("/submissions", controller.createSubmission);

  return router;
}
