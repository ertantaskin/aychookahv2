"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ShoppingCart, RefreshCw } from "lucide-react";

export default function PayTRFailedPage() {
  const router = useRouter();
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("errorCode");
    const message = urlParams.get("errorMessage");
    const id = urlParams.get("orderId");

    // URL encoded mesajı decode et
    const decodedMessage = message ? decodeURIComponent(message) : null;

    setErrorCode(code);
    setErrorMessage(decodedMessage);
    setOrderId(id);
  }, []);

  const getErrorMessage = () => {
    // errorMessage zaten decode edilmiş olmalı, ama yine de kontrol et
    if (errorMessage) {
      try {
        // Eğer hala encoded ise decode et
        return decodeURIComponent(errorMessage);
      } catch {
        // Decode edilemezse direkt döndür
        return errorMessage;
      }
    }
    
    if (errorCode) {
      // PayTR hata kodlarına göre açıklama
      const errorMessages: Record<string, string> = {
        // PayTR Genel Hatalar
        "1": "Ödeme işlemi başarısız oldu.",
        "2": "Kart bilgileri hatalı.",
        "3": "Kart limiti yetersiz.",
        "4": "İşlem zaman aşımına uğradı.",
        "5": "Banka hatası oluştu.",
        "6": "3D Secure doğrulaması başarısız.",
        "7": "Kart işleme kapalı.",
        "8": "Geçersiz kart bilgisi.",
        "9": "İşlem reddedildi.",
        "10": "Banka geçici olarak hizmet dışı.",
        // PayTR Özel Hatalar
        "CARD_NOT_FOUND": "Kart bulunamadı.",
        "INSUFFICIENT_FUNDS": "Kart limiti yetersiz.",
        "INVALID_CARD": "Geçersiz kart bilgisi.",
        "EXPIRED_CARD": "Kartın son kullanma tarihi geçmiş.",
        "3DS_FAILED": "3D Secure doğrulaması başarısız.",
        "BANK_ERROR": "Banka hatası oluştu.",
        "TIMEOUT": "İşlem zaman aşımına uğradı.",
        "failure": "Ödeme işlemi başarısız oldu.",
      };
      
      // Hata kodunu normalize et (büyük/küçük harf duyarsız)
      const normalizedCode = errorCode.toUpperCase();
      
      return errorMessages[normalizedCode] || errorMessages[errorCode] || `Hata kodu: ${errorCode}`;
    }
    
    return "Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin.";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hata Mesajı */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
          {/* Hata İkonu */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Başlık */}
          <h1 className="text-3xl font-sans font-bold text-luxury-black mb-4">
            Ödeme Tamamlanamadı
          </h1>

          <p className="text-gray-600 font-sans mb-6">
            Ödeme işleminiz tamamlanamadı. Lütfen aşağıdaki bilgileri kontrol edin.
          </p>

          {/* Hata Mesajı */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
            <p className="text-red-800 font-sans font-medium mb-2 text-lg">
              {getErrorMessage()}
            </p>
            {errorCode && (
              <p className="text-sm text-red-600 font-sans mt-2">
                Hata Kodu: <span className="font-mono font-semibold">{errorCode}</span>
              </p>
            )}
          </div>
        </div>

        {/* Açıklama ve Öneriler */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-sans font-bold text-luxury-black mb-4 text-center">
            Ne Yapabilirsiniz?
          </h2>
          <ul className="text-left max-w-2xl mx-auto space-y-3">
            <li className="flex items-start font-sans">
              <span className="text-red-600 mr-3 mt-1">•</span>
              <span className="text-gray-700">Kart bilgilerinizi kontrol edin (kart numarası, CVV, son kullanma tarihi)</span>
            </li>
            <li className="flex items-start font-sans">
              <span className="text-red-600 mr-3 mt-1">•</span>
              <span className="text-gray-700">Kart limitinizin yeterli olduğundan emin olun</span>
            </li>
            <li className="flex items-start font-sans">
              <span className="text-red-600 mr-3 mt-1">•</span>
              <span className="text-gray-700">Farklı bir kart ile tekrar deneyin</span>
            </li>
            <li className="flex items-start font-sans">
              <span className="text-red-600 mr-3 mt-1">•</span>
              <span className="text-gray-700">Bankanızla iletişime geçerek kartınızın durumunu kontrol edin</span>
            </li>
          </ul>
        </div>

        {/* Butonlar */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sepet"
              className="inline-flex items-center justify-center px-8 py-3 bg-luxury-gold text-white rounded-lg hover:bg-luxury-goldLight transition-colors font-sans font-medium shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Sepete Dön
            </Link>
            
            {orderId && (
              <button
                onClick={() => router.push(`/odeme?retry=${orderId}`)}
                className="inline-flex items-center justify-center px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-sans font-medium shadow-md hover:shadow-lg"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Tekrar Dene
              </button>
            )}
          </div>

          {/* Yardım */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500 font-sans">
              Sorun devam ederse, lütfen{" "}
              <Link href="/iletisim" className="text-luxury-gold hover:underline font-medium">
                müşteri hizmetlerimiz
              </Link>
              {" "}ile iletişime geçin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

