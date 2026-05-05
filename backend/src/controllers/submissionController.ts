import type { Database as SqliteDatabase } from "better-sqlite3";
import type { Request, Response } from "express";
import { createSubmissionService, InvalidSubmissionError } from "../services/submissionService.js";

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function createSubmissionController(db: SqliteDatabase) {
  const service = createSubmissionService(db);

  return {
    getMeta(_request: Request, response: Response) {
      response.json(service.getSubmissionMeta());
    },

    searchHotels(request: Request, response: Response) {
      response.json({
        items: service.searchHotels(readOptionalString(request.query.keyword))
      });
    },

    getRoomOptions(request: Request, response: Response) {
      const hotelId = readOptionalString(request.params.hotelId);

      if (!hotelId) {
        response.status(404).json({ error: "Hotel not found" });
        return;
      }

      response.json(service.getHotelRoomOptions(hotelId));
    },

    createSubmission(request: Request, response: Response) {
      try {
        const created = service.createSubmission({
          hotel_id: readOptionalString(request.body?.hotel_id) ?? "",
          member_tier: readOptionalString(request.body?.member_tier) ?? "",
          booked_room_raw: readOptionalString(request.body?.booked_room_raw) ?? "",
          upgraded_room_raw: readOptionalString(request.body?.upgraded_room_raw) ?? "",
          observed_at: readOptionalString(request.body?.observed_at) ?? "",
          stay_context: readOptionalString(request.body?.stay_context)
        });

        response.status(201).json(created);
      } catch (error) {
        if (error instanceof InvalidSubmissionError) {
          response.status(400).json({ error: "Invalid submission payload" });
          return;
        }

        throw error;
      }
    }
  };
}
