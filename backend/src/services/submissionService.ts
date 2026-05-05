import type { Database as SqliteDatabase } from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { createSubmissionRepository } from "../repositories/submissionRepository.js";
import type {
  SubmissionMeta,
  SubmissionPayload,
  SubmissionRecord,
  SubmissionRoomOptionsResponse
} from "../types/submission.js";

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export class InvalidSubmissionError extends Error {}

export function createSubmissionService(db: SqliteDatabase) {
  const repository = createSubmissionRepository(db);

  return {
    getSubmissionMeta(): SubmissionMeta {
      return {
        member_tiers: repository.getMemberTiers()
      };
    },

    searchHotels(keyword?: string) {
      return repository.searchHotels(keyword);
    },

    getHotelRoomOptions(hotelId: string): SubmissionRoomOptionsResponse {
      return {
        hotel_id: hotelId,
        items: repository
          .getHotelRoomOptions(hotelId)
          .map((option) => ({ room_name: option.room_name }))
      };
    },

    createSubmission(payload: SubmissionPayload): SubmissionRecord {
      const hotel = repository.findHotelById(payload.hotel_id);
      const memberTiers = repository.getMemberTiers();
      const roomOptions = repository.getHotelRoomOptions(payload.hotel_id);
      const bookedRoom = roomOptions.find((option) => option.room_name === payload.booked_room_raw);
      const upgradedRoom = roomOptions.find(
        (option) => option.room_name === payload.upgraded_room_raw
      );

      if (
        !hotel ||
        !memberTiers.includes(payload.member_tier) ||
        !bookedRoom ||
        !upgradedRoom ||
        !upgradedRoom.room_bucket ||
        !isValidDate(payload.observed_at)
      ) {
        throw new InvalidSubmissionError("Invalid submission payload");
      }

      const upgradedRoomBucket = upgradedRoom.room_bucket;

      const record: SubmissionRecord = {
        id: randomUUID(),
        hotel_id: payload.hotel_id,
        member_tier: payload.member_tier,
        booked_room_raw: payload.booked_room_raw,
        upgraded_room_raw: payload.upgraded_room_raw,
        observed_at: payload.observed_at,
        stay_context: payload.stay_context?.trim() ? payload.stay_context.trim() : null
      };

      repository.transaction(() => {
        repository.insertSubmission(record);
        repository.updateHotelAggregates(record.hotel_id, record.observed_at);

        const tierStats = repository.getTierStats(record.hotel_id, record.member_tier);
        const counts = new Map(tierStats.map((stat) => [stat.room_bucket, stat.success_count]));
        const ids = new Map(tierStats.map((stat) => [stat.room_bucket, stat.id]));
        counts.set(upgradedRoomBucket, (counts.get(upgradedRoomBucket) ?? 0) + 1);

        const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);

        for (const [roomBucket, successCount] of counts.entries()) {
          repository.upsertTierStat({
            id: ids.get(roomBucket) ?? randomUUID(),
            hotelId: record.hotel_id,
            memberTier: record.member_tier,
            roomBucket,
            successCount,
            successRatio: successCount / total,
            tierSuccessTotal: total
          });
        }
      });

      return record;
    }
  };
}
