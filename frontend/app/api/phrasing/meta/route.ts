import { NextResponse } from "next/server";
import { getPhrasingApi } from "../../../../lib/server-api";

export function GET() {
  return NextResponse.json(getPhrasingApi().getMeta());
}
