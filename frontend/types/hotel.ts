export type HotelListQuery = {
  keyword?: string;
  group?: string;
  brand?: string;
  city?: string;
};

export type HotelSummary = {
  hotel_id: string;
  hotel_name: string;
  hotel_group: string;
  hotel_brand: string;
  city: string;
  hotel_logo: string | null;
  sample_count: number;
  summary_text: string;
  suite_rate_badges: {
    member_tier: string;
    suite_rate: number;
  }[];
};

export type HotelListResponse = {
  items: HotelSummary[];
};

export type FilterOptions = {
  groups: string[];
  brands: string[];
  cities: string[];
};

export type HotelDetail = HotelSummary & {
  latest_observed_at: string;
  source_pool_desc: string;
  editorial_note: string;
};

export type UpgradeStatsCell = {
  success_count: number;
  success_ratio: number;
  display: string;
};

export type UpgradeStatsRow = {
  member_tier: string;
  success_total: number;
  buckets: Record<string, UpgradeStatsCell>;
};

export type UpgradeStatsResponse = {
  columns: string[];
  rows: UpgradeStatsRow[];
  insufficient: boolean;
};

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

export type SubmissionHotelSearchResponse = {
  items: SubmissionHotelSearchItem[];
};

export type SubmissionRoomOption = {
  room_name: string;
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

export type SubmissionResponse = SubmissionPayload & {
  id: string;
  stay_context?: string | null;
};
