import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, test, vi } from "vitest";
import SubmitForm from "../../components/submit/submit-form";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test("keeps room fields disabled before a hotel is selected", () => {
  render(<SubmitForm memberTiers={["Platinum", "Titanium"]} />);

  expect(screen.getByLabelText("会员等级")).toBeInTheDocument();
  expect(screen.getByLabelText("预订房型")).toBeDisabled();
  expect(screen.getByLabelText("最终房型")).toBeDisabled();
});

test("unlocks room fields after selecting a searched hotel", async () => {
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

    if (url.includes("/api/submissions/hotels/shanghai-st-regis/room-options")) {
      return {
        ok: true,
        json: async () => ({
          hotel_id: "shanghai-st-regis",
          items: [{ room_name: "豪华客房" }, { room_name: "小型套房" }]
        })
      } as Response;
    }

    if (url.endsWith("/api/submissions") && init?.method === "POST") {
      return {
        ok: true,
        json: async () => ({
          id: "submission-1",
          hotel_id: "shanghai-st-regis"
        })
      } as Response;
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  vi.stubGlobal("fetch", fetchMock);

  render(<SubmitForm memberTiers={["Platinum", "Titanium"]} />);

  fireEvent.change(screen.getByLabelText("酒店"), {
    target: { value: "上海" }
  });

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /上海静安瑞吉酒店/ })).toBeInTheDocument();
  });

  fireEvent.mouseDown(screen.getByRole("button", { name: /上海静安瑞吉酒店/ }));

  await waitFor(() => {
    expect(screen.getByLabelText("预订房型")).toBeEnabled();
    expect(screen.getByLabelText("最终房型")).toBeEnabled();
  });
});

test("shows success feedback after a valid submission", async () => {
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

    if (url.includes("/api/submissions/hotels/shanghai-st-regis/room-options")) {
      return {
        ok: true,
        json: async () => ({
          hotel_id: "shanghai-st-regis",
          items: [{ room_name: "豪华客房" }, { room_name: "小型套房" }]
        })
      } as Response;
    }

    if (url.endsWith("/api/submissions") && init?.method === "POST") {
      return {
        ok: true,
        json: async () => ({
          id: "submission-1",
          hotel_id: "shanghai-st-regis"
        })
      } as Response;
    }

    throw new Error(`Unexpected fetch: ${url}`);
  });

  vi.stubGlobal("fetch", fetchMock);

  render(<SubmitForm memberTiers={["Platinum", "Titanium"]} />);

  fireEvent.change(screen.getByLabelText("酒店"), {
    target: { value: "上海" }
  });

  await waitFor(() => {
    expect(screen.getByRole("button", { name: /上海静安瑞吉酒店/ })).toBeInTheDocument();
  });

  fireEvent.mouseDown(screen.getByRole("button", { name: /上海静安瑞吉酒店/ }));

  await waitFor(() => {
    expect(screen.getByLabelText("预订房型")).toBeEnabled();
  });

  fireEvent.change(screen.getByLabelText("会员等级"), { target: { value: "Platinum" } });
  fireEvent.change(screen.getByLabelText("预订房型"), { target: { value: "豪华客房" } });
  fireEvent.change(screen.getByLabelText("最终房型"), { target: { value: "小型套房" } });
  fireEvent.change(screen.getByLabelText("入住时间"), { target: { value: "2026-04-20" } });
  fireEvent.change(screen.getByLabelText("补充说明"), { target: { value: "测试新增样本" } });
  fireEvent.click(screen.getByRole("button", { name: "提交样本" }));

  await waitFor(() => {
    expect(screen.getByText("投稿成功，感谢补充这条入住观察。")).toBeInTheDocument();
  });
});
