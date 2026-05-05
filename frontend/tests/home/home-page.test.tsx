import { render, screen } from "@testing-library/react";
import HomePage from "../../components/home/home-page";
import type { FilterOptions, HotelSummary } from "../../types/hotel";

const seedFilters: FilterOptions = {
  groups: ["万豪", "希尔顿"],
  brands: ["瑞吉", "康莱德"],
  cities: ["上海", "东京"]
};

const seedHotels: HotelSummary[] = [
  {
    hotel_id: "shanghai-st-regis",
    hotel_name: "上海静安瑞吉酒店",
    hotel_group: "万豪",
    hotel_brand: "瑞吉",
    city: "上海",
    hotel_logo: "/logos/st-regis.svg",
    sample_count: 86,
    summary_text: "升房结果主要集中在尊贵豪华房、尊贵套房和部分标志性套房，整体上行空间清晰。"
  }
];

test("renders search CTA and editorial summary", () => {
  render(<HomePage hotels={seedHotels} filters={seedFilters} />);

  expect(screen.getByPlaceholderText("搜索具体酒店，例如：上海静安瑞吉酒店")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "搜索酒店" })).toBeInTheDocument();
  expect(screen.getByText("本周编辑摘要")).toBeInTheDocument();
});

test("renders hotel cards that link to detail pages", () => {
  render(<HomePage hotels={seedHotels} filters={seedFilters} />);

  expect(screen.getByRole("link", { name: /上海静安瑞吉酒店/ })).toHaveAttribute(
    "href",
    "/hotel/shanghai-st-regis"
  );
});

test("renders empty state when no hotel matches", () => {
  render(<HomePage hotels={[]} filters={seedFilters} />);

  expect(screen.getByText("未找到符合条件的酒店")).toBeInTheDocument();
  expect(screen.getByText("请尝试更换酒店名称或调整筛选条件")).toBeInTheDocument();
});
