import { NextResponse } from "next/server";
import { getContactInfo } from "@/lib/actions/admin/menu";

export async function GET() {
  try {
    const info = await getContactInfo();
    return NextResponse.json(info);
  } catch (error: any) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch contact info" },
      { status: 500 }
    );
  }
}

