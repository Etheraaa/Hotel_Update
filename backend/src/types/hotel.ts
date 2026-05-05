export type HotelListQuery = {
  keyword?: string;
  group?: string;
  brand?: string;
  city?: string;
};

export type HotelRecord = {
  id: string;
  name: string;
  group_name: string;
  brand_name: string;
  city: string;
  logo_url: string | null;
  sample_count: number;
  summary_text: string;
};

export type HotelSuiteRateRecord = {
  hotel_id: string;
  member_tier: string;
  suite_rate: number;
};

export type SuiteRateBadge = {
  member_tier: string;
  suite_rate: number;
};

export type HotelDetailRecord = HotelRecord & {
  latest_observed_at: string;
  source_pool_desc: string;
  editorial_note: string;
};

export type UpgradeStatRecord = {
  member_tier: string;
  room_bucket: string;
  success_count: number;
  success_ratio: number;
  tier_success_total: number;
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
  suite_rate_badges: SuiteRateBadge[];
};

export type HotelDetail = HotelSummary & {
  latest_observed_at: string;
  source_pool_desc: string;
  editorial_note: string;
};

export type FilterOptions = {
  groups: string[];
  brands: string[];
  cities: string[];
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
