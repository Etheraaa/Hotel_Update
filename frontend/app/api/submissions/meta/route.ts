import { NextResponse } from "next/server";
import { getSubmissionApi } from "../../../../lib/server-api";

export function GET() {
  return NextResponse.json(getSubmissionApi().getSubmissionMeta());
}
