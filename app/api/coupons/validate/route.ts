import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/actions/coupons";
import { calculateCouponDiscount, validateCouponForCart } from "@/lib/utils/coupon-calculator";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, cartSubtotal, productIds, shippingCost, cartItems } = body;

    if (!code || typeof cartSubtotal !== "number" || !Array.isArray(productIds) || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: "Geçersiz istek parametreleri" },
        { status: 400 }
      );
    }

    // Kullanıcı bilgisini al (opsiyonel)
    const session = await auth();
    const userId = session?.user?.id;

    // Kuponu doğrula (temel kontroller)
    const validation = await validateCoupon(
      code,
      cartSubtotal,
      productIds,
      userId
    );

    if (!validation.valid || !validation.coupon) {
      return NextResponse.json(
        {
          valid: false,
          error: validation.error || "Kupon geçersiz",
        },
        { status: 200 }
      );
    }

    // BUY_X_GET_Y kuponları için sepet içeriği kontrolü
    // Kategori isimlerini almak için kategori ID'lerini topla
    const categoryIds = new Set<string>();
    if (validation.coupon.discountType === "BUY_X_GET_Y" && validation.coupon.buyMode) {
      if (validation.coupon.buyTargetId) {
        categoryIds.add(validation.coupon.buyTargetId);
      }
      if (validation.coupon.getTargetId) {
        categoryIds.add(validation.coupon.getTargetId);
      }
    }

    // Kategori isimlerini çek
    const categories = categoryIds.size > 0 
      ? await prisma.category.findMany({
          where: { id: { in: Array.from(categoryIds) } },
          select: { id: true, name: true },
        })
      : [];

    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => {
      categoryMap.set(cat.id, cat.name);
    });

    const cartValidation = validateCouponForCart({
      coupon: validation.coupon,
      cartSubtotal,
      productIds,
      cartItems: cartItems || [],
      userId,
      categoryMap, // Kategori isimleri için map
    });

    if (!cartValidation.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: cartValidation.error || "Kupon koşulları karşılanmıyor",
        },
        { status: 200 }
      );
    }

    // İndirim tutarını hesapla
    const discountAmount = calculateCouponDiscount({
      coupon: validation.coupon,
      cartSubtotal,
      shippingCost: shippingCost || 0,
      cartItems: cartItems || [],
    });

    return NextResponse.json({
      valid: true,
      coupon: {
        id: validation.coupon.id,
        code: validation.coupon.code,
        discountType: validation.coupon.discountType,
        discountValue: validation.coupon.discountValue,
        description: validation.coupon.description,
      },
      discountAmount,
    });
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      {
        valid: false,
        error: error.message || "Kupon doğrulanırken bir hata oluştu",
      },
      { status: 200 }
    );
  }
}
