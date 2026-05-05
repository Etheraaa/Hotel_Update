import Link from "next/link";
import type { HotelSummary } from "../../types/hotel";

type HotelCardProps = {
  hotel: HotelSummary;
};

function logoText(hotel: HotelSummary) {
  if (hotel.hotel_group === "万豪") return "Marriott";
  if (hotel.hotel_group === "希尔顿") return "Hilton";
  if (hotel.hotel_group === "凯悦") return "Hyatt";
  return hotel.hotel_group;
}

function tierColor(memberTier: string) {
  if (memberTier.includes("耀钻")) {
    return "#111111";
  }

  if (memberTier.includes("大使") || memberTier.includes("环球客") || memberTier.includes("钻卡")) {
    return "#1f5f4a";
  }

  if (memberTier.includes("钛金")) {
    return "#4d5561";
  }

  if (memberTier.includes("白金") || memberTier.includes("冒险家")) {
    return "#8b7d6b";
  }

  return "#c28c2c";
}

function formatSuiteRate(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Link className="hotel-card" href={`/hotel/${hotel.hotel_id}`}>
      <div className="hotel-card__top">
        <div className="hotel-card__logo">{logoText(hotel)}</div>
        <div>
          <p className="hotel-card__meta">
            {hotel.city} / {logoText(hotel)}
          </p>
          <h2 className="hotel-card__name">{hotel.hotel_name}</h2>
        </div>
      </div>
      <p className="hotel-card__samples">{hotel.sample_count} 个样本</p>
      <div className="hotel-card__divider" />
      {hotel.suite_rate_badges.length > 0 ? (
        <div className="hotel-card__suite-block" aria-label="会员等级套房率">
          <p className="hotel-card__suite-label">套房率</p>
          <div className="hotel-card__suite-rates">
            {hotel.suite_rate_badges.map((badge) => (
              <div className="hotel-card__suite-rate" key={badge.member_tier}>
                <span
                  aria-hidden="true"
                  className="hotel-card__suite-dot"
                  style={{ backgroundColor: tierColor(badge.member_tier) }}
                />
                <span className="hotel-card__suite-tier">{badge.member_tier}</span>
                <span className="hotel-card__suite-value">{formatSuiteRate(badge.suite_rate)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="hotel-card__summary">{hotel.summary_text}</p>
      )}
    </Link>
  );
}
