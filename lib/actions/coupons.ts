"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { DiscountType } from "@prisma/client";

// Kupon listesi getir
export async function getCoupons(
  page: number = 1,
  limit: number = 20,
  search?: string,
  isActive?: boolean | null,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive;
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              usages: true,
            },
          },
        },
      }),
      prisma.coupon.count({ where }),
    ]);

    return {
      coupons,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
}

// Tekil kupon getir
export async function getCoupon(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            order: {
              select: {
                id: true,
                orderNumber: true,
                total: true,
              },
            },
          },
          orderBy: {
            usedAt: "desc",
          },
          take: 50,
        },
        _count: {
          select: {
            usages: true,
          },
        },
      },
    });

    return coupon;
  } catch (error) {
    console.error("Error fetching coupon:", error);
    throw error;
  }
}

// Kupon oluştur
export async function createCoupon(data: {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  buyMode?: string | null;
  buyTargetId?: string | null;
  getTargetId?: string | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  maxFreeQuantity?: number | null;
  isActive?: boolean;
  totalUsageLimit?: number | null;
  customerUsageLimit?: number;
  startDate?: Date | null;
  endDate?: Date | null;
  minimumAmount?: number | null;
  applicableProducts?: string[] | null;
  applicableCategories?: string[] | null;
  applicableUsers?: string[] | null;
  description?: string | null;
}) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Kupon kodu benzersiz olmalı
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existingCoupon) {
      throw new Error("Bu kupon kodu zaten kullanılıyor");
    }

    // BUY_X_GET_Y için validasyon
    if (data.discountType === "BUY_X_GET_Y") {
      if (!data.buyMode) {
        throw new Error("BUY_X_GET_Y kuponu için mod seçilmelidir");
      }

      if (data.buyMode === "CATEGORY" || data.buyMode === "PRODUCT") {
        if (!data.buyTargetId || !data.getTargetId || !data.buyQuantity || !data.getQuantity) {
          throw new Error("BUY_X_GET_Y kuponu için gerekli alanlar eksik");
        }
        if (data.buyTargetId === data.getTargetId) {
          throw new Error("Alınacak ve bedava hedef aynı olamaz");
        }
        if (data.buyQuantity <= 0 || data.getQuantity <= 0) {
          throw new Error("Adet değerleri pozitif olmalıdır");
        }
      }

      if (data.buyMode === "CONDITIONAL_FREE") {
        if (!data.getTargetId) {
          throw new Error("Bedava kategori belirtilmelidir");
        }
        if (!data.buyTargetId && !data.minimumAmount) {
          throw new Error("En az bir koşul belirtilmelidir (kategori veya minimum tutar)");
        }
      }
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        buyMode: data.buyMode,
        buyTargetId: data.buyTargetId,
        getTargetId: data.getTargetId,
        buyQuantity: data.buyQuantity,
        getQuantity: data.getQuantity,
        maxFreeQuantity: data.maxFreeQuantity,
        isActive: data.isActive ?? true,
        totalUsageLimit: data.totalUsageLimit,
        customerUsageLimit: data.customerUsageLimit ?? 1,
        startDate: data.startDate,
        endDate: data.endDate,
        minimumAmount: data.minimumAmount,
        applicableProducts: data.applicableProducts ? JSON.parse(JSON.stringify(data.applicableProducts)) : null,
        applicableCategories: data.applicableCategories ? JSON.parse(JSON.stringify(data.applicableCategories)) : null,
        applicableUsers: data.applicableUsers ? JSON.parse(JSON.stringify(data.applicableUsers)) : null,
        description: data.description,
      },
    });

    revalidatePath("/admin/kampanyalar/kuponlar");
    return coupon;
  } catch (error) {
    console.error("Error creating coupon:", error);
    throw error;
  }
}

// Kupon güncelle
export async function updateCoupon(
  id: string,
  data: {
    code?: string;
    discountType?: DiscountType;
    discountValue?: number;
    buyMode?: string | null;
    buyTargetId?: string | null;
    getTargetId?: string | null;
    buyQuantity?: number | null;
    getQuantity?: number | null;
    maxFreeQuantity?: number | null;
    isActive?: boolean;
    totalUsageLimit?: number | null;
    customerUsageLimit?: number;
    startDate?: Date | null;
    endDate?: Date | null;
    minimumAmount?: number | null;
    applicableProducts?: string[] | null;
    applicableCategories?: string[] | null;
    applicableUsers?: string[] | null;
    description?: string | null;
  }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Kupon kodu değiştiriliyorsa benzersizlik kontrolü
    if (data.code) {
      const existingCoupon = await prisma.coupon.findFirst({
        where: {
          code: data.code.toUpperCase(),
          NOT: { id },
        },
      });

      if (existingCoupon) {
        throw new Error("Bu kupon kodu zaten kullanılıyor");
      }
    }

    // BUY_X_GET_Y için validasyon
    if (data.discountType === "BUY_X_GET_Y") {
      if (data.buyMode) {
        if (data.buyMode === "CATEGORY" || data.buyMode === "PRODUCT") {
          if (data.buyTargetId && data.getTargetId && data.buyTargetId === data.getTargetId) {
            throw new Error("Alınacak ve bedava hedef aynı olamaz");
          }
          if (data.buyQuantity !== undefined && data.buyQuantity !== null && data.buyQuantity <= 0) {
            throw new Error("Alınacak adet pozitif olmalıdır");
          }
          if (data.getQuantity !== undefined && data.getQuantity !== null && data.getQuantity <= 0) {
            throw new Error("Bedava adet pozitif olmalıdır");
          }
        }

        if (data.buyMode === "CONDITIONAL_FREE") {
          if (!data.getTargetId) {
            throw new Error("Bedava kategori belirtilmelidir");
          }
          // En az bir koşul kontrolü - mevcut kuponu kontrol et
          const currentCoupon = await prisma.coupon.findUnique({ where: { id } });
          const hasBuyTarget = data.buyTargetId !== undefined ? data.buyTargetId : currentCoupon?.buyTargetId;
          const hasMinAmount = data.minimumAmount !== undefined ? data.minimumAmount : currentCoupon?.minimumAmount;
          if (!hasBuyTarget && !hasMinAmount) {
            throw new Error("En az bir koşul belirtilmelidir (kategori veya minimum tutar)");
          }
        }
      }
    }

    const updateData: any = { ...data };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    if (updateData.applicableProducts !== undefined) {
      updateData.applicableProducts = updateData.applicableProducts
        ? JSON.parse(JSON.stringify(updateData.applicableProducts))
        : null;
    }
    if (updateData.applicableUsers !== undefined) {
      updateData.applicableUsers = updateData.applicableUsers
        ? JSON.parse(JSON.stringify(updateData.applicableUsers))
        : null;
    }
    if (updateData.applicableCategories !== undefined) {
      updateData.applicableCategories = updateData.applicableCategories
        ? JSON.parse(JSON.stringify(updateData.applicableCategories))
        : null;
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/kampanyalar/kuponlar");
    revalidatePath(`/admin/kampanyalar/kuponlar/${id}`);
    return coupon;
  } catch (error) {
    console.error("Error updating coupon:", error);
    throw error;
  }
}

// Kupon sil
export async function deleteCoupon(id: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await prisma.coupon.delete({
      where: { id },
    });

    revalidatePath("/admin/kampanyalar/kuponlar");
    return { success: true };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
}

// Kupon doğrulama (müşteri tarafı için)
export async function validateCoupon(
  code: string,
  cartSubtotal: number,
  productIds: string[],
  userId?: string
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        _count: {
          select: {
            usages: true,
          },
        },
      },
    });

    if (!coupon) {
      return {
        valid: false,
        error: "Kupon kodu bulunamadı",
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        error: "Bu kupon aktif değil",
      };
    }

    // Tarih kontrolü
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return {
        valid: false,
        error: "Bu kupon henüz geçerli değil",
      };
    }
    if (coupon.endDate && now > coupon.endDate) {
      return {
        valid: false,
        error: "Bu kuponun süresi dolmuş",
      };
    }

    // Minimum tutar kontrolü
    if (coupon.minimumAmount && cartSubtotal < coupon.minimumAmount) {
      return {
        valid: false,
        error: `Bu kupon için minimum sepet tutarı ${coupon.minimumAmount.toFixed(2)} TL olmalıdır`,
      };
    }

    // Toplam kullanım limiti kontrolü
    if (coupon.totalUsageLimit && coupon._count.usages >= coupon.totalUsageLimit) {
      return {
        valid: false,
        error: "Bu kuponun kullanım limiti dolmuş",
      };
    }

    // Ürün kontrolü
    if (coupon.applicableProducts) {
      const applicableProductIds = coupon.applicableProducts as string[];
      const hasApplicableProduct = productIds.some((id) => applicableProductIds.includes(id));
      if (!hasApplicableProduct) {
        return {
          valid: false,
          error: "Bu kupon sepetinizdeki ürünler için geçerli değil",
        };
      }
    }

    // Kullanıcı kontrolü
    if (coupon.applicableUsers && userId) {
      const applicableUserIds = coupon.applicableUsers as string[];
      if (!applicableUserIds.includes(userId)) {
        return {
          valid: false,
          error: "Bu kupon sizin için geçerli değil",
        };
      }
    }

    // Müşteri başına kullanım limiti kontrolü
    if (userId) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userId,
        },
      });

      if (userUsageCount >= coupon.customerUsageLimit) {
        return {
          valid: false,
          error: "Bu kuponu daha fazla kullanamazsınız",
        };
      }
    }

    return {
      valid: true,
      coupon,
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return {
      valid: false,
      error: "Kupon doğrulanırken bir hata oluştu",
    };
  }
}

// Kupon kullanım istatistikleri
export async function getCouponUsage(couponId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const [totalUsages, recentUsages] = await Promise.all([
      prisma.couponUsage.count({
        where: { couponId },
      }),
      prisma.couponUsage.findMany({
        where: { couponId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
            },
          },
        },
        orderBy: {
          usedAt: "desc",
        },
        take: 10,
      }),
    ]);

    return {
      totalUsages,
      recentUsages,
    };
  } catch (error) {
    console.error("Error fetching coupon usage:", error);
    throw error;
  }
}
