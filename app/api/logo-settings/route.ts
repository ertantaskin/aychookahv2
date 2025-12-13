import { NextResponse } from "next/server";
import { getLogoSettingsWithFallback } from "@/lib/actions/admin/logo";

export async function GET() {
  try {
    const settings = await getLogoSettingsWithFallback();
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Error fetching logo settings:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch logo settings" },
      { status: 500 }
    );
  }
}

