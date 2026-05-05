import type { Database as SqliteDatabase } from "better-sqlite3";
import { preferredTierOrder, roomBucketOrder, sortByPreferredOrder } from "../domain/ordering.js";
import type {
  SubmissionHotelSearchItem,
  SubmissionRecord,
  SubmissionRoomOptionRecord,
  UpgradeStatTierRecord
} from "../types/submission.js";

export function createSubmissionRepository(db: SqliteDatabase) {
  return {
    getMemberTiers(): string[] {
      const rows = db
        .prepare(
          `
            select value from (
              select distinct member_tier as value from raw_upgrade_cases
              union
              select distinct member_tier as value from upgrade_stats
            )
            order by value asc
          `
        )
        .all() as { value: string }[];

      return sortByPreferredOrder(
        rows.map((row) => row.value),
        preferredTierOrder
      );
    },

    searchHotels(keyword?: string): SubmissionHotelSearchItem[] {
      const hasKeyword = typeof keyword === "string" && keyword.trim().length > 0;
      return db
        .prepare(
          `
            select
              id as hotel_id,
              name as hotel_name,
              group_name as hotel_group,
              brand_name as hotel_brand,
              city
            from hotels
            ${hasKeyword ? "where name like @keyword or city like @keyword or brand_name like @keyword or group_name like @keyword" : ""}
            order by sample_count desc, name asc
            limit 12
          `
        )
        .all(hasKeyword ? { keyword: `%${keyword?.trim()}%` } : {}) as SubmissionHotelSearchItem[];
    },

    findHotelById(hotelId: string) {
      return db
        .prepare(
          `
            select id, name as hotel_name, sample_count, latest_observed_at
            from hotels
            where id = @hotelId
          `
        )
        .get({ hotelId }) as
        | {
            id: string;
            hotel_name: string;
            sample_count: number;
            latest_observed_at: string;
          }
        | undefined;
    },

    getHotelRoomOptions(hotelId: string): SubmissionRoomOptionRecord[] {
      const roomOptions = db
        .prepare(
          `
            select id, hotel_id, room_name, room_bucket
            from hotel_room_options
            where hotel_id = @hotelId
          `
        )
        .all({ hotelId }) as SubmissionRoomOptionRecord[];

      const roomBucketIndex = new Map<string, number>(
        roomBucketOrder.map((bucket, index) => [bucket, index])
      );

      return roomOptions.sort((left, right) => {
        const leftIndex = left.room_bucket ? (roomBucketIndex.get(left.room_bucket) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
        const rightIndex = right.room_bucket ? (roomBucketIndex.get(right.room_bucket) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;

        if (leftIndex !== rightIndex) {
          return leftIndex - rightIndex;
        }

        return left.room_name.localeCompare(right.room_name, "zh-Hans-CN");
      });
    },

    getTierStats(hotelId: string, memberTier: string): UpgradeStatTierRecord[] {
      const tierStats = db
        .prepare(
          `
            select id, room_bucket, success_count, tier_success_total
            from upgrade_stats
            where hotel_id = @hotelId and member_tier = @memberTier
          `
        )
        .all({ hotelId, memberTier }) as UpgradeStatTierRecord[];

      const roomBucketIndex = new Map<string, number>(
        roomBucketOrder.map((bucket, index) => [bucket, index])
      );

      return tierStats.sort((left, right) => {
        const leftIndex = roomBucketIndex.get(left.room_bucket) ?? Number.MAX_SAFE_INTEGER;
        const rightIndex = roomBucketIndex.get(right.room_bucket) ?? Number.MAX_SAFE_INTEGER;

        if (leftIndex !== rightIndex) {
          return leftIndex - rightIndex;
        }

        return left.room_bucket.localeCompare(right.room_bucket, "zh-Hans-CN");
      });
    },

    insertSubmission(record: SubmissionRecord) {
      db.prepare(
        `
          insert into raw_upgrade_cases (
            id, hotel_id, observed_at, booked_room_raw, upgraded_room_raw, member_tier, stay_context
          ) values (
            @id, @hotel_id, @observed_at, @booked_room_raw, @upgraded_room_raw, @member_tier, @stay_context
          )
        `
      ).run(record);
    },

    updateHotelAggregates(hotelId: string, observedAt: string) {
      db.prepare(
        `
          update hotels
          set
            sample_count = sample_count + 1,
            latest_observed_at = case
              when latest_observed_at < @observedAt then @observedAt
              else latest_observed_at
            end
          where id = @hotelId
        `
      ).run({ hotelId, observedAt });
    },

    upsertTierStat(args: {
      id: string;
      hotelId: string;
      memberTier: string;
      roomBucket: string;
      successCount: number;
      successRatio: number;
      tierSuccessTotal: number;
    }) {
      db.prepare(
        `
          insert into upgrade_stats (
            id, hotel_id, member_tier, room_bucket, success_count, success_ratio, tier_success_total
          ) values (
            @id, @hotelId, @memberTier, @roomBucket, @successCount, @successRatio, @tierSuccessTotal
          )
          on conflict(id) do update set
            success_count = excluded.success_count,
            success_ratio = excluded.success_ratio,
            tier_success_total = excluded.tier_success_total
        `
      ).run(args);
    },

    transaction<T>(run: () => T) {
      return db.transaction(run)();
    }
  };
}
