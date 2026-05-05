import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, test, vi } from "vitest";
import GeneratorForm from "../../components/generator/generator-form";

const meta = {
  member_tiers: ["无会员", "Platinum"],
  scenarios: [
    { id: "anniversary", label: "纪念日" },
    { id: "late-arrival", label: "晚到" }
  ],
  goal_requests: ["房型升级", "更高楼层"],
  tones: ["礼貌自然", "稍微主动"]
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("keeps generate button disabled before required fields are filled", () => {
  render(<GeneratorForm meta={meta} />);

  expect(screen.getByRole("button", { name: "生成话术" })).toBeDisabled();
});

test("generates phrasing after selecting a hotel and filling the form", async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.includes("/api/submissions/hotels?keyword=")) {
      return {
        ok: true,
        json: async () => ({
          items: [
            {
              hotel_id: "shanghai-st-regis",
              hotel_name: "上海静安瑞吉酒店",
              hotel_group: "万豪",
              hotel_brand: "瑞吉",
              city: "上海"
            }
          ]
        })
      } as Response;
    }

    if (url.endsWith("/api/phrasing/generate") && init?.method === "POST") {
      return {
        ok: true,
        json: async () => ({
          hotel_name: "上海静安瑞吉酒店",
          message:
            "上海静安瑞吉酒店您好，这次入住恰逢纪念日，如当日房态允许，想询问是否有机会安排更好的景观或房型。"
        })
      } as Response;
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  vi.stubGlobal("fetch", fetchMock);

  render(<GeneratorForm meta={meta} />);

  fireEvent.change(screen.getByLabelText("酒店"), {
    target: { value: "上海" }
  });

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /上海静安瑞吉酒店/ })).toBeInTheDocument();
  });

  fireEvent.mouseDown(screen.getByRole("button", { name: /上海静安瑞吉酒店/ }));
  fireEvent.click(screen.getByRole("button", { name: "纪念日" }));
  fireEvent.change(screen.getByLabelText("会员等级"), { target: { value: "Platinum" } });
  fireEvent.change(screen.getByLabelText("目标诉求"), { target: { value: "房型升级" } });
  fireEvent.change(screen.getByLabelText("沟通语气"), { target: { value: "礼貌自然" } });
  fireEvent.change(screen.getByLabelText("补充背景"), { target: { value: "这次想安静一点。" } });
  fireEvent.click(screen.getByRole("button", { name: "生成话术" }));

  await waitFor(() => {
    expect(screen.getByText(/上海静安瑞吉酒店您好/)).toBeInTheDocument();
  });

  expect(fetchMock).toHaveBeenLastCalledWith(
    "/api/phrasing/generate",
    expect.objectContaining({
      method: "POST"
    })
  );
});
