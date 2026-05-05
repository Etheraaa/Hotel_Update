import request from "supertest";
import { resetDatabaseFile } from "../../../data/scripts/reset-db";
import { createApp, resolveDefaultDatabasePath } from "../../src/app";

test("createApp can serve hotels from the default sqlite file", async () => {
  resetDatabaseFile(resolveDefaultDatabasePath());

  const response = await request(createApp()).get("/api/hotels?city=上海");

  expect(response.status).toBe(200);
  expect(response.body.items.length).toBeGreaterThan(0);
});
