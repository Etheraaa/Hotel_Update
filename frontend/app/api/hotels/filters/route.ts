import { NextResponse } from "next/server";
import { getHotelApi } from "../../../../lib/server-api";

export function GET() {
  return NextResponse.json(getHotelApi().getFilterOptions());
}
