import request from "supertest";
import { createApp } from "../../src/app";

test("responds with health payload", async () => {
  const app = createApp();
  const response = await request(app).get("/api/health");

  expect(response.status).toBe(200);
  expect(response.body).toEqual({ ok: true });
});
