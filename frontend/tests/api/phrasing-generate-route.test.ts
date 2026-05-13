import { afterEach, describe, expect, test, vi } from "vitest";
import {
  ConfigurationError,
  UpstreamGenerationError
} from "../../../backend/src/services/openaiResponsesClient";
import { InvalidPhrasingRequestError } from "../../../backend/src/services/phrasingService";

const generate = vi.fn();

vi.mock("../../lib/server-api", () => ({
  getPhrasingApi: () => ({
    generate
  })
}));

afterEach(() => {
  generate.mockReset();
});

describe("POST /api/phrasing/generate", () => {
  test("maps invalid requests to 400", async () => {
    generate.mockRejectedValue(new InvalidPhrasingRequestError("Invalid phrasing request"));

    const { POST } = await import("../../app/api/phrasing/generate/route");
    const response = await POST(
      new Request("http://localhost/api/phrasing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid phrasing request" });
  });

  test("maps missing model config to 503", async () => {
    generate.mockRejectedValue(new ConfigurationError("OPENAI_API_KEY is missing"));

    const { POST } = await import("../../app/api/phrasing/generate/route");
    const response = await POST(
      new Request("http://localhost/api/phrasing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel_id: "hotel-1",
          scenario_ids: [],
          membership_level: "万豪金卡",
          goal_request: "房型升级",
          tone: "礼貌自然"
        })
      })
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "Phrasing service unavailable" });
  });

  test("maps upstream model failures to 502", async () => {
    generate.mockRejectedValue(new UpstreamGenerationError("OpenAI request failed with status 502"));

    const { POST } = await import("../../app/api/phrasing/generate/route");
    const response = await POST(
      new Request("http://localhost/api/phrasing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotel_id: "hotel-1",
          scenario_ids: [],
          membership_level: "万豪金卡",
          goal_request: "房型升级",
          tone: "礼貌自然"
        })
      })
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "Phrasing generation failed" });
  });
});
