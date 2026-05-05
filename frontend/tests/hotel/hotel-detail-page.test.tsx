import { render, screen } from "@testing-library/react";
import HotelDetailPage from "../../components/hotel/hotel-detail-page";
import type { HotelDetail, UpgradeStatsResponse } from "../../types/hotel";

const seedDetail: HotelDetail = {
  hotel_id: "shanghai-st-regis",
  hotel_name: "上海静安瑞吉酒店",
  hotel_group: "万豪",
  hotel_brand: "瑞吉",
  city: "上海",
  hotel_logo: "/logos/st-regis.svg",
  sample_count: 86,
  summary_text: "升房结果主要集中在尊贵豪华房、尊贵套房和部分标志性套房，整体上行空间清晰。",
  latest_observed_at: "2026.03",
  source_pool_desc: "来源池 论坛公开内容 + 审核投稿",
  editorial_note:
    "这家酒店适合先看 Platinum 以上等级的升级分布，因为样本更集中，也更能看出房型向上移动的层次。"
};

const seedStats: UpgradeStatsResponse = {
  columns: ["尊贵豪华房", "小型套房", "更高套房", "特色房型"],
  insufficient: false,
  rows: [
    {
      member_tier: "Marriott Gold",
      success_total: 19,
      buckets: {
        尊贵豪华房: { success_count: 8, success_ratio: 0.42, display: "8 / 42%" },
        小型套房: { success_count: 6, success_ratio: 0.32, display: "6 / 32%" },
        更高套房: { success_count: 3, success_ratio: 0.16, display: "3 / 16%" },
        特色房型: { success_count: 2, success_ratio: 0.1, display: "2 / 10%" }
      }
    }
  ]
};

test("renders hotel detail header and stats table", () => {
  render(<HotelDetailPage detail={seedDetail} stats={seedStats} />);

  expect(screen.getByText("编辑部判断")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "返回主页" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("table")).toBeInTheDocument();
  expect(screen.getByText("Marriott Gold")).toBeInTheDocument();
  expect(screen.getByText("8 / 42%")).toBeInTheDocument();
});

test("renders insufficient sample state", () => {
  render(
    <HotelDetailPage
      detail={seedDetail}
      stats={{ columns: [], rows: [], insufficient: true }}
    />
  );

  expect(screen.getByText("当前样本不足")).toBeInTheDocument();
  expect(screen.getByText("该酒店暂未形成可展示的会员等级升房分布")).toBeInTheDocument();
});
