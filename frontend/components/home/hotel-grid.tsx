import type { HotelSummary } from "../../types/hotel";
import HotelCard from "./hotel-card";

type HotelGridProps = {
  hotels: HotelSummary[];
};

export default function HotelGrid({ hotels }: HotelGridProps) {
  return (
    <section className="hotel-grid">
      {hotels.map((hotel) => (
        <HotelCard key={hotel.hotel_id} hotel={hotel} />
      ))}
    </section>
  );
}
