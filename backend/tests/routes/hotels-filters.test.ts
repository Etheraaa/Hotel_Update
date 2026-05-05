import Database from "better-sqlite3";
import request from "supertest";
import { resetDatabase } from "../../../data/scripts/reset-db";
import { createApp } from "../../src/app";

function createSeededApp() {
  const db = new Database(":memory:");
  resetDatabase(db);
  return createApp({ db });
}

test("GET /api/hotels/filters returns distinct filter options", async () => {
  const response = await request(createSeededApp()).get("/api/hotels/filters");

  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    groups: expect.arrayContaining(["万豪", "希尔顿", "凯悦"]),
    brands: expect.arrayContaining(["瑞吉", "丽思卡尔顿", "康莱德"]),
    cities: expect.arrayContaining(["上海", "北京", "东京"])
  });
});
