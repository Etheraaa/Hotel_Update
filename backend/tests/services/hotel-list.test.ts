import Database from "better-sqlite3";
import { resetDatabase } from "../../../data/scripts/reset-db";
import { createHotelService } from "../../src/services/hotelService";

function createSeededService() {
  const db = new Database(":memory:");
  resetDatabase(db);
  return createHotelService(db);
}

test("filters hotels by keyword group brand and city intersection", () => {
  const service = createSeededService();

  const result = service.listHotels({
    keyword: "瑞吉",
    group: "万豪",
    brand: "瑞吉",
    city: "上海"
  });

  expect(result).toHaveLength(1);
  expect(result[0]).toMatchObject({
    hotel_id: "shanghai-st-regis",
    hotel_name: "上海静安瑞吉酒店",
    hotel_group: "万豪",
    hotel_brand: "瑞吉",
    city: "上海"
  });
});

test("returns an empty list when no hotel matches all filters", () => {
  const service = createSeededService();

  const result = service.listHotels({
    group: "万豪",
    brand: "瑞吉",
    city: "北京"
  });

  expect(result).toEqual([]);
});
