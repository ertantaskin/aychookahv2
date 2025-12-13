import { NextResponse } from "next/server";
import { getSectionTitle } from "@/lib/actions/admin/menu";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");

    if (!location) {
      return NextResponse.json(
        { error: "Location parameter is required" },
        { status: 400 }
      );
    }

    const title = await getSectionTitle(location);
    return NextResponse.json(title);
  } catch (error: any) {
    console.error("Error fetching section title:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch section title" },
      { status: 500 }
    );
  }
}

