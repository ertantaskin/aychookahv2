import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getOrders } from "@/lib/actions/orders";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Calendar, CreditCard } from "lucide-react";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function OrdersPage({ searchParams }: PageProps) {
  const session = await getSession();

  if (!session || session.user.role !== "user") {
    redirect("/giris?error=login_required");
  }

  const params = await searchParams;
  const page = parseInt((params.page as string) || "1", 10);
  const limit = 15;

  const ordersData = await getOrders(session.user.id, page, limit);
  const { orders, total, totalPages } = ordersData;

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
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Tamamlandı";
      case "PENDING":
        return "Beklemede";
      case "FAILED":
        return "Başarısız";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/hesabim"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold text-gray-900">Son Siparişlerim</h1>
          </div>
          {total > 0 && (
            <p className="text-sm sm:text-base font-sans text-gray-600 ml-8">
              Toplam {total} sipariş bulundu
            </p>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-sans font-semibold text-gray-900 mb-2">
              Henüz siparişiniz bulunmamaktadır
            </h2>
            <p className="text-sm font-sans text-gray-500 mb-6">
              İlk siparişinizi vermek için alışverişe başlayın
            </p>
            <Link
              href="/urunler"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-sans font-semibold text-white bg-luxury-goldLight hover:bg-luxury-gold rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              <Package className="w-4 h-4" />
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <>
            {/* Sipariş Kartları */}
            <div className="space-y-3 mb-6 sm:mb-8">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/hesabim/siparisler/${order.id}`}
                  className="block bg-white rounded-lg border border-gray-200 hover:border-luxury-goldLight hover:shadow-sm transition-all overflow-hidden"
                >
                  <div className="p-3 sm:p-4">
                    {/* Header - Tek satır, kompakt */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-sans font-semibold text-gray-900 truncate">
                            Sipariş #{order.orderNumber}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-sans text-gray-500">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-gray-900">{order.total.toLocaleString("tr-TR")} ₺</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex flex-col sm:flex-row gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-sans font-medium border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-sans font-medium border ${getPaymentStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-1" />
                      </div>
                    </div>

                    {/* Ürünler - Kompakt */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <div className="flex -space-x-1.5 flex-shrink-0">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={item.id}
                            className="w-8 h-8 rounded-md bg-gray-100 border border-white flex items-center justify-center overflow-hidden"
                            style={{ zIndex: 10 - idx }}
                          >
                            {item.product?.images?.[0] ? (
                              <Image
                                src={item.product.images[0].url}
                                alt={item.product.name || "Ürün"}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <Package className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-8 h-8 rounded-md bg-gray-100 border border-white flex items-center justify-center text-[10px] font-sans font-semibold text-gray-600">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1">
                          {order.items.slice(0, 2).map((item) => (
                            <span
                              key={item.id}
                              className="text-xs font-sans text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200"
                            >
                              {item.product?.name || (item as any).productName || "Silinmiş Ürün"} x{item.quantity}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-xs font-sans text-gray-500">
                              +{order.items.length - 2} ürün
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm font-sans text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {((page - 1) * limit) + 1}
                    </span>
                    {" - "}
                    <span className="font-semibold text-gray-900">
                      {Math.min(page * limit, total)}
                    </span>
                    {" / "}
                    <span className="font-semibold text-gray-900">{total}</span>
                    {" sipariş"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/hesabim/siparisler?page=${page - 1}`}
                      className={`px-4 py-2 text-sm font-sans font-medium rounded-lg transition-colors ${
                        page === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      Önceki
                    </Link>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (page <= 4) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 3) {
                          pageNum = totalPages - 6 + i;
                        } else {
                          pageNum = page - 3 + i;
                        }
                        return (
                          <Link
                            key={pageNum}
                            href={`/hesabim/siparisler?page=${pageNum}`}
                            className={`px-3 py-2 text-sm font-sans font-medium rounded-lg transition-colors min-w-[2.5rem] text-center ${
                              page === pageNum
                                ? "bg-luxury-goldLight text-luxury-black font-semibold"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                            }`}
                          >
                            {pageNum}
                          </Link>
                        );
                      })}
                    </div>
                    <Link
                      href={`/hesabim/siparisler?page=${page + 1}`}
                      className={`px-4 py-2 text-sm font-sans font-medium rounded-lg transition-colors ${
                        page >= totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      Sonraki
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
