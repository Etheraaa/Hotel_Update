import { NextResponse } from "next/server";
import { getSubmissionApi } from "../../../lib/server-api";

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = getSubmissionApi().createSubmission({
      hotel_id: readOptionalString(body?.hotel_id) ?? "",
      member_tier: readOptionalString(body?.member_tier) ?? "",
      booked_room_raw: readOptionalString(body?.booked_room_raw) ?? "",
      upgraded_room_raw: readOptionalString(body?.upgraded_room_raw) ?? "",
      observed_at: readOptionalString(body?.observed_at) ?? "",
      stay_context: readOptionalString(body?.stay_context)
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "InvalidSubmissionError") {
      return NextResponse.json({ error: "Invalid submission payload" }, { status: 400 });
    }

    throw error;
  }
}
