"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ShoppingCart, RefreshCw } from "lucide-react";

export default function PaymentFailedPage() {
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
      // iyzico hata kodlarına göre açıklama
      const errorMessages: Record<string, string> = {
        // Genel Hatalar
        "5101": "Kartınızın limiti yetersiz.",
        "5102": "Kartınız bulunamadı veya geçersiz.",
        "5103": "Kartınızın CVV kodu hatalı.",
        "5104": "Kartınızın son kullanma tarihi geçmiş veya hatalı.",
        "5105": "Kartınız 3D Secure doğrulamasından geçemedi.",
        "5106": "İşlem reddedildi. Lütfen bankanızla iletişime geçin.",
        "5107": "Kartınız işleme kapalı.",
        "5108": "Kartınızın günlük işlem limiti aşıldı.",
        "5109": "Kartınızın aylık işlem limiti aşıldı.",
        "5110": "Kartınızın yıllık işlem limiti aşıldı.",
        "5111": "Kartınızın işlem sayısı limiti aşıldı.",
        "5112": "Kartınızın PIN kodu hatalı.",
        "5113": "Kartınızın güvenlik kodu hatalı.",
        "5114": "Kartınızın sahibi bulunamadı.",
        "5115": "Kartınızın bankası işlemi reddetti.",
        "5116": "Kartınızın bankası geçici olarak hizmet dışı.",
        "5117": "Kartınızın bankası işlemi onaylamadı.",
        "5118": "Kartınızın bankası işlemi zaman aşımına uğradı.",
        "5119": "Kartınızın bankası işlemi iptal etti.",
        "5120": "Kartınızın bankası işlemi beklenmedik bir hata verdi.",
        // iyzico Test Kartları Hataları
        "10051": "Kart limiti yetersiz (Test kartı hatası).",
        "10052": "Kart bulunamadı (Test kartı hatası).",
        "10053": "CVV kodu hatalı (Test kartı hatası).",
        "10054": "Son kullanma tarihi hatalı (Test kartı hatası).",
        "10055": "3D Secure doğrulaması başarısız (Test kartı hatası).",
        "10056": "İşlem reddedildi (Test kartı hatası).",
        "10057": "Kart işleme kapalı (Test kartı hatası).",
        "10058": "Günlük limit aşıldı (Test kartı hatası).",
        "10059": "Aylık limit aşıldı (Test kartı hatası).",
        "10060": "Yıllık limit aşıldı (Test kartı hatası).",
        // Hata Grupları
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

