"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Copy, Home } from "lucide-react";
import { toast } from "sonner";

interface PaymentSuccessClientProps {
  order: {
    id: string;
    orderNumber: string;
    total: number;
    subtotal: number;
    tax: number;
    shippingCost: number;
    paymentMethod?: string | null;
    paymentStatus?: string;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        name: string;
      } | null;
    }>;
    shippingAddress?: any;
  } | null;
  orderNumber?: string;
  paymentMethod?: string;
  bankInfo?: {
    bankName?: string;
    accountName?: string;
    iban?: string;
    branch?: string;
    accountNumber?: string;
  } | null;
  requiresAuth?: boolean;
}

export default function PaymentSuccessClient({
  order,
  orderNumber,
  paymentMethod = "iyzico",
  bankInfo,
  requiresAuth = false,
}: PaymentSuccessClientProps) {
  const router = useRouter();
  
  // Yönlendirme kontrolünü kaldırdık - parent component'te loading state var
  // Order fetch edilirken yönlendirme yapmıyoruz
  // Eğer order ve orderNumber yoksa, sayfa zaten loading state'de kalacak

  const finalOrderNumber = orderNumber || order?.orderNumber || "";
  const isEftHavale = paymentMethod === "eft-havale" || paymentMethod === "EFT/Havale";
  const isPaymentCompleted = order?.paymentStatus === "COMPLETED" || !isEftHavale;

  // Varsayılan banka bilgileri (eğer veritabanından gelmemişse)
  const defaultBankInfo = {
    bankName: "Ziraat Bankası",
    accountName: "AYC HOOKAH",
    iban: "TR00 0000 0000 0000 0000 0000 00",
    branch: "Şube Adı",
    accountNumber: "00000000",
  };

  const finalBankInfo = bankInfo
    ? {
        bankName: bankInfo.bankName || defaultBankInfo.bankName,
        accountName: bankInfo.accountName || defaultBankInfo.accountName,
        iban: bankInfo.iban || defaultBankInfo.iban,
        branch: bankInfo.branch || defaultBankInfo.branch,
        accountNumber: bankInfo.accountNumber || defaultBankInfo.accountNumber,
      }
    : defaultBankInfo;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} kopyalandı`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Başarı Mesajı */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-sans font-bold text-luxury-black mb-4">
            Siparişiniz Alındı!
          </h1>

          <p className="text-gray-600 font-sans mb-2">
            {isEftHavale
              ? "Siparişiniz başarıyla oluşturuldu. Lütfen ödeme bilgilerini kullanarak ödemenizi tamamlayın."
              : "Siparişiniz başarıyla alındı ve ödemeniz tamamlandı."}
          </p>
          {finalOrderNumber && (
            <p className="text-sm text-gray-500 font-sans">
              Sipariş No: <span className="font-semibold">{finalOrderNumber}</span>
            </p>
          )}
        </div>

        {/* Ödeme Yöntemine Göre Bilgiler */}
        {isEftHavale && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-sans font-bold text-luxury-black mb-4">
              EFT/Havale Ödeme Bilgileri
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-sans font-medium text-gray-700">Banka Adı:</span>
                <span className="font-sans font-semibold text-gray-900">
                  {finalBankInfo.bankName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans font-medium text-gray-700">Hesap Adı:</span>
                <span className="font-sans font-semibold text-gray-900">
                  {finalBankInfo.accountName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sans font-medium text-gray-700">IBAN:</span>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-semibold text-gray-900 font-mono">
                    {finalBankInfo.iban}
                  </span>
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
                  <span className="font-sans font-semibold text-gray-900">
                    {finalBankInfo.branch}
                  </span>
                </div>
              )}
              {finalBankInfo.accountNumber && (
                <div className="flex justify-between items-center">
                  <span className="font-sans font-medium text-gray-700">Hesap No:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-semibold text-gray-900">
                      {finalBankInfo.accountNumber}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(finalBankInfo.accountNumber, "Hesap Numarası")
                      }
                      className="p-2 text-gray-500 hover:text-luxury-goldLight transition-colors"
                      title="Kopyala"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Ödeme Tutarı */}
            {order && (
              <div className="mt-6 bg-luxury-goldLight/10 rounded-lg p-6">
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
                  <span className="font-sans font-semibold text-gray-900">
                    {order.shippingCost === 0
                      ? "Ücretsiz"
                      : `${order.shippingCost.toLocaleString("tr-TR")} ₺`}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-sans font-bold text-lg text-luxury-black">Toplam:</span>
                    <span className="font-sans font-bold text-2xl text-luxury-black">
                      {order.total.toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Açıklama */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-sans font-semibold text-blue-900 mb-2">Önemli Bilgiler:</h3>
              <ul className="space-y-2 text-sm font-sans text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Lütfen ödeme yaparken{" "}
                    <strong>açıklama kısmına sipariş numaranızı</strong> ({finalOrderNumber}) yazınız.
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
                    Ödeme yaptıktan sonra sipariş durumunuzu &quot;Hesabım&quot; sayfasından takip
                    edebilirsiniz.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Sipariş Detayları */}
        {order && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-sans font-bold text-luxury-black mb-4">
              Sipariş Detayları
            </h2>

            <div className="space-y-4">
              {/* Sipariş Özeti */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-sm font-sans font-semibold text-gray-700 mb-3">
                  Sipariş Özeti
                </h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-sm font-sans"
                    >
                      <span className="text-gray-700">
                        {item.product?.name || (item as any).productName || "Silinmiş Ürün"} x {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString("tr-TR")} ₺
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toplam */}
              {!isEftHavale && (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-700 font-sans">
                    <span>Ara Toplam</span>
                    <span>{order.subtotal.toLocaleString("tr-TR")} ₺</span>
                  </div>
                  <div className="flex justify-between text-gray-700 font-sans">
                    <span>KDV (%20)</span>
                    <span>{order.tax.toLocaleString("tr-TR")} ₺</span>
                  </div>
                  <div className="flex justify-between text-gray-700 font-sans">
                    <span>Kargo</span>
                    <span>
                      {order.shippingCost === 0
                        ? "Ücretsiz"
                        : `${order.shippingCost.toLocaleString("tr-TR")} ₺`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between text-xl font-sans font-bold text-luxury-black">
                    <span>Toplam</span>
                    <span>{order.total.toLocaleString("tr-TR")} ₺</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teslimat Adresi */}
        {order &&
          order.shippingAddress &&
          typeof order.shippingAddress === "object" && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-sans font-bold text-luxury-black mb-4">
                Teslimat Adresi
              </h2>
              <div className="text-gray-700 font-sans">
                <p className="font-semibold">
                  {(order.shippingAddress as any).firstName}{" "}
                  {(order.shippingAddress as any).lastName}
                </p>
                <p>{(order.shippingAddress as any).address}</p>
                <p>
                  {(order.shippingAddress as any).district} /{" "}
                  {(order.shippingAddress as any).city}
                </p>
                <p>{(order.shippingAddress as any).postalCode}</p>
                <p className="mt-2">Tel: {(order.shippingAddress as any).phone}</p>
              </div>
            </div>
          )}

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/hesabim"
            className="flex-1 px-6 py-4 bg-luxury-black text-white font-sans font-semibold rounded-xl hover:bg-luxury-darkGray transition-all text-center flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Hesabıma Git
          </Link>
          <Link
            href="/urunler"
            className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-sans font-semibold rounded-xl hover:bg-gray-50 transition-all text-center"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}

