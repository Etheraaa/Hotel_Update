import type { Database as SqliteDatabase } from "better-sqlite3";
import type {
  FilterOptions,
  HotelDetailRecord,
  HotelListQuery,
  HotelRecord,
  HotelSuiteRateRecord,
  UpgradeStatRecord
} from "../types/hotel.js";

export function createHotelRepository(db: SqliteDatabase) {
  return {
    listHotels(query: HotelListQuery): HotelRecord[] {
      const conditions: string[] = [];
      const params: Record<string, string> = {};

      if (query.keyword) {
        conditions.push("name like @keyword");
        params.keyword = `%${query.keyword}%`;
      }

      if (query.group) {
        conditions.push("group_name = @group");
        params.group = query.group;
      }

      if (query.brand) {
        conditions.push("brand_name = @brand");
        params.brand = query.brand;
      }

      if (query.city) {
        conditions.push("city = @city");
        params.city = query.city;
      }

      const whereClause = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";

      return db
        .prepare(
          `
          select
            id,
            name,
            group_name,
            brand_name,
            city,
            logo_url,
            sample_count,
            summary_text
          from hotels
          ${whereClause}
          order by sample_count desc, name asc
        `
        )
        .all(params) as HotelRecord[];
    },

    listHotelSuiteRates(hotelIds: string[]): HotelSuiteRateRecord[] {
      if (hotelIds.length === 0) {
        return [];
      }

      const placeholders = hotelIds.map((_, index) => `@hotelId${index}`).join(", ");
      const params = Object.fromEntries(hotelIds.map((hotelId, index) => [`hotelId${index}`, hotelId]));

      return db
        .prepare(
          `
          select
            hotel_id,
            member_tier,
            coalesce(
              sum(case when room_bucket in ('小型套房', '更高套房', '特色房型') then success_count else 0 end) * 1.0
                / nullif(max(tier_success_total), 0),
              0
            ) as suite_rate
          from upgrade_stats
          where hotel_id in (${placeholders})
          group by hotel_id, member_tier
        `
        )
        .all(params) as HotelSuiteRateRecord[];
    },

    getFilterOptions(): FilterOptions {
      const groups = db.prepare("select distinct group_name as value from hotels order by value").all() as {
        value: string;
      }[];
      const brands = db.prepare("select distinct brand_name as value from hotels order by value").all() as {
        value: string;
      }[];
      const cities = db.prepare("select distinct city as value from hotels order by value").all() as {
        value: string;
      }[];

      return {
        groups: groups.map((item) => item.value),
        brands: brands.map((item) => item.value),
        cities: cities.map((item) => item.value)
      };
    },

    getHotelDetail(hotelId: string): HotelDetailRecord | undefined {
      return db
        .prepare(
          `
          select
            id,
            name,
            group_name,
            brand_name,
            city,
            logo_url,
            sample_count,
            latest_observed_at,
            source_pool_desc,
            editorial_note,
            summary_text
          from hotels
          where id = @hotelId
        `
        )
        .get({ hotelId }) as HotelDetailRecord | undefined;
    },

    getUpgradeStats(hotelId: string): UpgradeStatRecord[] {
      return db
        .prepare(
          `
          select
            member_tier,
            room_bucket,
            success_count,
            success_ratio,
            tier_success_total
          from upgrade_stats
          where hotel_id = @hotelId
          order by tier_success_total asc, member_tier asc, room_bucket asc
        `
        )
        .all({ hotelId }) as UpgradeStatRecord[];
    }
  };
}
