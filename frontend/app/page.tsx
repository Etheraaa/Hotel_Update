import HomePage from "../components/home/home-page";
import { getHotelApi } from "../lib/server-api";
import type { HotelListQuery } from "../types/hotel";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export default async function Page({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query: HotelListQuery = {
    keyword: readParam(params.keyword),
    group: readParam(params.group),
    brand: readParam(params.brand),
    city: readParam(params.city)
  };
  const service = getHotelApi();
  const [hotels, filters] = await Promise.all([
    Promise.resolve(service.listHotels(query)),
    Promise.resolve(service.getFilterOptions())
  ]);

  return <HomePage hotels={hotels} filters={filters} query={query} />;
}
