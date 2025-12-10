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
                not: null as any,
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
  const adminId = await checkAdmin();

  try {
    // Mevcut siparişi al
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!currentOrder) {
      throw new Error("Sipariş bulunamadı");
    }

    // Admin bilgilerini al
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { name: true, email: true },
    });

    // Siparişi güncelle
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    // Log kaydet (sadece değişiklik varsa)
    if (currentOrder.status !== status) {
      const statusLabels: Record<string, string> = {
        PENDING: "Beklemede",
        CONFIRMED: "Onaylandı",
        PROCESSING: "Hazırlanıyor",
        SHIPPED: "Kargoda",
        DELIVERED: "Teslim Edildi",
        CANCELLED: "İptal Edildi",
        REFUNDED: "İade Edildi",
      };

      await (prisma as any).orderLog.create({
        data: {
          orderId,
          action: "status_changed",
          field: "status",
          oldValue: currentOrder.status,
          newValue: status,
          description: `Sipariş durumu "${statusLabels[currentOrder.status] || currentOrder.status}" → "${statusLabels[status] || status}" olarak değiştirildi`,
          changedBy: adminId,
          changedByName: admin?.name || admin?.email || "Bilinmeyen",
        },
      });
    }

    revalidatePath("/admin/siparisler");
    revalidatePath(`/admin/siparisler/${orderId}`);
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
    // Önce siparişi al
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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

    if (!order) {
      return null;
    }

    // Logları ayrı olarak al
    const logs = await (prisma as any).orderLog.findMany({
      where: { orderId: order.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Order'a logs'u ekle
    return {
      ...order,
      logs: logs || [],
    } as any;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error("Sipariş yüklenirken bir hata oluştu");
  }
};

// Ödeme durumunu güncelle
export const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
  const adminId = await checkAdmin();

  try {
    // Mevcut siparişi al
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { paymentStatus: true },
    });

    if (!currentOrder) {
      throw new Error("Sipariş bulunamadı");
    }

    // Admin bilgilerini al
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { name: true, email: true },
    });

    // Siparişi güncelle
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: paymentStatus as any },
    });

    // Log kaydet (sadece değişiklik varsa)
    if (currentOrder.paymentStatus !== paymentStatus) {
      const paymentStatusLabels: Record<string, string> = {
        PENDING: "Beklemede",
        COMPLETED: "Tamamlandı",
        FAILED: "Başarısız",
        REFUNDED: "İade Edildi",
      };

      await (prisma as any).orderLog.create({
        data: {
          orderId,
          action: "payment_status_changed",
          field: "paymentStatus",
          oldValue: currentOrder.paymentStatus,
          newValue: paymentStatus,
          description: `Ödeme durumu "${paymentStatusLabels[currentOrder.paymentStatus] || currentOrder.paymentStatus}" → "${paymentStatusLabels[paymentStatus] || paymentStatus}" olarak değiştirildi`,
          changedBy: adminId,
          changedByName: admin?.name || admin?.email || "Bilinmeyen",
        },
      });
    }

    revalidatePath("/admin/siparisler");
    revalidatePath(`/admin/siparisler/${orderId}`);
    return { success: true, order };
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw new Error("Ödeme durumu güncellenirken bir hata oluştu");
  }
};

// Sipariş notlarını güncelle
export const updateOrderNotes = async (orderId: string, notes: string | null) => {
  const adminId = await checkAdmin();

  try {
    // Mevcut siparişi al
    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { notes: true },
    });

    if (!currentOrder) {
      throw new Error("Sipariş bulunamadı");
    }

    // Admin bilgilerini al
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { name: true, email: true },
    });

    // Siparişi güncelle
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { notes },
    });

    // Log kaydet (sadece değişiklik varsa)
    const oldNotes = currentOrder.notes || "";
    const newNotes = notes || "";
    if (oldNotes !== newNotes) {
      await (prisma as any).orderLog.create({
        data: {
          orderId,
          action: "notes_updated",
          field: "notes",
          oldValue: oldNotes || null,
          newValue: newNotes || null,
          description: newNotes
            ? oldNotes
              ? "Sipariş notları güncellendi"
              : "Sipariş notları eklendi"
            : "Sipariş notları silindi",
          changedBy: adminId,
          changedByName: admin?.name || admin?.email || "Bilinmeyen",
        },
      });
    }

    revalidatePath("/admin/siparisler");
    revalidatePath(`/admin/siparisler/${orderId}`);
    return { success: true, order };
  } catch (error) {
    console.error("Error updating order notes:", error);
    throw new Error("Sipariş notları güncellenirken bir hata oluştu");
  }
};

// Sipariş loglarını getir
export const getOrderLogs = async (orderId: string) => {
  await checkAdmin();

  try {
    const logs = await (prisma as any).orderLog.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    return logs;
  } catch (error) {
    console.error("Error fetching order logs:", error);
    throw new Error("Sipariş logları yüklenirken bir hata oluştu");
  }
};

