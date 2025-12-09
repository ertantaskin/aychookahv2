"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface OrderDetailClientProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    subtotal: number;
    shippingCost: number;
    tax: number;
    paymentStatus: string;
    paymentMethod: string | null;
    shippingAddress: any;
    createdAt: Date;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      productName: string | null;
      productImageUrl: string | null;
      product: {
        id: string;
        name: string;
        images: Array<{ url: string }>;
      } | null;
    }>;
  };
}

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

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "Tamamlandı";
    case "PENDING":
      return "Beklemede";
    case "FAILED":
      return "Başarısız";
    case "REFUNDED":
      return "İade Edildi";
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

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/hesabim/siparisler"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-sans font-semibold text-gray-900">Sipariş Detayı</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Sipariş Bilgileri */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-base font-sans font-semibold text-gray-900 mb-4">Sipariş Bilgileri</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-sans text-gray-600">Sipariş No:</span>
                  <span className="text-sm font-sans font-semibold text-gray-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-sans text-gray-600">Tarih:</span>
                  <span className="text-sm font-sans text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-sans text-gray-600">Durum:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                {order.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-sm font-sans text-gray-600">Ödeme Yöntemi:</span>
                    <span className="text-sm font-sans font-semibold text-gray-900">{order.paymentMethod}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Sipariş Kalemleri */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-base font-sans font-semibold text-gray-900 mb-4">Sipariş Kalemleri</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {(item.product?.images?.[0]?.url || item.productImageUrl) ? (
                        <Image
                          src={item.product?.images?.[0]?.url || item.productImageUrl || ""}
                          alt={item.product?.name || item.productName || "Ürün"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-sans">
                          Görsel Yok
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sans font-semibold text-gray-900 truncate">
                        {item.product?.name || item.productName || "Silinmiş Ürün"}
                      </h3>
                      <p className="text-sm font-sans text-gray-600">Adet: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-sans font-semibold text-gray-900">
                        {(item.price * item.quantity).toLocaleString("tr-TR")} ₺
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teslimat Adresi */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-base font-sans font-semibold text-gray-900 mb-4">Teslimat Adresi</h2>
              <div className="space-y-2 text-gray-700 font-sans">
                <p>
                  <strong>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</strong>
                </p>
                <p>{order.shippingAddress?.address}</p>
                <p>
                  {order.shippingAddress?.district} / {order.shippingAddress?.city}
                </p>
                <p>{order.shippingAddress?.postalCode}</p>
                {order.shippingAddress?.phone && <p>Tel: {order.shippingAddress.phone}</p>}
              </div>
            </div>
          </div>

          {/* Özet */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <h2 className="text-base font-sans font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="font-sans text-gray-600">Ara Toplam:</span>
                  <span className="font-sans text-gray-900">{order.subtotal.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-sans text-gray-600">KDV:</span>
                  <span className="font-sans text-gray-900">{order.tax.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-sans text-gray-600">Kargo:</span>
                  <span className="font-sans text-gray-900">{order.shippingCost.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-sans font-semibold text-gray-900">
                  <span>Toplam:</span>
                  <span>{order.total.toLocaleString("tr-TR")} ₺</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans text-gray-600">Ödeme Durumu:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-sans font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

