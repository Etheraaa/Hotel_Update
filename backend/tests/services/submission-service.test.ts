import Database from "better-sqlite3";
import { resetDatabase } from "../../../data/scripts/reset-db";
import { createSubmissionService } from "../../src/services/submissionService";

function createSeededService() {
  const db = new Database(":memory:");
  resetDatabase(db);
  return { service: createSubmissionService(db), db };
}

test("returns submission metadata with member tier options", () => {
  const { service } = createSeededService();

  const meta = service.getSubmissionMeta();

  expect(meta.member_tiers).toEqual(
    expect.arrayContaining(["Marriott Gold", "Platinum", "Titanium", "Globalist"])
  );
});

test("searches hotels for the submission selector", () => {
  const { service } = createSeededService();

  const items = service.searchHotels("上海");

  expect(items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        hotel_id: "shanghai-st-regis",
        hotel_name: "上海静安瑞吉酒店"
      })
    ])
  );
});

test("returns room options for a selected hotel", () => {
  const { service } = createSeededService();

  const response = service.getHotelRoomOptions("shanghai-st-regis");

  expect(response).toEqual({
    hotel_id: "shanghai-st-regis",
    items: expect.arrayContaining([
      { room_name: "尊贵豪华房" },
      { room_name: "小型套房" },
      { room_name: "豪华客房" }
    ])
  });
});

test("creates a submission and updates hotel aggregates", () => {
  const { service, db } = createSeededService();

  const created = service.createSubmission({
    hotel_id: "shanghai-st-regis",
    member_tier: "Platinum",
    booked_room_raw: "豪华客房",
    upgraded_room_raw: "小型套房",
    observed_at: "2026-04-20",
    stay_context: "测试新增样本"
  });

  expect(created).toMatchObject({
    hotel_id: "shanghai-st-regis",
    member_tier: "Platinum",
    upgraded_room_raw: "小型套房",
    observed_at: "2026-04-20"
  });

  const hotelRow = db
    .prepare("select sample_count, latest_observed_at from hotels where id = ?")
    .get("shanghai-st-regis") as { sample_count: number; latest_observed_at: string };

  expect(hotelRow).toEqual({
    sample_count: 49,
    latest_observed_at: "2026-04-20"
  });

  const statRow = db
    .prepare(
      `
        select success_count, success_ratio, tier_success_total
        from upgrade_stats
        where hotel_id = ? and member_tier = ? and room_bucket = ?
      `
    )
    .get("shanghai-st-regis", "Platinum", "小型套房") as {
    success_count: number;
    success_ratio: number;
    tier_success_total: number;
  };

  expect(statRow.success_count).toBeGreaterThan(7);
  expect(statRow.tier_success_total).toBeGreaterThan(17);
  expect(statRow.success_ratio).toBeGreaterThan(0);
});

test("rejects invalid room names during submission", () => {
  const { service } = createSeededService();

  expect(() =>
    service.createSubmission({
      hotel_id: "shanghai-st-regis",
      member_tier: "Platinum",
      booked_room_raw: "不存在的房型",
      upgraded_room_raw: "小型套房",
      observed_at: "2026-04-20",
      stay_context: "非法样本"
    })
  ).toThrow("Invalid submission payload");
});
