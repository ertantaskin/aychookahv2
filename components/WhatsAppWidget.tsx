"use client";

import { useState, useRef, useEffect } from "react";

const WhatsAppWidget: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const whatsappNumber = "90XXXXXXXXX"; // Gerçek numara ile değiştirilecek
  const widgetRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className="relative" ref={widgetRef}>
      {/* Expanded Card */}
      {isExpanded && (
        <div 
          className="absolute bottom-full left-0 mb-3 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-slideUp z-[9999]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-3 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-sans text-white font-bold text-sm">Müşteri Temsilcisi</h4>
                <p className="font-sans text-white/90 text-[10px]">Genellikle 5 dk içinde yanıt verir</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-3 space-y-2">
            <p className="font-sans text-gray-700 text-xs leading-relaxed">
              Merhaba! 👋 Size nasıl yardımcı olabiliriz?
            </p>

            {/* Quick Actions */}
            <div className="space-y-1.5">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Merhaba, ürünleriniz hakkında bilgi almak istiyorum.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 p-2 bg-gray-50 hover:bg-[#25D366]/10 rounded-lg transition-all duration-300 border border-transparent hover:border-[#25D366]/30"
              >
                <div className="w-7 h-7 bg-[#25D366]/10 rounded-md flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-gray-800 text-xs">Ürün Bilgisi</p>
                  <p className="font-sans text-gray-600 text-[10px]">Ürünlerimiz hakkında soru sorun</p>
                </div>
                <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#25D366] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}?text=Merhaba, sipariş vermek istiyorum.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 p-2 bg-gray-50 hover:bg-[#25D366]/10 rounded-lg transition-all duration-300 border border-transparent hover:border-[#25D366]/30"
              >
                <div className="w-7 h-7 bg-[#25D366]/10 rounded-md flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-gray-800 text-xs">Sipariş Ver</p>
                  <p className="font-sans text-gray-600 text-[10px]">Hızlı ve kolay sipariş</p>
                </div>
                <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#25D366] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}?text=Merhaba, yardıma ihtiyacım var.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 p-2 bg-gray-50 hover:bg-[#25D366]/10 rounded-lg transition-all duration-300 border border-transparent hover:border-[#25D366]/30"
              >
                <div className="w-7 h-7 bg-[#25D366]/10 rounded-md flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans font-semibold text-gray-800 text-xs">Destek Al</p>
                  <p className="font-sans text-gray-600 text-[10px]">7/24 müşteri desteği</p>
                </div>
                <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#25D366] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 pb-3">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 text-xs"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>WhatsApp ile Sohbet Başlat</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Button */}
      <div 
        onMouseEnter={() => setIsExpanded(true)}
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative cursor-pointer"
      >
        <div className="relative bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
          {/* Background Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#128C7E] to-[#25D366] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Content */}
          <div className="relative flex items-center gap-3">
            {/* WhatsApp Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              {/* Online Indicator */}
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-sans text-white font-bold text-sm mb-0.5">WhatsApp Destek</h4>
              <p className="font-sans text-white/90 text-xs">
                Hızlı sipariş ve yardım
              </p>
            </div>

            {/* Arrow Icon */}
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -right-2 -top-2 w-16 h-16 bg-white/5 rounded-full blur-xl" />
          <div className="absolute -left-2 -bottom-2 w-20 h-20 bg-white/5 rounded-full blur-xl" />
        </div>
      </div>
    </div>
  );
};

export default WhatsAppWidget;

