import type { Database as SqliteDatabase } from "better-sqlite3";
import type { Request, Response } from "express";
import { createHotelService } from "../services/hotelService.js";
import type { HotelListQuery } from "../types/hotel.js";

function readOptionalQuery(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function parseHotelListQuery(request: Request): HotelListQuery {
  return {
    keyword: readOptionalQuery(request.query.keyword),
    group: readOptionalQuery(request.query.group),
    brand: readOptionalQuery(request.query.brand),
    city: readOptionalQuery(request.query.city)
  };
}

function readRequiredParam(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function createHotelController(db: SqliteDatabase) {
  const service = createHotelService(db);

  return {
    listHotels(request: Request, response: Response) {
      response.json({
        items: service.listHotels(parseHotelListQuery(request))
      });
    },

    getFilters(_request: Request, response: Response) {
      response.json(service.getFilterOptions());
    },

    getHotelDetail(request: Request, response: Response) {
      const hotelId = readRequiredParam(request.params.hotelId);
      const detail = hotelId ? service.getHotelDetail(hotelId) : undefined;

      if (!detail) {
        response.status(404).json({ error: "Hotel not found" });
        return;
      }

      response.json(detail);
    },

    getHotelUpgradeStats(request: Request, response: Response) {
      const hotelId = readRequiredParam(request.params.hotelId);

      if (!hotelId) {
        response.status(404).json({ error: "Hotel not found" });
        return;
      }

      const detail = service.getHotelDetail(hotelId);

      if (!detail) {
        response.status(404).json({ error: "Hotel not found" });
        return;
      }

      response.json(service.getHotelUpgradeStats(hotelId));
    }
  };
}
