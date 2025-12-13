import { NextResponse } from "next/server";
import { getMenuItems } from "@/lib/actions/admin/menu";

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

    const items = await getMenuItems(location);
    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

