"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createPayTRToken } from "@/lib/actions/payment-paytr";
import { toast } from "sonner";

function PayTRPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      if (!orderId) {
        setError("Sipariş ID bulunamadı");
        setLoading(false);
        return;
      }

      try {
        // Shipping address'i localStorage'dan al (checkout'tan geliyor)
        const savedAddress = localStorage.getItem("checkoutShippingAddress");
        let shippingAddress = {};
        
        if (savedAddress) {
          shippingAddress = JSON.parse(savedAddress);
        }

        // Gateway ID'yi al (eğer varsa)
        const gatewayId = searchParams.get("gatewayId") || undefined;

        const result = await createPayTRToken(
          shippingAddress,
          orderId,
          gatewayId
        );

        if (result.success && result.token) {
          setToken(result.token);
        } else {
          throw new Error("Token oluşturulamadı");
        }
      } catch (error: any) {
        console.error("PayTR initialization error:", error);
        setError(error.message || "Ödeme başlatılamadı");
        toast.error(error.message || "Ödeme başlatılamadı");
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [orderId, searchParams]);

  useEffect(() => {
    // iframeResizer script'ini yükle
    const script = document.createElement("script");
    script.src = "https://www.paytr.com/js/iframeResizer.min.js?v2";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(
        'script[src="https://www.paytr.com/js/iframeResizer.min.js?v2"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-luxury-goldLight border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-sans">Ödeme sayfası hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-sans font-bold text-gray-900 mb-2">
            Ödeme Başlatılamadı
          </h2>
          <p className="text-gray-600 font-sans mb-6">{error}</p>
          <button
            onClick={() => router.push("/sepet")}
            className="px-6 py-2 bg-luxury-goldLight text-luxury-black font-sans font-semibold rounded-lg hover:bg-luxury-gold transition-colors"
          >
            Sepete Dön
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-sans font-bold text-gray-900">
              Güvenli Ödeme
            </h1>
            <p className="text-sm text-gray-600 font-sans mt-1">
              Ödeme işleminizi tamamlamak için aşağıdaki formu doldurun
            </p>
          </div>
          <div className="p-4">
            <iframe
              id="paytriframe"
              src={`https://www.paytr.com/odeme/guvenli/${token}`}
              width="100%"
              height="1000"
              scrolling="no"
              style={{ border: "none", minHeight: "1000px" }}
              title="PayTR Ödeme Sayfası"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PayTRPage() {
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
      <PayTRPaymentPage />
    </Suspense>
  );
}

