import type { HotelDetail } from "../../types/hotel";
import EditorialNoteCard from "./editorial-note-card";

function logoText(detail: HotelDetail) {
  if (detail.hotel_group === "万豪") return "M";
  if (detail.hotel_group === "希尔顿") return "H";
  if (detail.hotel_group === "凯悦") return "H";
  return detail.hotel_group.slice(0, 1);
}

export default function HotelHeader({ detail }: { detail: HotelDetail }) {
  return (
    <section className="detail-hero">
      <p className="detail-hero__meta">
        {detail.hotel_group} / {detail.city} / {detail.hotel_brand}
      </p>
      <h1 className="detail-hero__title">{detail.hotel_name}</h1>
      <p className="detail-hero__copy">{detail.summary_text}</p>
      <div className="detail-hero__divider" />
      <div className="detail-meta-row">
        <span>总样本量 {detail.sample_count}</span>
        <span>最近观察时间 {detail.latest_observed_at}</span>
        <span>{detail.source_pool_desc}</span>
      </div>
      <EditorialNoteCard note={detail.editorial_note} logo={logoText(detail)} />
    </section>
  );
}
