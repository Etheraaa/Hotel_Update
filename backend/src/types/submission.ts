export type SubmissionMeta = {
  member_tiers: string[];
};

export type SubmissionHotelSearchItem = {
  hotel_id: string;
  hotel_name: string;
  hotel_group: string;
  hotel_brand: string;
  city: string;
};

export type SubmissionRoomOption = {
  room_name: string;
};

export type SubmissionRoomOptionRecord = SubmissionRoomOption & {
  id: string;
  hotel_id: string;
  room_bucket: string | null;
};

export type SubmissionRoomOptionsResponse = {
  hotel_id: string;
  items: SubmissionRoomOption[];
};

export type SubmissionPayload = {
  hotel_id: string;
  member_tier: string;
  booked_room_raw: string;
  upgraded_room_raw: string;
  observed_at: string;
  stay_context?: string;
};

export type SubmissionRecord = {
  id: string;
  hotel_id: string;
  member_tier: string;
  booked_room_raw: string;
  upgraded_room_raw: string;
  observed_at: string;
  stay_context: string | null;
};

export type UpgradeStatTierRecord = {
  id: string;
  room_bucket: string;
  success_count: number;
  tier_success_total: number;
};
