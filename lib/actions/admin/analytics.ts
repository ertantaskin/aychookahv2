"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, format } from "date-fns";

// Admin kontrolü
const checkAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Yetkisiz erişim");
  }
};

// Tarih aralığına göre analiz verileri
export const getAnalyticsData = async (startDate: Date, endDate: Date) => {
  await checkAdmin();

  const where = {
    createdAt: {
      gte: startOfDay(startDate),
      lte: endOfDay(endDate),
    },
  };

  const [
    totalRevenue,
    refundedRevenue,
    cancelledRevenue,
    totalOrders,
    completedOrders,
    pendingOrders,
    processingOrders,
    refundedOrders,
    cancelledOrders,
    orderStatusCounts,
    paymentStatusCounts,
  ] = await Promise.all([
    // Toplam gelir (COMPLETED ödemeler)
    prisma.order.aggregate({
      where: {
        ...where,
        paymentStatus: "COMPLETED",
      },
      _sum: { total: true },
    }),
    // İade tutarı
    prisma.order.aggregate({
      where: {
        ...where,
        OR: [
          { status: "REFUNDED" },
          { paymentStatus: "REFUNDED" },
        ],
      },
      _sum: { total: true },
    }),
    // İptal tutarı
    prisma.order.aggregate({
      where: {
        ...where,
        status: "CANCELLED",
      },
      _sum: { total: true },
    }),
    // Toplam sipariş sayısı
    prisma.order.count({ where }),
    // Tamamlanan siparişler
    prisma.order.count({
      where: {
        ...where,
        status: "DELIVERED",
      },
    }),
    // Bekleyen siparişler
    prisma.order.count({
      where: {
        ...where,
        status: "PENDING",
      },
    }),
    // Hazırlanan siparişler
    prisma.order.count({
      where: {
        ...where,
        status: "PROCESSING",
      },
    }),
    // İade edilen siparişler
    prisma.order.count({
      where: {
        ...where,
        OR: [
          { status: "REFUNDED" },
          { paymentStatus: "REFUNDED" },
        ],
      },
    }),
    // İptal edilen siparişler
    prisma.order.count({
      where: {
        ...where,
        status: "CANCELLED",
      },
    }),
    // Sipariş durumları dağılımı
    prisma.order.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
    }),
    // Ödeme durumları dağılımı
    prisma.order.groupBy({
      by: ["paymentStatus"],
      where,
      _count: { paymentStatus: true },
    }),
  ]);

  const totalRevenueAmount = totalRevenue._sum.total || 0;
  const refundedAmount = refundedRevenue._sum.total || 0;
  const cancelledAmount = cancelledRevenue._sum.total || 0;
  const netRevenue = totalRevenueAmount - refundedAmount;
  const averageOrderValue = completedOrders > 0 ? totalRevenueAmount / completedOrders : 0;

  return {
    totalRevenue: totalRevenueAmount,
    netRevenue,
    refundedAmount,
    cancelledAmount,
    totalOrders,
    completedOrders,
    pendingOrders,
    processingOrders,
    refundedOrders,
    cancelledOrders,
    averageOrderValue,
    orderStatusDistribution: orderStatusCounts,
    paymentStatusDistribution: paymentStatusCounts,
  };
};

// Satış trendi (günlük/haftalık/aylık)
export const getSalesTrend = async (startDate: Date, endDate: Date, period: "day" | "week" | "month" = "day") => {
  await checkAdmin();

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
      paymentStatus: "COMPLETED",
    },
    select: {
      createdAt: true,
      total: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Tarih aralığını oluştur
  const dataMap = new Map<string, { revenue: number; orders: number }>();
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    let key: string;
    if (period === "day") {
      key = format(currentDate, "yyyy-MM-dd");
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    } else if (period === "week") {
      const weekStart = startOfWeek(currentDate);
      key = format(weekStart, "yyyy-MM-dd");
      currentDate = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else {
      const monthStart = startOfMonth(currentDate);
      key = format(monthStart, "yyyy-MM");
      currentDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
    }
    dataMap.set(key, { revenue: 0, orders: 0 });
  }

  // Siparişleri grupla
  orders.forEach((order) => {
    let key: string;
    if (period === "day") {
      key = format(order.createdAt, "yyyy-MM-dd");
    } else if (period === "week") {
      const weekStart = startOfWeek(order.createdAt);
      key = format(weekStart, "yyyy-MM-dd");
    } else {
      const monthStart = startOfMonth(order.createdAt);
      key = format(monthStart, "yyyy-MM");
    }

    const existing = dataMap.get(key);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    }
  });

  // Array'e dönüştür ve formatla
  const result = Array.from(dataMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return result;
};

// Sipariş istatistikleri
export const getOrderStats = async (startDate: Date, endDate: Date) => {
  await checkAdmin();

  const where = {
    createdAt: {
      gte: startOfDay(startDate),
      lte: endOfDay(endDate),
    },
  };

  const stats = await prisma.order.groupBy({
    by: ["status"],
    where,
    _count: { status: true },
    _sum: { total: true },
  });

  return stats.map((stat) => ({
    status: stat.status,
    count: stat._count.status,
    total: stat._sum.total || 0,
  }));
};

// Gelir istatistikleri
export const getRevenueStats = async (startDate: Date, endDate: Date) => {
  await checkAdmin();

  const where = {
    createdAt: {
      gte: startOfDay(startDate),
      lte: endOfDay(endDate),
    },
  };

  const [total, refunded, cancelled, completed] = await Promise.all([
    prisma.order.aggregate({
      where: {
        ...where,
        paymentStatus: "COMPLETED",
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.order.aggregate({
      where: {
        ...where,
        OR: [
          { status: "REFUNDED" },
          { paymentStatus: "REFUNDED" },
        ],
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.order.aggregate({
      where: {
        ...where,
        status: "CANCELLED",
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.order.aggregate({
      where: {
        ...where,
        status: "DELIVERED",
        paymentStatus: "COMPLETED",
      },
      _sum: { total: true },
      _count: { id: true },
    }),
  ]);

  return {
    total: total._sum.total || 0,
    refunded: refunded._sum.total || 0,
    cancelled: cancelled._sum.total || 0,
    net: (total._sum.total || 0) - (refunded._sum.total || 0),
    completedCount: completed._count.id || 0,
    refundedCount: refunded._count.id || 0,
    cancelledCount: cancelled._count.id || 0,
  };
};

// Sipariş durumları dağılımı
export const getOrderStatusDistribution = async (startDate: Date, endDate: Date) => {
  await checkAdmin();

  const where = {
    createdAt: {
      gte: startOfDay(startDate),
      lte: endOfDay(endDate),
    },
  };

  const distribution = await prisma.order.groupBy({
    by: ["status"],
    where,
    _count: { status: true },
  });

  const total = distribution.reduce((sum, item) => sum + item._count.status, 0);

  return distribution.map((item) => ({
    status: item.status,
    count: item._count.status,
    percentage: total > 0 ? (item._count.status / total) * 100 : 0,
  }));
};

// Ödeme durumları dağılımı
export const getPaymentStatusDistribution = async (startDate: Date, endDate: Date) => {
  await checkAdmin();

  const where = {
    createdAt: {
      gte: startOfDay(startDate),
      lte: endOfDay(endDate),
    },
  };

  const distribution = await prisma.order.groupBy({
    by: ["paymentStatus"],
    where,
    _count: { paymentStatus: true },
  });

  const total = distribution.reduce((sum, item) => sum + item._count.paymentStatus, 0);

  return distribution.map((item) => ({
    status: item.paymentStatus,
    count: item._count.paymentStatus,
    percentage: total > 0 ? (item._count.paymentStatus / total) * 100 : 0,
  }));
};

// Ürün bazlı satış verileri
export const getProductSales = async (startDate: Date, endDate: Date) => {
  await checkAdmin();

  // Tarih aralığına göre ve COMPLETED payment status'lü order'ları al
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
        paymentStatus: "COMPLETED",
        // İptal edilmemiş siparişler
        status: {
          not: "CANCELLED",
        },
      },
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
      order: true,
    },
  });

  // Ürün bazlı gruplama
  const productMap = new Map<
    string,
    {
      productId: string | null;
      productName: string;
      categoryName: string;
      totalQuantity: number;
      totalRevenue: number;
    }
  >();

  orderItems.forEach((item) => {
    const productId = item.productId || "unknown";
    const productName = item.product?.name || (item as any).productName || "Bilinmeyen Ürün";
    const categoryName = item.product?.category?.name || "Kategori Yok";

    const existing = productMap.get(productId);
    if (existing) {
      existing.totalQuantity += item.quantity;
      existing.totalRevenue += item.price * item.quantity;
    } else {
      productMap.set(productId, {
        productId: item.productId,
        productName,
        categoryName,
        totalQuantity: item.quantity,
        totalRevenue: item.price * item.quantity,
      });
    }
  });

  // Array'e dönüştür ve net satış tutarına göre sırala
  const result = Array.from(productMap.values())
    .map((item) => ({
      productId: item.productId,
      productName: item.productName,
      categoryName: item.categoryName,
      totalQuantity: item.totalQuantity,
      netRevenue: item.totalRevenue,
    }))
    .sort((a, b) => b.netRevenue - a.netRevenue);

  return result;
};

// Son siparişler (filtreye göre)
export const getRecentOrders = async (startDate: Date, endDate: Date, limit: number = 10) => {
  await checkAdmin();

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          quantity: true,
        },
      },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.user.name || order.user.email,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));
};

// Kategori bazlı satışlar
export const getCategorySales = async (startDate: Date, endDate: Date) => {
  await checkAdmin();

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
        paymentStatus: "COMPLETED",
        status: {
          not: "CANCELLED",
        },
      },
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  const categoryMap = new Map<
    string,
    {
      categoryId: string;
      categoryName: string;
      totalQuantity: number;
      totalRevenue: number;
      orderCount: number;
    }
  >();

  const processedOrders = new Set<string>();

  orderItems.forEach((item) => {
    const categoryName = item.product?.category?.name || "Kategori Yok";
    const categoryId = item.product?.category?.id || "unknown";

    const existing = categoryMap.get(categoryId);
    if (existing) {
      existing.totalQuantity += item.quantity;
      existing.totalRevenue += item.price * item.quantity;
      if (!processedOrders.has(item.orderId)) {
        existing.orderCount += 1;
        processedOrders.add(item.orderId);
      }
    } else {
      categoryMap.set(categoryId, {
        categoryId,
        categoryName,
        totalQuantity: item.quantity,
        totalRevenue: item.price * item.quantity,
        orderCount: 1,
      });
      processedOrders.add(item.orderId);
    }
  });

  const result = Array.from(categoryMap.values())
    .map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      totalQuantity: item.totalQuantity,
      totalRevenue: item.totalRevenue,
      orderCount: item.orderCount,
      averageOrderValue: item.orderCount > 0 ? item.totalRevenue / item.orderCount : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return result;
};

// Müşteri istatistikleri
export const getCustomerStats = async (startDate: Date, endDate: Date) => {
  await checkAdmin();

  // Tüm zamanlar için müşteri sayısı
  const totalCustomers = await prisma.user.count({
    where: {
      role: "user",
    },
  });

  // Seçilen tarih aralığında sipariş veren müşteriler
  const customersWithOrders = await prisma.user.findMany({
    where: {
      role: "user",
      orders: {
        some: {
          createdAt: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate),
          },
        },
      },
    },
    include: {
      orders: {
        where: {
          createdAt: {
            gte: startOfDay(startDate),
            lte: endOfDay(endDate),
          },
        },
        select: {
          total: true,
          paymentStatus: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  // Yeni müşteri sayısı (ilk siparişi bu aralıkta olanlar)
  const newCustomerCount = customersWithOrders.filter((user) => {
    const firstOrder = user.orders[0];
    if (!firstOrder) return false;
    // Bu kullanıcının tüm zamanlardaki ilk siparişini kontrol et
    return (
      firstOrder.createdAt >= startOfDay(startDate) &&
      firstOrder.createdAt <= endOfDay(endDate)
    );
  }).length;

  // Tekrar eden müşteriler
  const returningCustomerCount = customersWithOrders.length - newCustomerCount;

  // En çok harcama yapan müşteriler
  const topCustomers = customersWithOrders
    .map((customer) => {
      const completedOrders = customer.orders.filter((o) => o.paymentStatus === "COMPLETED");
      const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
      return {
        customerId: customer.id,
        customerName: customer.name || customer.email,
        email: customer.email,
        orderCount: completedOrders.length,
        totalSpent,
      };
    })
    .filter((c) => c.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10); // İlk 10 müşteri

  return {
    totalCustomers,
    newCustomerCount,
    returningCustomerCount,
    topCustomers,
  };
};

// Ödeme yöntemleri dağılımı
export const getPaymentMethodDistribution = async (startDate: Date, endDate: Date) => {
  await checkAdmin();

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
      paymentStatus: "COMPLETED",
    },
    select: {
      paymentMethod: true,
      total: true,
    },
  });

  const methodMap = new Map<
    string,
    {
      method: string;
      count: number;
      totalRevenue: number;
    }
  >();

  orders.forEach((order) => {
    const method = order.paymentMethod || "Bilinmeyen";
    const existing = methodMap.get(method);
    if (existing) {
      existing.count += 1;
      existing.totalRevenue += order.total;
    } else {
      methodMap.set(method, {
        method,
        count: 1,
        totalRevenue: order.total,
      });
    }
  });

  const total = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const result = Array.from(methodMap.values())
    .map((item) => ({
      method: item.method,
      count: item.count,
      totalRevenue: item.totalRevenue,
      percentage: total > 0 ? (item.count / total) * 100 : 0,
      revenuePercentage: totalRevenue > 0 ? (item.totalRevenue / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return result;
};
