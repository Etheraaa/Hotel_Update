import EmptyState from "../common/empty-state";
import SiteHeader from "../common/site-header";
import type { FilterOptions, HotelListQuery, HotelSummary } from "../../types/hotel";
import FilterBar from "./filter-bar";
import Hero from "./hero";
import HotelGrid from "./hotel-grid";

type HomePageProps = {
  hotels: HotelSummary[];
  filters: FilterOptions;
  query?: HotelListQuery;
};

export default function HomePage({ hotels, filters, query }: HomePageProps) {
  return (
    <main className="home-shell">
      <SiteHeader />
      <form action="/" method="get">
        <Hero keyword={query?.keyword} />
        <FilterBar filters={filters} selected={query} />
      </form>
      {hotels.length === 0 ? (
        <EmptyState
          title="未找到符合条件的酒店"
          description="请尝试更换酒店名称或调整筛选条件"
        />
      ) : (
        <HotelGrid hotels={hotels} />
      )}
    </main>
  );
}
