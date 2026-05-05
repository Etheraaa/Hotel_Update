import { NextResponse } from "next/server";
import { getHotelApi } from "../../../../lib/server-api";

type RouteContext = {
  params: Promise<{ hotelId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { hotelId } = await context.params;
  const detail = getHotelApi().getHotelDetail(hotelId);

  if (!detail) {
    return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
  }

  return NextResponse.json(detail);
}
