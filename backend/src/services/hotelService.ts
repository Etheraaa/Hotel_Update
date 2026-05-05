import type { Database as SqliteDatabase } from "better-sqlite3";
import { createHotelRepository } from "../repositories/hotelRepository.js";
import { roomBucketOrder, sortByPreferredOrder, tierOrderByGroup } from "../domain/ordering.js";
import type {
  HotelDetail,
  HotelDetailRecord,
  HotelListQuery,
  HotelRecord,
  HotelSummary,
  HotelSuiteRateRecord,
  SuiteRateBadge,
  UpgradeStatsCell,
  UpgradeStatsResponse
} from "../types/hotel.js";

function toHotelSummary(record: HotelRecord, suiteRateBadges: SuiteRateBadge[]): HotelSummary {
  return {
    hotel_id: record.id,
    hotel_name: record.name,
    hotel_group: record.group_name,
    hotel_brand: record.brand_name,
    city: record.city,
    hotel_logo: record.logo_url,
    sample_count: record.sample_count,
    summary_text: record.summary_text,
    suite_rate_badges: suiteRateBadges
  };
}

function toHotelDetail(record: HotelDetailRecord, suiteRateBadges: SuiteRateBadge[]): HotelDetail {
  return {
    ...toHotelSummary(record, suiteRateBadges),
    latest_observed_at: record.latest_observed_at,
    source_pool_desc: record.source_pool_desc,
    editorial_note: record.editorial_note
  };
}

function groupSuiteRateBadges(
  records: HotelSuiteRateRecord[],
  hotelRecords: HotelRecord[]
): Map<string, SuiteRateBadge[]> {
  const hotelGroupById = new Map(hotelRecords.map((record) => [record.id, record.group_name]));
  const grouped = new Map<string, SuiteRateBadge[]>();

  for (const record of records) {
    const existing = grouped.get(record.hotel_id) ?? [];
    existing.push({
      member_tier: record.member_tier,
      suite_rate: record.suite_rate
    });
    grouped.set(record.hotel_id, existing);
  }

  for (const [hotelId, badges] of grouped.entries()) {
    const tierOrder = tierOrderByGroup[hotelGroupById.get(hotelId) ?? ""] ?? [];
    const orderedTiers = sortByPreferredOrder(
      badges.map((badge) => badge.member_tier),
      tierOrder
    );
    const badgeByTier = new Map(badges.map((badge) => [badge.member_tier, badge]));
    grouped.set(
      hotelId,
      orderedTiers
        .map((tier) => badgeByTier.get(tier))
        .filter((badge): badge is SuiteRateBadge => Boolean(badge))
    );
  }

  return grouped;
}

function createEmptyCell(): UpgradeStatsCell {
  return {
    success_count: 0,
    success_ratio: 0,
    display: "0 / 0%"
  };
}

function formatCell(successCount: number, successRatio: number): UpgradeStatsCell {
  return {
    success_count: successCount,
    success_ratio: successRatio,
    display: `${successCount} / ${Math.round(successRatio * 100)}%`
  };
}

export function createHotelService(db: SqliteDatabase) {
  const repository = createHotelRepository(db);

  return {
    listHotels(query: HotelListQuery): HotelSummary[] {
      const hotels = repository.listHotels(query);
      const suiteRateBadges = groupSuiteRateBadges(
        repository.listHotelSuiteRates(hotels.map((hotel) => hotel.id)),
        hotels
      );

      return hotels.map((hotel) => toHotelSummary(hotel, suiteRateBadges.get(hotel.id) ?? []));
    },

    getFilterOptions() {
      return repository.getFilterOptions();
    },

    getHotelDetail(hotelId: string): HotelDetail | undefined {
      const record = repository.getHotelDetail(hotelId);
      if (!record) {
        return undefined;
      }

      const suiteRateBadges = groupSuiteRateBadges(
        repository.listHotelSuiteRates([hotelId]),
        [record]
      );
      return toHotelDetail(record, suiteRateBadges.get(hotelId) ?? []);
    },

    getHotelUpgradeStats(hotelId: string): UpgradeStatsResponse {
      const detail = repository.getHotelDetail(hotelId);
      const stats = repository.getUpgradeStats(hotelId);
      const rowsByTier = new Map<string, UpgradeStatsResponse["rows"][number]>();

      for (const stat of stats) {
        const existing = rowsByTier.get(stat.member_tier);
        const row =
          existing ??
          {
            member_tier: stat.member_tier,
            success_total: stat.tier_success_total,
            buckets: Object.fromEntries(
              roomBucketOrder.map((column) => [column, createEmptyCell()])
            ) as UpgradeStatsResponse["rows"][number]["buckets"]
          };

        row.buckets[stat.room_bucket] = formatCell(stat.success_count, stat.success_ratio);
        rowsByTier.set(stat.member_tier, row);
      }

      const tierOrder = detail ? (tierOrderByGroup[detail.group_name] ?? []) : [];
      const sortedTierNames = sortByPreferredOrder(Array.from(rowsByTier.keys()), tierOrder);
      const sortedRows = sortedTierNames
        .map((tier) => rowsByTier.get(tier))
        .filter((row): row is UpgradeStatsResponse["rows"][number] => Boolean(row));

      return {
        columns: [...roomBucketOrder],
        rows: sortedRows,
        insufficient: stats.length === 0
      };
    }
  };
}
