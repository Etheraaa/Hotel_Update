import Database from "better-sqlite3";
import request from "supertest";
import { resetDatabase } from "../../../data/scripts/reset-db";
import { createApp } from "../../src/app";

function createSeededApp() {
  const db = new Database(":memory:");
  resetDatabase(db);
  return createApp({ db });
}

test("GET /api/hotels/:hotelId returns hotel detail payload", async () => {
  const response = await request(createSeededApp()).get("/api/hotels/shanghai-st-regis");

  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    hotel_id: "shanghai-st-regis",
    hotel_name: "上海静安瑞吉酒店",
    hotel_group: "万豪",
    hotel_brand: "瑞吉",
    city: "上海",
    source_pool_desc: "来源池 论坛公开内容 + 审核投稿"
  });
});

test("GET /api/hotels/:hotelId/upgrade-stats returns row-based table payload", async () => {
  const response = await request(createSeededApp()).get(
    "/api/hotels/shanghai-st-regis/upgrade-stats"
  );

  expect(response.status).toBe(200);
  expect(response.body.columns).toEqual(["尊贵豪华房", "小型套房", "更高套房", "特色房型"]);
  expect(response.body.rows[0]).toMatchObject({
    member_tier: expect.any(String),
    success_total: expect.any(Number)
  });
});

test("returns 404 for unknown hotel id", async () => {
  const response = await request(createSeededApp()).get("/api/hotels/unknown-id");

  expect(response.status).toBe(404);
  expect(response.body).toEqual({ error: "Hotel not found" });
});
