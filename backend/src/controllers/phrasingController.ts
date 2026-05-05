import type { Database as SqliteDatabase } from "better-sqlite3";
import type { Request, Response } from "express";
import {
  ConfigurationError,
  createPhrasingService,
  InvalidPhrasingRequestError,
  UpstreamGenerationError
} from "../services/phrasingService.js";

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
    : [];
}

export function createPhrasingController(db: SqliteDatabase) {
  const service = createPhrasingService(db);

  return {
    getMeta(_request: Request, response: Response) {
      response.json(service.getMeta());
    },

    async generate(request: Request, response: Response) {
      try {
        const result = await service.generate({
          hotel_id: readOptionalString(request.body?.hotel_id) ?? "",
          scenario_ids: readStringArray(request.body?.scenario_ids),
          membership_level: readOptionalString(request.body?.membership_level) ?? "",
          goal_request: readOptionalString(request.body?.goal_request) ?? "",
          tone: readOptionalString(request.body?.tone) ?? "",
          additional_context: readOptionalString(request.body?.additional_context)
        });

        response.json(result);
      } catch (error) {
        if (error instanceof InvalidPhrasingRequestError) {
          response.status(400).json({ error: "Invalid phrasing request" });
          return;
        }

        if (error instanceof ConfigurationError) {
          response.status(503).json({ error: "Phrasing service unavailable" });
          return;
        }

        if (error instanceof UpstreamGenerationError) {
          response.status(502).json({ error: "Phrasing generation failed" });
          return;
        }

        throw error;
      }
    }
  };
}
