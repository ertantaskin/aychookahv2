import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";

// Cache'i devre dışı bırak - her istekte yeniden oluştur
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/giris?error=admin_required");
  }

  // İstatistikleri getir
  const [totalProducts, totalOrders, totalUsers, totalRevenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { paymentStatus: "COMPLETED" },
      _sum: { total: true },
    }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-sans font-semibold text-gray-900 mb-8">Dashboard</h1>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans text-gray-600 mb-1">Toplam Ürün</p>
                <p className="text-3xl font-sans font-semibold text-gray-900">{totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans text-gray-600 mb-1">Toplam Sipariş</p>
                <p className="text-3xl font-sans font-semibold text-gray-900">{totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans text-gray-600 mb-1">Toplam Kullanıcı</p>
                <p className="text-3xl font-sans font-semibold text-gray-900">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans text-gray-600 mb-1">Toplam Gelir</p>
                <p className="text-3xl font-sans font-semibold text-gray-900">
                  {totalRevenue._sum.total?.toLocaleString("tr-TR") || "0"} ₺
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Son Siparişler */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-sans font-semibold text-gray-900 mb-4">Son Siparişler</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                    Sipariş No
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-sans text-gray-900">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-sm font-sans text-gray-900">
                      {order.user.name || order.user.email}
                    </td>
                    <td className="py-3 px-4 text-sm font-sans font-medium text-gray-900">
                      {order.total.toLocaleString("tr-TR")} ₺
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-sans text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

