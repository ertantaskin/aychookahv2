"use client";

import { useEffect, useState } from "react";
import PaymentSuccessClient from "@/components/checkout/PaymentSuccessClient";

export default function PayTRSuccessPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("paytr");

  // URL parametrelerini client-side'da al
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("orderId");
    const number = urlParams.get("orderNumber");
    const method = urlParams.get("paymentMethod") || "paytr";

    setOrderId(id);
    setOrderNumber(number);
    setPaymentMethod(method);
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!orderId) {
        // orderId yoksa ama orderNumber varsa sayfayı göster
        setIsLoading(false);
        return;
      }

      try {
        // Order bilgilerini getir - credentials ile
        const response = await fetch(`/api/orders/${orderId}`, {
          credentials: "include", // Cookie'leri gönder
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        } else if (response.status === 401) {
          // Unauthorized - ama orderNumber varsa sayfayı göster
          console.warn("401 Unauthorized - but orderNumber might be available");
          // Order yoksa bile sayfayı göster (orderNumber varsa)
        } else if (response.status === 404) {
          // Order bulunamadı - ama orderNumber varsa sayfayı göster
          console.warn("404 Order not found - but orderNumber might be available");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        // Hata durumunda da sayfayı göster (orderNumber varsa)
      }

      // Ödeme başarılı olduğunda sepet temizlendi, header'ı güncelle
      window.dispatchEvent(new CustomEvent("cartUpdated"));

      setIsLoading(false);
    }

    if (orderId || orderNumber) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [orderId, orderNumber, paymentMethod]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <PaymentSuccessClient
      order={order}
      orderNumber={orderNumber || order?.orderNumber || ""}
      paymentMethod={paymentMethod}
      bankInfo={null}
      requiresAuth={false}
    />
  );
}

