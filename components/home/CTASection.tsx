"use client";

import Link from "next/link";

const CTASection: React.FC = () => {
  return (
    <section className="relative py-32 bg-luxury-black overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.1),transparent_70%)]" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '48px 48px'
          }} />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-luxury-goldLight/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-luxury-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-luxury-goldLight/30 rounded-full backdrop-blur-sm bg-luxury-goldLight/5">
            <span className="w-2 h-2 bg-luxury-goldLight rounded-full animate-pulse" />
            <span className="font-sans text-luxury-goldLight text-xs sm:text-sm font-medium tracking-widest uppercase">
              Size Özel Çözümler
            </span>
          </div>

          <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Lüks Nargile Deneyimini{" "}
            <span className="font-sans inline-block bg-gradient-to-r from-luxury-goldLight via-luxury-gold to-luxury-goldLight bg-clip-text text-transparent animate-gradient">
              Keşfedin
            </span>
          </h2>
          
          <p className="font-sans text-lg sm:text-xl text-luxury-lightGray mb-12 max-w-3xl mx-auto leading-relaxed">
            Özel koleksiyonumuzdan sizin için en uygun ürünü seçin veya bizimle iletişime 
            geçerek özel tasarım hizmeti hakkında bilgi alın.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <Link 
              href="/urunler"
              className="group relative px-10 py-5 bg-luxury-goldLight text-luxury-black font-bold rounded-full overflow-hidden transition-all duration-300 uppercase tracking-wider text-sm shadow-2xl hover:shadow-luxury-goldLight/50 hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Ürünleri İncele
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold to-luxury-goldLight opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link 
              href="/iletisim"
              className="group relative px-10 py-5 border-2 border-luxury-goldLight/50 text-white font-bold rounded-full overflow-hidden transition-all duration-300 uppercase tracking-wider text-sm hover:border-luxury-goldLight hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2 group-hover:text-luxury-black transition-colors">
                İletişime Geç
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-luxury-goldLight transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          </div>
        </div>

        {/* Enhanced Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="group relative p-8 backdrop-blur-sm bg-luxury-darkGray/30 border border-luxury-goldLight/10 rounded-2xl hover:border-luxury-goldLight/30 transition-all duration-500 hover:transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-goldLight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-luxury-goldLight/10 rounded-full flex items-center justify-center group-hover:bg-luxury-goldLight/20 transition-colors duration-300 group-hover:scale-110 transform">
                <svg className="w-8 h-8 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div className="benefit-title text-luxury-goldLight text-xl font-bold mb-3 group-hover:text-luxury-goldLight transition-colors">
                Ücretsiz Kargo
              </div>
              <p className="text-luxury-lightGray text-sm leading-relaxed">
                Türkiye geneli hızlı ve güvenli teslimat
              </p>
            </div>
          </div>

          <div className="group relative p-8 backdrop-blur-sm bg-luxury-darkGray/30 border border-luxury-goldLight/10 rounded-2xl hover:border-luxury-goldLight/30 transition-all duration-500 hover:transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-goldLight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-luxury-goldLight/10 rounded-full flex items-center justify-center group-hover:bg-luxury-goldLight/20 transition-colors duration-300 group-hover:scale-110 transform">
                <svg className="w-8 h-8 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="benefit-title text-luxury-goldLight text-xl font-bold mb-3 group-hover:text-luxury-goldLight transition-colors">
                Güvenli Ödeme
              </div>
              <p className="text-luxury-lightGray text-sm leading-relaxed">
                SSL sertifikalı güvenli alışveriş
              </p>
            </div>
          </div>

          <div className="group relative p-8 backdrop-blur-sm bg-luxury-darkGray/30 border border-luxury-goldLight/10 rounded-2xl hover:border-luxury-goldLight/30 transition-all duration-500 hover:transform hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-luxury-goldLight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-luxury-goldLight/10 rounded-full flex items-center justify-center group-hover:bg-luxury-goldLight/20 transition-colors duration-300 group-hover:scale-110 transform">
                <svg className="w-8 h-8 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="benefit-title text-luxury-goldLight text-xl font-bold mb-3 group-hover:text-luxury-goldLight transition-colors">
                2 Yıl Garanti
              </div>
              <p className="text-luxury-lightGray text-sm leading-relaxed">
                Üretici garantisi ile gönül rahatlığı
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

