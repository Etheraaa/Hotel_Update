import type { Database as SqliteDatabase } from "better-sqlite3";
import { Router } from "express";
import { createHotelController } from "../controllers/hotelController.js";

export function createHotelsRouter(db: SqliteDatabase) {
  const router = Router();
  const controller = createHotelController(db);

  router.get("/hotels/filters", controller.getFilters);
  router.get("/hotels", controller.listHotels);
  router.get("/hotels/:hotelId/upgrade-stats", controller.getHotelUpgradeStats);
  router.get("/hotels/:hotelId", controller.getHotelDetail);

  return router;
}
