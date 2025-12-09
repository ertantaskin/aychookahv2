import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getOrders } from "@/lib/actions/orders";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await getSession();

  if (!session || session.user.role !== "user") {
    redirect("/giris?error=login_required");
  }

  const orders = await getOrders(session.user.id);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Beklemede";
      case "CONFIRMED":
        return "Onaylandı";
      case "PROCESSING":
        return "Hazırlanıyor";
      case "SHIPPED":
        return "Kargoda";
      case "DELIVERED":
        return "Teslim Edildi";
      case "CANCELLED":
        return "İptal Edildi";
      case "REFUNDED":
        return "İade Edildi";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/hesabim"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-sans font-semibold text-gray-900">Siparişlerim</h1>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4 font-sans">Henüz siparişiniz bulunmamaktadır.</p>
            <Link
              href="/urunler"
              className="inline-block px-6 py-2.5 text-sm font-sans font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-sans font-semibold text-gray-700">Sipariş No</th>
                    <th className="text-left py-4 px-6 text-sm font-sans font-semibold text-gray-700">Tarih</th>
                    <th className="text-left py-4 px-6 text-sm font-sans font-semibold text-gray-700">Tutar</th>
                    <th className="text-left py-4 px-6 text-sm font-sans font-semibold text-gray-700">Durum</th>
                    <th className="text-left py-4 px-6 text-sm font-sans font-semibold text-gray-700">Ödeme</th>
                    <th className="text-left py-4 px-6 text-sm font-sans font-semibold text-gray-700">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm font-sans font-semibold text-gray-900">{order.orderNumber}</td>
                      <td className="py-4 px-6 text-sm font-sans text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6 text-sm font-sans font-semibold text-gray-900">
                        {order.total.toLocaleString("tr-TR")} ₺
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus === "COMPLETED"
                            ? "Tamamlandı"
                            : order.paymentStatus === "PENDING"
                            ? "Beklemede"
                            : order.paymentStatus === "FAILED"
                            ? "Başarısız"
                            : order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          href={`/hesabim/siparisler/${order.id}`}
                          className="text-gray-600 hover:text-gray-900 text-sm font-sans font-medium"
                        >
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

