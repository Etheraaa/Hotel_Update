import { afterEach, expect, test, vi } from "vitest";
import {
  buildApiUrl,
  createSubmission,
  generatePhrasing,
  getHotelDetail,
  getHotelUpgradeStats,
  getHotels,
  getPhrasingMeta,
  getSubmissionMeta,
  getSubmissionRoomOptions,
  searchSubmissionHotels
} from "../../lib/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("builds hotel list query string with optional filters", () => {
  expect(
    buildApiUrl("/api/hotels", {
      keyword: "瑞吉",
      city: "上海"
    })
  ).toBe("/api/hotels?keyword=%E7%91%9E%E5%90%89&city=%E4%B8%8A%E6%B5%B7");
});

test("parses hotel list payload", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [{ hotel_id: "shanghai-st-regis", hotel_name: "上海静安瑞吉酒店" }]
      })
    })
  );

  const response = await getHotels({ keyword: "瑞吉" });

  expect(response.items[0].hotel_name).toContain("瑞吉");
});

test("fetches hotel detail and upgrade stats by id", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hotel_id: "shanghai-st-regis", hotel_name: "上海静安瑞吉酒店" })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ columns: ["尊贵豪华房"], rows: [], insufficient: false })
    });

  vi.stubGlobal("fetch", fetchMock);

  await expect(getHotelDetail("shanghai-st-regis")).resolves.toMatchObject({
    hotel_id: "shanghai-st-regis"
  });
  await expect(getHotelUpgradeStats("shanghai-st-regis")).resolves.toMatchObject({
    columns: ["尊贵豪华房"]
  });
});

test("fetches submission search data and room options", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ member_tiers: ["Platinum"] })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [{ hotel_id: "shanghai-st-regis", hotel_name: "上海静安瑞吉酒店" }] })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hotel_id: "shanghai-st-regis", items: [{ room_name: "豪华客房" }] })
    });

  vi.stubGlobal("fetch", fetchMock);

  await expect(getSubmissionMeta()).resolves.toEqual({ member_tiers: ["Platinum"] });
  await expect(searchSubmissionHotels("上海")).resolves.toMatchObject({
    items: [{ hotel_id: "shanghai-st-regis", hotel_name: "上海静安瑞吉酒店" }]
  });
  await expect(getSubmissionRoomOptions("shanghai-st-regis")).resolves.toMatchObject({
    items: [{ room_name: "豪华客房" }]
  });
});

test("posts submission payload", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: "submission-1", hotel_id: "shanghai-st-regis" })
  });

  vi.stubGlobal("fetch", fetchMock);

  await expect(
    createSubmission({
      hotel_id: "shanghai-st-regis",
      member_tier: "Platinum",
      booked_room_raw: "豪华客房",
      upgraded_room_raw: "小型套房",
      observed_at: "2026-04-20",
      stay_context: "测试"
    })
  ).resolves.toMatchObject({ id: "submission-1" });

  expect(fetchMock).toHaveBeenCalledWith(
    "/api/submissions",
    expect.objectContaining({
      method: "POST"
    })
  );
});

test("fetches phrasing metadata and posts phrasing payload", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        member_tiers: ["Platinum"],
        scenarios: [{ id: "anniversary", label: "纪念日" }],
        goal_requests: ["房型升级"],
        tones: ["礼貌自然"]
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        hotel_name: "上海静安瑞吉酒店",
        message: "若当日房态允许，希望能安排更好的景观。"
      })
    });

  vi.stubGlobal("fetch", fetchMock);

  await expect(getPhrasingMeta()).resolves.toEqual({
    member_tiers: ["Platinum"],
    scenarios: [{ id: "anniversary", label: "纪念日" }],
    goal_requests: ["房型升级"],
    tones: ["礼貌自然"]
  });

  await expect(
    generatePhrasing({
      hotel_id: "shanghai-st-regis",
      scenario_ids: ["anniversary"],
      membership_level: "Platinum",
      goal_request: "房型升级",
      tone: "礼貌自然",
      additional_context: "纪念日入住"
    })
  ).resolves.toMatchObject({
    hotel_name: "上海静安瑞吉酒店",
    message: "若当日房态允许，希望能安排更好的景观。"
  });

  expect(fetchMock).toHaveBeenLastCalledWith(
    "/api/phrasing/generate",
    expect.objectContaining({
      method: "POST"
    })
  );
});
