import { NextResponse } from "next/server";
import { getPhrasingApi } from "../../../../lib/server-api";

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
    : [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await getPhrasingApi().generate({
      hotel_id: readOptionalString(body?.hotel_id) ?? "",
      scenario_ids: readStringArray(body?.scenario_ids),
      membership_level: readOptionalString(body?.membership_level) ?? "",
      goal_request: readOptionalString(body?.goal_request) ?? "",
      tone: readOptionalString(body?.tone) ?? "",
      additional_context: readOptionalString(body?.additional_context)
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "InvalidPhrasingRequestError") {
      return NextResponse.json({ error: "Invalid phrasing request" }, { status: 400 });
    }

    if (error instanceof Error && error.name === "ConfigurationError") {
      return NextResponse.json({ error: "Phrasing service unavailable" }, { status: 503 });
    }

    if (error instanceof Error && error.name === "UpstreamGenerationError") {
      return NextResponse.json({ error: "Phrasing generation failed" }, { status: 502 });
    }

    throw error;
  }
}
