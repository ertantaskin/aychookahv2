"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [staticNoise, setStaticNoise] = useState<string>("");

  useEffect(() => {
    // Karıncalanma efekti için rastgele karakterler oluştur
    const generateStatic = () => {
      const chars = "█▓▒░ ░▒▓█";
      let noise = "";
      // TV boyutuna uygun karıncalanma
      for (let i = 0; i < 2000; i++) {
        noise += chars[Math.floor(Math.random() * chars.length)];
        // Bazen boşluk ekle
        if (Math.random() > 0.75) {
          noise += " ";
        }
      }
      setStaticNoise(noise);
    };

    generateStatic();
    const interval = setInterval(generateStatic, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-black to-luxury-darkGray flex items-center justify-center p-4 relative overflow-hidden">
      {/* Arka plan dekoratif elementler - Footer'dan esinlenme */}
      <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-luxury-goldLight rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-luxury-goldLight rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Üst başlık */}
        <h1 className="text-white text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 font-sans">
          Aradığınız sayfa bulunamadı
        </h1>

        {/* Tüplü Televizyon */}
        <div className="relative mx-auto" style={{ maxWidth: "480px" }}>
          {/* TV Kutusu */}
          <div className="relative bg-gradient-to-b from-luxury-mediumGray via-luxury-darkGray to-luxury-black rounded-lg p-4 md:p-6 shadow-2xl border-4 border-luxury-mediumGray">
            {/* TV Üst Kısmı - Taşıma Kolu */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-3 bg-luxury-mediumGray rounded-full"></div>

              {/* TV Ekran Çerçevesi */}
            <div className="relative bg-luxury-black rounded-sm p-1.5 md:p-2 border-4 border-luxury-mediumGray shadow-inner">
              {/* Ekran İçi - Karıncalı Görüntü */}
              <div className="relative bg-luxury-black aspect-video rounded overflow-hidden crt-screen">
                {/* Karıncalanma Katmanı */}
                <div 
                  className="absolute inset-0 text-luxury-goldLight font-mono text-[7px] md:text-[9px] leading-tight opacity-20 select-none pointer-events-none"
                  style={{
                    fontFamily: "monospace",
                    letterSpacing: "0.02em",
                    lineHeight: "1.1",
                  }}
                >
                  <div className="absolute inset-0 whitespace-pre-wrap break-all overflow-hidden">
                    {staticNoise}
                  </div>
                </div>

                {/* 404 Yazısı - Retro Font */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="relative">
                    {/* Glow efekti */}
                    <div className="absolute inset-0 text-luxury-goldLight blur-sm opacity-40">
                      <span className="text-6xl md:text-7xl font-bold" style={{ fontFamily: "monospace" }}>
                        404
                      </span>
                    </div>
                    {/* Ana yazı */}
                    <span 
                      className="relative text-luxury-goldLight text-6xl md:text-7xl font-bold"
                      style={{ 
                        fontFamily: "monospace",
                        textShadow: "0 0 20px rgba(229, 199, 107, 0.8), 0 0 40px rgba(229, 199, 107, 0.4), 0 0 60px rgba(229, 199, 107, 0.2)",
                        animation: "flicker 0.15s infinite alternate"
                      }}
                    >
                      404
                    </span>
                  </div>
                </div>

                {/* Ekran parıltısı efekti */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-luxury-goldLight opacity-5 pointer-events-none"></div>
              </div>
            </div>

            {/* TV Yan Tasarım Detayları - Havalandırma */}
            <div className="absolute -right-2 top-1/4 w-1.5 h-32 bg-luxury-mediumGray rounded opacity-60">
              <div className="absolute inset-0 flex flex-col gap-0.5 p-0.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-0.5 bg-luxury-darkGray rounded"></div>
                ))}
              </div>
            </div>
            
            {/* TV Alt Kısmı - Kablo */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-2.5 h-10 bg-luxury-darkGray rounded-b shadow-lg"></div>
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-3 h-8 bg-luxury-black rounded shadow-xl"></div>
          </div>
        </div>

        {/* Alt Buton */}
        <div className="mt-12 md:mt-16 text-center">
          <Link
            href="/"
            className="inline-block px-6 md:px-8 py-3 md:py-4 bg-luxury-goldLight hover:bg-luxury-gold text-luxury-black font-bold text-base md:text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-luxury-goldLight/50 font-sans"
          >
            Anasayfaya geri dön
          </Link>
        </div>
      </div>

    </div>
  );
}
