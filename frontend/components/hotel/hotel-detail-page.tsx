import type { HotelDetail, UpgradeStatsResponse } from "../../types/hotel";
import DetailNav from "./detail-nav";
import HotelHeader from "./hotel-header";
import MethodologyNote from "./methodology-note";
import UpgradeStatsTable from "./upgrade-stats-table";

type HotelDetailPageProps = {
  detail: HotelDetail;
  stats: UpgradeStatsResponse;
};

export default function HotelDetailPage({ detail, stats }: HotelDetailPageProps) {
  return (
    <main className="detail-shell">
      <DetailNav />
      <HotelHeader detail={detail} />
      <MethodologyNote />
      <UpgradeStatsTable stats={stats} />
    </main>
  );
}
