"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Copy, Home } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface EftHavaleClientProps {
  order: {
    id: string;
    orderNumber: string;
    total: number;
    subtotal: number;
    tax: number;
    shippingCost: number;
    couponCode?: string | null;
    discountAmount?: number;
    couponDiscountType?: string | null;
  };
  orderNumber: string;
  bankInfo?: {
    bankName?: string;
    accountName?: string;
    iban?: string;
    branch?: string;
    accountNumber?: string;
  };
}

export default function EftHavaleClient({ order, orderNumber, bankInfo }: EftHavaleClientProps) {
  const router = useRouter();
  
  // Ücretsiz kargo kuponu kontrolü ve orijinal kargo ücreti hesaplama
  const hasFreeShippingCoupon = order?.couponDiscountType === "FREE_SHIPPING" && order?.shippingCost === 0;
  const [originalShippingCost, setOriginalShippingCost] = useState(0);
  
  useEffect(() => {
    if (hasFreeShippingCoupon && order) {
      // Sipariş item'larından toplamı hesapla (kupon öncesi)
      const orderSubtotal = order.subtotal + (order.discountAmount || 0);
      
      // Orijinal kargo ücretini hesapla (API'den çek)
      const fetchOriginalShipping = async () => {
        try {
          const response = await fetch("/api/shipping/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subtotal: orderSubtotal }),
          });
          if (response.ok) {
            const data = await response.json();
            setOriginalShippingCost(data.shippingCost || 0);
          }
        } catch (error) {
          console.error("Error fetching original shipping cost:", error);
        }
      };
      
      fetchOriginalShipping();
    }
  }, [hasFreeShippingCoupon, order]);

  // Varsayılan banka bilgileri (eğer veritabanından gelmemişse)
  const defaultBankInfo = {
    bankName: "Ziraat Bankası",
    accountName: "AYC HOOKAH",
    iban: "TR00 0000 0000 0000 0000 0000 00",
    branch: "Şube Adı",
    accountNumber: "00000000",
  };

  const finalBankInfo = {
    bankName: bankInfo?.bankName || defaultBankInfo.bankName,
    accountName: bankInfo?.accountName || defaultBankInfo.accountName,
    iban: bankInfo?.iban || defaultBankInfo.iban,
    branch: bankInfo?.branch || defaultBankInfo.branch,
    accountNumber: bankInfo?.accountNumber || defaultBankInfo.accountNumber,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopyalandı`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Başarı Mesajı */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-sans font-bold text-luxury-black mb-2">
              Siparişiniz Alındı!
            </h1>
            <p className="text-gray-600 font-sans">
              Sipariş numaranız: <span className="font-semibold text-luxury-black">{orderNumber}</span>
            </p>
          </div>

          {/* Ödeme Bilgileri */}
          <div className="mb-8">
            <h2 className="text-xl font-sans font-bold text-luxury-black mb-4">
              EFT/Havale Ödeme Bilgileri
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-sans font-medium text-gray-700">Banka Adı:</span>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-semibold text-gray-900">{finalBankInfo.bankName}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans font-medium text-gray-700">Hesap Adı:</span>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-semibold text-gray-900">{finalBankInfo.accountName}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans font-medium text-gray-700">IBAN:</span>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-semibold text-gray-900 font-mono">{finalBankInfo.iban}</span>
                  <button
                    onClick={() => copyToClipboard(finalBankInfo.iban, "IBAN")}
                    className="p-2 text-gray-500 hover:text-luxury-goldLight transition-colors"
                    title="Kopyala"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {finalBankInfo.branch && (
                <div className="flex justify-between items-center">
                  <span className="font-sans font-medium text-gray-700">Şube:</span>
                  <span className="font-sans font-semibold text-gray-900">{finalBankInfo.branch}</span>
                </div>
              )}
              {finalBankInfo.accountNumber && (
                <div className="flex justify-between items-center">
                  <span className="font-sans font-medium text-gray-700">Hesap No:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-semibold text-gray-900">{finalBankInfo.accountNumber}</span>
                    <button
                      onClick={() => copyToClipboard(finalBankInfo.accountNumber, "Hesap Numarası")}
                      className="p-2 text-gray-500 hover:text-luxury-goldLight transition-colors"
                      title="Kopyala"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ödeme Tutarı */}
          <div className="mb-8">
            <h2 className="text-xl font-sans font-bold text-luxury-black mb-4">
              Ödeme Tutarı
            </h2>
            <div className="bg-luxury-goldLight/10 rounded-lg p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-gray-700">Ara Toplam:</span>
                <span className="font-sans font-semibold text-gray-900">
                  {order.subtotal.toLocaleString("tr-TR")} ₺
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-gray-700">KDV (%20):</span>
                <span className="font-sans font-semibold text-gray-900">
                  {order.tax.toLocaleString("tr-TR")} ₺
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans text-gray-700">Kargo:</span>
                {hasFreeShippingCoupon && originalShippingCost > 0 ? (
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-sans text-gray-500 line-through">
                      {originalShippingCost.toLocaleString("tr-TR")} ₺
                    </span>
                    <span className="text-sm font-sans font-semibold text-green-700 whitespace-nowrap">
                      Bedava
                    </span>
                  </div>
                ) : (
                <span className="font-sans font-semibold text-gray-900">
                  {order.shippingCost === 0 ? "Ücretsiz" : `${order.shippingCost.toLocaleString("tr-TR")} ₺`}
                </span>
                )}
              </div>
              {order.couponCode && order.discountAmount && order.discountAmount > 0 && order.couponDiscountType !== "FREE_SHIPPING" && (
                <div className="flex justify-between items-center mb-2">
                  <span className="font-sans text-green-700">İndirim ({order.couponCode}):</span>
                  <span className="font-sans font-semibold text-green-600">
                    -{order.discountAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-sans font-bold text-lg text-luxury-black">Toplam:</span>
                  <span className="font-sans font-bold text-2xl text-luxury-black">
                    {order.total.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-sans font-semibold text-blue-900 mb-2">Önemli Bilgiler:</h3>
            <ul className="space-y-2 text-sm font-sans text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Lütfen ödeme yaparken <strong>açıklama kısmına sipariş numaranızı</strong> ({orderNumber}) yazınız.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Ödemeniz onaylandıktan sonra siparişiniz hazırlanmaya başlayacaktır.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Ödeme onayı genellikle 1-2 iş günü içinde yapılmaktadır.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Ödeme yaptıktan sonra sipariş durumunuzu &quot;Hesabım&quot; sayfasından takip edebilirsiniz.
                </span>
              </li>
            </ul>
          </div>

          {/* Butonlar */}
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/hesabim")}
              className="flex-1 px-6 py-3 font-sans bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Hesabıma Git
            </button>
            <button
              onClick={() => router.push("/")}
              className="flex-1 px-6 py-3 font-sans bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

