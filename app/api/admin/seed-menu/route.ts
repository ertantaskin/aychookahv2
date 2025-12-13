import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { seedMenuAndHero } from "@/lib/actions/admin/seed-menu";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await seedMenuAndHero();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error seeding menu and hero:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed menu and hero" },
      { status: 500 }
    );
  }
}

