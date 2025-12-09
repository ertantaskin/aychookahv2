"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/actions/admin/orders";
import { toast } from "sonner";
import Image from "next/image";

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
    user: {
      name: string | null;
      email: string;
    };
  };
}

const statusOptions = [
  { value: "PENDING", label: "Beklemede" },
  { value: "CONFIRMED", label: "Onaylandı" },
  { value: "PROCESSING", label: "Hazırlanıyor" },
  { value: "SHIPPED", label: "Kargoda" },
  { value: "DELIVERED", label: "Teslim Edildi" },
  { value: "CANCELLED", label: "İptal Edildi" },
];

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, status);
      toast.success("Sipariş durumu güncellendi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Durum güncellenirken bir hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-luxury-black">Sipariş Detayı</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Geri
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sipariş Bilgileri */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-luxury-black mb-4">Sipariş Bilgileri</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sipariş No:</span>
                <span className="font-semibold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tarih:</span>
                <span>{new Date(order.createdAt).toLocaleDateString("tr-TR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Durum:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || status === order.status}
                className="w-full mt-4 px-4 py-2 bg-luxury-black text-white rounded-lg hover:bg-luxury-darkGray transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Güncelleniyor..." : "Durumu Güncelle"}
              </button>
            </div>
          </div>

          {/* Sipariş Kalemleri */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-luxury-black mb-4">Sipariş Kalemleri</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {(item.product?.images?.[0]?.url || item.productImageUrl) ? (
                      <Image
                        src={item.product?.images[0]?.url || item.productImageUrl || ""}
                        alt={item.product?.name || item.productName || "Ürün"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        Görsel Yok
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-luxury-black">
                      {item.product?.name || item.productName || "Silinmiş Ürün"}
                    </h3>
                    <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-luxury-black">
                      {(item.price * item.quantity).toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teslimat Adresi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-luxury-black mb-4">Teslimat Adresi</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</strong>
              </p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.district} / {order.shippingAddress?.city}
              </p>
              <p>{order.shippingAddress?.postalCode}</p>
              <p>Tel: {order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>

        {/* Özet */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-luxury-black mb-4">Sipariş Özeti</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Müşteri:</span>
                <span className="font-medium">{order.user.name || order.user.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ara Toplam:</span>
                <span>{order.subtotal.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">KDV:</span>
                <span>{order.tax.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kargo:</span>
                <span>{order.shippingCost.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-luxury-black">
                <span>Toplam:</span>
                <span>{order.total.toLocaleString("tr-TR")} ₺</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Ödeme Durumu:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  order.paymentStatus === "COMPLETED" ? "bg-green-100 text-green-800" :
                  order.paymentStatus === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

