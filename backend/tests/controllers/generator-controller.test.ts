import Database from "better-sqlite3";
import { resetDatabase } from "../../../data/scripts/reset-db";
import { createGeneratorController } from "../../src/controllers/generatorController";

function createResponseDouble() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    }
  };
}

test("returns a generated message payload", () => {
  const db = new Database(":memory:");
  resetDatabase(db);
  const controller = createGeneratorController(db);
  const response = createResponseDouble();

  controller.createMessage(
    {
      body: {
        hotel_name: "上海静安瑞吉酒店",
        scenarios: ["纪念日", "想要安静"],
        membership_level: "Platinum",
        goal_request: "更好景观",
        tone: "礼貌自然",
        additional_context: "这次只住一晚，希望如果有机会可以安排得更舒适一些。"
      }
    } as never,
    response as never
  );

  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({
    message: expect.any(String)
  });
});
