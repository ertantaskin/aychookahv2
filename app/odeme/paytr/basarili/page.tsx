"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/actions/orders";

function PayTRSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        router.push("/sepet");
        return;
      }

      try {
        const orderData = await getOrder(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-luxury-goldLight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-sans">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-sans font-bold text-gray-900 mb-4">
            Ödeme Başarılı!
          </h1>

          <p className="text-gray-600 font-sans mb-8">
            Ödemeniz başarıyla tamamlandı. Siparişiniz en kısa sürede hazırlanacaktır.
          </p>

          {order && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-lg font-sans font-semibold text-gray-900 mb-4">
                Sipariş Detayları
              </h2>
              <div className="space-y-2 text-sm font-sans">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sipariş No:</span>
                  <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Tutar:</span>
                  <span className="font-semibold text-gray-900">
                    {order.total.toFixed(2)} ₺
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ödeme Durumu:</span>
                  <span className="font-semibold text-green-600">
                    {order.paymentStatus === "COMPLETED" ? "Ödendi" : "Beklemede"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/hesabim/siparisler"
              className="px-6 py-3 bg-luxury-goldLight text-luxury-black font-sans font-semibold rounded-lg hover:bg-luxury-gold transition-colors"
            >
              Siparişlerim
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-900 font-sans font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PayTRSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-luxury-goldLight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-sans">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <PayTRSuccessPage />
    </Suspense>
  );
}

