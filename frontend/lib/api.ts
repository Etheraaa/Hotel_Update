import { apiBaseUrl } from "./config";
import type {
  FilterOptions,
  HotelDetail,
  HotelListQuery,
  HotelListResponse,
  SubmissionMeta,
  SubmissionPayload,
  SubmissionResponse,
  SubmissionRoomOptionsResponse,
  SubmissionHotelSearchResponse,
  UpgradeStatsResponse
} from "../types/hotel";
import type { PhrasingMeta, PhrasingPayload, PhrasingResponse } from "../types/phrasing";

type QueryValue = string | undefined;

export function buildApiUrl(path: string, query?: Record<string, QueryValue>) {
  const base = apiBaseUrl || "http://internal.local";
  const url = new URL(path, base);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return apiBaseUrl ? url.toString() : `${url.pathname}${url.search}`;
}

async function apiGet<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
  const response = await fetch(buildApiUrl(path, query));

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getHotels(query?: HotelListQuery) {
  return apiGet<HotelListResponse>("/api/hotels", query);
}

export function getHotelFilters() {
  return apiGet<FilterOptions>("/api/hotels/filters");
}

export function getHotelDetail(hotelId: string) {
  return apiGet<HotelDetail>(`/api/hotels/${hotelId}`);
}

export function getHotelUpgradeStats(hotelId: string) {
  return apiGet<UpgradeStatsResponse>(`/api/hotels/${hotelId}/upgrade-stats`);
}

export function getSubmissionMeta() {
  return apiGet<SubmissionMeta>("/api/submissions/meta");
}

export function searchSubmissionHotels(keyword: string) {
  return apiGet<SubmissionHotelSearchResponse>("/api/submissions/hotels", { keyword });
}

export function getSubmissionRoomOptions(hotelId: string) {
  return apiGet<SubmissionRoomOptionsResponse>(`/api/submissions/hotels/${hotelId}/room-options`);
}

export function createSubmission(payload: SubmissionPayload) {
  return apiPost<SubmissionResponse>("/api/submissions", payload);
}

export function getPhrasingMeta() {
  return apiGet<PhrasingMeta>("/api/phrasing/meta");
}

export function generatePhrasing(payload: PhrasingPayload) {
  return apiPost<PhrasingResponse>("/api/phrasing/generate", payload);
}
