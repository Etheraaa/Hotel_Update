import { notFound } from "next/navigation";
import HotelDetailPage from "../../../components/hotel/hotel-detail-page";
import { getHotelApi } from "../../../lib/server-api";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    hotelId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { hotelId } = await params;
  const service = getHotelApi();

  try {
    const [detail, stats] = await Promise.all([
      Promise.resolve(service.getHotelDetail(hotelId)),
      Promise.resolve(service.getHotelUpgradeStats(hotelId))
    ]);

    if (!detail) {
      notFound();
    }

    return <HotelDetailPage detail={detail} stats={stats} />;
  } catch {
    notFound();
  }
}
