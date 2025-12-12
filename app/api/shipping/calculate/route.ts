import { NextRequest, NextResponse } from "next/server";
import { getShippingSettings, calculateShippingCost } from "@/lib/utils/shipping-calculator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subtotal } = body;

    if (typeof subtotal !== "number") {
      return NextResponse.json(
        { error: "Geçersiz istek parametreleri" },
        { status: 400 }
      );
    }

    const shippingSettings = await getShippingSettings();
    const shippingCost = calculateShippingCost(subtotal, shippingSettings);

    return NextResponse.json({ shippingCost });
  } catch (error: any) {
    console.error("Error calculating shipping cost:", error);
    return NextResponse.json(
      { error: error.message || "Kargo ücreti hesaplanırken bir hata oluştu" },
      { status: 500 }
    );
  }
}

