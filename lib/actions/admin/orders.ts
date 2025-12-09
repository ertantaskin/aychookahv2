"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Admin kontrolü
const checkAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Yetkisiz erişim");
  }
  return session.user.id;
};

// Tüm siparişleri getir
export const getAllOrders = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  status?: string,
  paymentStatus?: string,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
) => {
  await checkAdmin();

  try {
    const skip = (page - 1) * limit;
    let where: any = {};

    // Arama filtresi - daha güvenli yaklaşım
    if (search && search.trim()) {
      const searchTerm = search.trim();
      
      // Önce sipariş numarasına göre eşleşen siparişleri bul
      const ordersByNumber = await prisma.order.findMany({
        where: {
          orderNumber: { contains: searchTerm, mode: "insensitive" },
        },
        select: { id: true },
      });

      // Kullanıcı adına göre eşleşen kullanıcıları bul
      const usersByName = await prisma.user.findMany({
        where: {
          name: { contains: searchTerm, mode: "insensitive" },
        },
        select: { id: true },
      });

      // Email'e göre eşleşen kullanıcıları bul
      const usersByEmail = await prisma.user.findMany({
        where: {
          email: { contains: searchTerm, mode: "insensitive" },
        },
        select: { id: true },
      });

      // Tüm eşleşen kullanıcı ID'lerini birleştir
      const matchingUserIds = [
        ...new Set([
          ...usersByName.map((u) => u.id),
          ...usersByEmail.map((u) => u.id),
        ]),
      ];

      // Bu kullanıcılara ait siparişleri bul
      const ordersByUser = matchingUserIds.length > 0
        ? await prisma.order.findMany({
            where: { userId: { in: matchingUserIds } },
            select: { id: true },
          })
        : [];

      // Tüm eşleşen sipariş ID'lerini birleştir
      const matchingOrderIds = [
        ...new Set([
          ...ordersByNumber.map((o) => o.id),
          ...ordersByUser.map((o) => o.id),
        ]),
      ];

      // Eğer eşleşme varsa ID'lere göre filtrele
      if (matchingOrderIds.length > 0) {
        where.id = { in: matchingOrderIds };
      } else {
        // Eşleşme yoksa boş sonuç döndür
        where.id = { in: [] };
      }
    }

    // Durum filtresi
    if (status) {
      where.status = status;
    }

    // Ödeme durumu filtresi
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    // Sıralama
    const orderBy: any = {};
    if (sortBy === "total") {
      orderBy.total = sortOrder;
    } else if (sortBy === "orderNumber") {
      orderBy.orderNumber = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          items: {
            where: {
              productId: {
                not: null,
              },
            },
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : undefined);
    
    // Daha detaylı hata mesajı
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Siparişler yüklenirken bir hata oluştu: ${errorMessage}`);
  }
};

// Sipariş durumunu güncelle
export const updateOrderStatus = async (orderId: string, status: string) => {
  await checkAdmin();

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    revalidatePath("/admin/siparisler");
    return { success: true, order };
  } catch (error) {
    console.error("Error updating order status:", error);
    throw new Error("Sipariş durumu güncellenirken bir hata oluştu");
  }
};

// Tek sipariş getir
export const getOrder = async (orderId: string) => {
  await checkAdmin();

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error("Sipariş yüklenirken bir hata oluştu");
  }
};

