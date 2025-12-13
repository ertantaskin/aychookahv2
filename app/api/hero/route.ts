import { NextResponse } from "next/server";
import { getHeroSlides } from "@/lib/actions/admin/hero";

export async function GET() {
  try {
    const slides = await getHeroSlides();
    return NextResponse.json(slides, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Error fetching hero slides:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

