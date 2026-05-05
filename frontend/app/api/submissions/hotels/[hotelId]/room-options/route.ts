import { NextResponse } from "next/server";
import { getSubmissionApi } from "../../../../../../lib/server-api";

type RouteContext = {
  params: Promise<{ hotelId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { hotelId } = await context.params;

  return NextResponse.json(getSubmissionApi().getHotelRoomOptions(hotelId));
}
