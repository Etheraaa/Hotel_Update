import { NextRequest, NextResponse } from "next/server";
import { getSubmissionApi } from "../../../../lib/server-api";

export function GET(request: NextRequest) {
  const keyword = new URL(request.url).searchParams.get("keyword")?.trim();

  return NextResponse.json({
    items: getSubmissionApi().searchHotels(keyword)
  });
}
