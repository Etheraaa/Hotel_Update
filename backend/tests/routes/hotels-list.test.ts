import Database from "better-sqlite3";
import request from "supertest";
import { resetDatabase } from "../../../data/scripts/reset-db";
import { createApp } from "../../src/app";

function createSeededApp() {
  const db = new Database(":memory:");
  resetDatabase(db);
  return createApp({ db });
}

test("GET /api/hotels returns card payload", async () => {
  const response = await request(createSeededApp()).get("/api/hotels?city=上海");

  expect(response.status).toBe(200);
  expect(response.body.items[0]).toMatchObject({
    hotel_id: expect.any(String),
    hotel_name: expect.any(String),
    hotel_group: expect.any(String),
    hotel_brand: expect.any(String),
    city: "上海"
  });
});

test("GET /api/hotels supports combined filters", async () => {
  const response = await request(createSeededApp()).get(
    "/api/hotels?keyword=%E7%91%9E%E5%90%89&group=%E4%B8%87%E8%B1%AA&brand=%E7%91%9E%E5%90%89&city=%E4%B8%8A%E6%B5%B7"
  );

  expect(response.status).toBe(200);
  expect(response.body.items).toHaveLength(1);
  expect(response.body.items[0].hotel_id).toBe("shanghai-st-regis");
});
