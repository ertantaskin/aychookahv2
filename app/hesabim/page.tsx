import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  DollarSign,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Edit3,
  ShoppingBag,
  MapPin,
  ShoppingCart,
  ChevronRight,
  Inbox,
  Calendar,
  Clock,
  Layers,
} from "lucide-react";
import LogoutButton from "@/components/account/LogoutButton";

export default async function AccountPage() {
  const session = await getSession();

  if (!session || session.user.role !== "user") {
    redirect("/giris?error=login_required");
  }

  // Kullanıcı bilgilerini getir
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: {
                    where: { isPrimary: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/giris");
  }

  // İstatistikler hesapla
  const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
  const completedOrders = user.orders.filter((o) => o.status === "DELIVERED").length;
  const lastOrderDate = user.orders.length > 0 ? user.orders[0].createdAt : null;
  const lastOrderAmount = user.orders.length > 0 ? user.orders[0].total : 0;
  const activeOrders = user.orders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING" || o.status === "SHIPPED").length;
  
  // Farklı ürün sayısı (unique products)
  const uniqueProducts = new Set();
  user.orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.productId) {
        uniqueProducts.add(item.productId);
      }
    });
  });
  const uniqueProductCount = uniqueProducts.size;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Beklemede";
      case "PROCESSING":
        return "Hazırlanıyor";
      case "SHIPPED":
        return "Kargoda";
      case "DELIVERED":
        return "Teslim Edildi";
      case "CANCELLED":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Ödeme Tamamlandı";
      case "PENDING":
        return "Ödeme Bekleniyor";
      case "FAILED":
        return "Ödeme Başarısız";
      default:
        return status;
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
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-sans font-semibold text-gray-900 mb-0.5">Hesabım</h1>
              <p className="text-sm font-sans text-gray-500">
                Hoş geldiniz, <span className="font-medium text-gray-700">{user.name || user.email}</span>
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* İstatistik Kartları - Küçük ve Minimal */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <div>
              <p className="text-[10px] font-sans font-medium text-gray-500 uppercase tracking-wide leading-none">
                Son Sipariş
              </p>
              <p className="text-xs font-sans font-semibold text-gray-900 leading-tight">
                {lastOrderDate
                  ? new Date(lastOrderDate).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                    })
                  : "Yok"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <div>
              <p className="text-[10px] font-sans font-medium text-gray-500 uppercase tracking-wide leading-none">
                Tamamlanan
              </p>
              <p className="text-xs font-sans font-semibold text-gray-900 leading-tight">
                {completedOrders} sipariş
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol Panel - Hesap Bilgileri ve Hızlı Erişim */}
          <div className="lg:col-span-1 space-y-6">
            {/* Hesap Bilgileri Kartı */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-base font-sans font-semibold text-gray-900">Hesap Bilgileri</h2>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-sans font-medium text-gray-500 uppercase tracking-wide">
                      Ad Soyad
                    </p>
                  </div>
                  <p className="text-sm font-sans font-medium text-gray-900">
                    {user.name || "Belirtilmemiş"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-sans font-medium text-gray-500 uppercase tracking-wide">
                      Email
                    </p>
                  </div>
                  <p className="text-sm font-sans font-medium text-gray-900 break-all">{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-sans font-medium text-gray-500 uppercase tracking-wide">
                        Telefon
                      </p>
                    </div>
                    <p className="text-sm font-sans font-medium text-gray-900">{user.phone}</p>
                  </div>
                )}
              </div>
              <div className="px-6 pb-6">
              <Link
                href="/hesabim/profil"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-sans font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                  <Edit3 className="w-4 h-4" />
                Profili Düzenle
              </Link>
              </div>
            </div>

            {/* Hızlı Erişim Kartı */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-base font-sans font-semibold text-gray-900">Hızlı Erişim</h2>
              </div>
              <div className="p-2">
                <Link
                  href="/hesabim/siparisler"
                  className="flex items-center justify-between px-4 py-3 text-sm font-sans font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5 text-gray-400" />
                    <span>Tüm Siparişlerim</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/hesabim/adresler"
                  className="flex items-center justify-between px-4 py-3 text-sm font-sans font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span>Adreslerim</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/sepet"
                  className="flex items-center justify-between px-4 py-3 text-sm font-sans font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-gray-400" />
                    <span>Sepetim</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Sağ Panel - Son Siparişler */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-sans font-semibold text-gray-900">Son Siparişlerim</h2>
                  <Link
                    href="/hesabim/siparisler"
                    className="text-sm font-sans font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Tümünü Gör →
                  </Link>
                </div>
              </div>

              {user.orders.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="font-sans text-gray-500 mb-1 text-base">Henüz siparişiniz bulunmamaktadır.</p>
                  <p className="font-sans text-gray-400 mb-6 text-sm">
                    İlk siparişinizi vermek için alışverişe başlayın
                  </p>
                  <Link
                    href="/urunler"
                    className="inline-block px-6 py-2.5 text-sm font-sans font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {user.orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/hesabim/siparisler/${order.id}`}
                      className="block p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-sans font-semibold text-gray-900 mb-1">
                            Sipariş #{order.orderNumber}
                          </p>
                          <p className="text-xs font-sans text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-sans font-semibold text-gray-900 mb-2">
                            {order.total.toLocaleString("tr-TR")} ₺
                          </p>
                          <div className="flex flex-col items-end gap-1.5">
                            <span
                              className={`inline-block px-2.5 py-1 rounded text-xs font-sans font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          <span
                              className={`inline-block px-2.5 py-1 rounded text-xs font-sans font-medium ${getPaymentStatusColor(
                                order.paymentStatus
                              )}`}
                          >
                              {getPaymentStatusLabel(order.paymentStatus)}
                          </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2 flex-shrink-0">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div
                              key={item.id}
                              className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden"
                              style={{ zIndex: 10 - idx }}
                            >
                              {item.product?.images?.[0] ? (
                                <Image
                                  src={item.product.images[0].url}
                                  alt={item.product.name || "Ürün"}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {order.items.slice(0, 2).map((item) => (
                              <span
                                key={item.id}
                                className="text-xs font-sans text-gray-600 bg-gray-50 px-2 py-0.5 rounded"
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
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                      </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

