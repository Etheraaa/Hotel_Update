import Database from "better-sqlite3";
import { resetDatabase } from "../../../data/scripts/reset-db";
import { vi } from "vitest";
import {
  ConfigurationError,
  createPhrasingService,
  InvalidPhrasingRequestError
} from "../../src/services/phrasingService";

function createSeededDb() {
  const db = new Database(":memory:");
  resetDatabase(db);
  return db;
}

test("returns phrasing metadata for the generator page", () => {
  const db = createSeededDb();
  const service = createPhrasingService(db, {
    generateText: async () => "unused"
  });

  const meta = service.getMeta();

  expect(meta.member_tiers).toEqual(
    expect.arrayContaining(["无会员", "Marriott Gold", "Platinum"])
  );
  expect(meta.scenarios).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: "anniversary", label: "纪念日" })])
  );
  expect(meta.goal_requests).toContain("房型升级");
  expect(meta.tones).toContain("礼貌自然");
});

test("builds a phrasing request with the selected hotel and prompt inputs", async () => {
  const db = createSeededDb();
  const generateText = vi.fn().mockResolvedValue("  若当日房态允许，想问是否有机会安排更好的景观。  ");
  const service = createPhrasingService(db, { generateText });

  const response = await service.generate({
    hotel_id: "shanghai-st-regis",
    scenario_ids: ["anniversary", "quiet"],
    membership_level: "Platinum",
    goal_request: "更好景观",
    tone: "礼貌自然",
    additional_context: "会比较晚到店。"
  });

  expect(response).toEqual({
    hotel_name: "上海静安瑞吉酒店",
    message: "若当日房态允许，想问是否有机会安排更好的景观。"
  });

  expect(generateText).toHaveBeenCalledWith(
    expect.stringContaining("hotel_name: 上海静安瑞吉酒店")
  );
  expect(generateText).toHaveBeenCalledWith(expect.stringContaining("scenarios: 纪念日 / 想要安静"));
});

test("rejects invalid hotel or unsupported options", async () => {
  const db = createSeededDb();
  const service = createPhrasingService(db, {
    generateText: async () => "unused"
  });

  await expect(
    service.generate({
      hotel_id: "unknown-id",
      scenario_ids: ["anniversary"],
      membership_level: "Platinum",
      goal_request: "房型升级",
      tone: "礼貌自然",
      additional_context: ""
    })
  ).rejects.toBeInstanceOf(InvalidPhrasingRequestError);
});

test("throws a configuration error when generation is unavailable", async () => {
  const db = createSeededDb();
  const service = createPhrasingService(db, {
    generateText: async () => ""
  });

  await expect(
    service.generate({
      hotel_id: "shanghai-st-regis",
      scenario_ids: [],
      membership_level: "Platinum",
      goal_request: "房型升级",
      tone: "礼貌自然",
      additional_context: ""
    })
  ).rejects.toBeInstanceOf(ConfigurationError);
});
