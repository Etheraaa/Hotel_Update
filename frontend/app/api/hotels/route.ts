import { NextRequest, NextResponse } from "next/server";
import { getHotelApi } from "../../../lib/server-api";

function readParam(value: string | null) {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function GET(request: NextRequest) {
  const service = getHotelApi();
  const { searchParams } = new URL(request.url);

  return NextResponse.json({
    items: service.listHotels({
      keyword: readParam(searchParams.get("keyword")),
      group: readParam(searchParams.get("group")),
      brand: readParam(searchParams.get("brand")),
      city: readParam(searchParams.get("city"))
    })
  });
}
