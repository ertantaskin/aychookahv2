import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import DashboardStats from "@/components/admin/DashboardStats";

// Cache'i devre dışı bırak - her istekte yeniden oluştur
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/giris?error=admin_required");
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Tüm istatistikleri paralel olarak getir
  const [
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue,
    todayRevenue,
    todayOrders,
    thisMonthRevenue,
    thisMonthOrders,
    pendingOrders,
    processingOrders,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    // Toplam ürün
    prisma.product.count(),
    // Toplam sipariş
    prisma.order.count(),
    // Toplam kullanıcı
    prisma.user.count(),
    // Toplam gelir (tüm zamanlar)
    prisma.order.aggregate({
      where: { paymentStatus: "COMPLETED" },
      _sum: { total: true },
    }),
    // Bugünkü gelir
    prisma.order.aggregate({
      where: {
        paymentStatus: "COMPLETED",
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _sum: { total: true },
    }),
    // Bugünkü sipariş sayısı
    prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
    // Bu ayki gelir
    prisma.order.aggregate({
      where: {
        paymentStatus: "COMPLETED",
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: { total: true },
    }),
    // Bu ayki sipariş sayısı
    prisma.order.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    }),
    // Bekleyen siparişler
    prisma.order.count({
      where: { status: "PENDING" },
    }),
    // Hazırlanan siparişler
    prisma.order.count({
      where: { status: "PROCESSING" },
    }),
    // Düşük stoklu ürünler (stok < 10)
    prisma.product.count({
      where: {
        stock: {
          lt: 10,
        },
        isActive: true,
      },
    }),
    // Son siparişler
    prisma.order.findMany({
      take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    }),
  ]);

  const stats = {
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue: totalRevenue._sum.total || 0,
    todayRevenue: todayRevenue._sum.total || 0,
    todayOrders,
    thisMonthRevenue: thisMonthRevenue._sum.total || 0,
    thisMonthOrders,
    pendingOrders,
    processingOrders,
    lowStockProducts,
  };

  const formattedRecentOrders = recentOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.user.name || order.user.email,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
  }));

  return (
    <div className="p-3 sm:p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-sans font-bold text-gray-900 mb-1 sm:mb-2">Dashboard</h1>
          <p className="text-xs sm:text-sm font-sans text-gray-600">
            Mağaza genel bakış ve önemli metrikler
          </p>
        </div>

        <DashboardStats stats={stats} recentOrders={formattedRecentOrders} />
      </div>
    </div>
  );
}

