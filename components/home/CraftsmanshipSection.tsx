"use client";

import { useState } from "react";

const CraftsmanshipSection: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<number>(0);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: "Premium Malzemeler",
      description: "Yüksek kaliteli pirinç, paslanmaz çelik ve cam"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "El Yapımı Detaylar",
      description: "Her ürün özenle elle işlenir ve kontrol edilir"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Kalite Garantisi",
      description: "Uzun ömürlü kullanım için test edilmiş dayanıklılık"
    }
  ];

  return (
    <section className="relative py-24 bg-luxury-black overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(212,175,55,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(212,175,55,0.05),transparent_50%)]" />
      </div>

      {/* Floating Grid */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side with 3D Effect */}
          <div className="relative group">
            <div className="relative h-96 lg:h-[600px] bg-gradient-to-br from-luxury-mediumGray via-luxury-darkGray to-luxury-black rounded-2xl overflow-hidden shadow-2xl">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-luxury-goldLight via-luxury-gold to-luxury-goldLight rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-500" />
              
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center transition-transform duration-500 group-hover:scale-110">
                  <div className="relative">
                    <div className="absolute inset-0 bg-luxury-goldLight/20 rounded-full blur-3xl animate-pulse" />
                    <svg className="relative w-32 h-32 mx-auto text-luxury-goldLight mb-4 drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <p className="text-luxury-goldLight text-lg font-semibold">El İşçiliği</p>
                  <p className="text-luxury-lightGray text-sm mt-2">Yılların Deneyimi</p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 border border-luxury-goldLight/30 rounded-full animate-pulse" />
              <div className="absolute bottom-10 left-10 w-16 h-16 border border-luxury-goldLight/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Stats Overlay */}
            <div className="absolute -bottom-8 left-8 right-8 grid grid-cols-3 gap-4">
              <div className="bg-luxury-darkGray/90 backdrop-blur-sm border border-luxury-goldLight/20 rounded-lg p-4 text-center shadow-xl">
                <div className="text-2xl font-bold text-luxury-goldLight mb-1">10+</div>
                <div className="text-xs text-luxury-lightGray">Yıl Tecrübe</div>
              </div>
              <div className="bg-luxury-darkGray/90 backdrop-blur-sm border border-luxury-goldLight/20 rounded-lg p-4 text-center shadow-xl">
                <div className="text-2xl font-bold text-luxury-goldLight mb-1">100%</div>
                <div className="text-xs text-luxury-lightGray">El Yapımı</div>
              </div>
              <div className="bg-luxury-darkGray/90 backdrop-blur-sm border border-luxury-goldLight/20 rounded-lg p-4 text-center shadow-xl">
                <div className="text-2xl font-bold text-luxury-goldLight mb-1">500+</div>
                <div className="text-xs text-luxury-lightGray">Mutlu Müşteri</div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="lg:pl-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-luxury-goldLight/30 rounded-full bg-luxury-goldLight/5">
              <span className="text-luxury-goldLight text-xs sm:text-sm font-medium tracking-widest uppercase">
                Zanaat Geleneği
              </span>
            </div>

            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ustalık ve{" "}
              <span className="inline-block bg-gradient-to-r from-luxury-goldLight to-luxury-gold bg-clip-text text-transparent">
                El İşçiliği
              </span>
            </h2>

            <p className="text-luxury-lightGray text-lg leading-relaxed mb-6">
              Her bir Aychookah ürünü, yılların deneyimi ve tutkunun bir araya geldiği 
              özel bir el işçiliği sürecinden geçer. Geleneksel teknikleri modern 
              tasarım anlayışıyla harmanlayarak, sadece işlevsel değil aynı zamanda 
              estetik açıdan da mükemmel ürünler yaratıyoruz.
            </p>

            <p className="text-luxury-lightGray text-lg leading-relaxed mb-10">
              Kullandığımız her malzeme titizlikle seçilir, her detay özenle işlenir. 
              Bu süreç, size sunduğumuz her ürünün benzersiz olmasını ve en yüksek 
              kalite standartlarını karşılamasını sağlar.
            </p>

            {/* Interactive Features List */}
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  onMouseEnter={() => setActiveFeature(index)}
                  className={`group relative p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    activeFeature === index
                      ? 'bg-luxury-darkGray/50 border-luxury-goldLight/50 shadow-lg'
                      : 'bg-luxury-darkGray/20 border-luxury-goldLight/10 hover:border-luxury-goldLight/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-luxury-goldLight text-luxury-black scale-110'
                        : 'bg-luxury-goldLight/20 text-luxury-goldLight'
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`feature-title font-bold mb-2 text-lg transition-colors duration-300 ${
                        activeFeature === index ? 'text-luxury-goldLight' : 'text-white'
                      }`}>
                        {feature.title}
                      </div>
                      <p className="text-luxury-lightGray text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <div className={`transition-transform duration-300 ${
                      activeFeature === index ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
                    }`}>
                      <svg className="w-5 h-5 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className={`absolute bottom-0 left-0 h-1 bg-luxury-goldLight transition-all duration-500 ${
                    activeFeature === index ? 'w-full' : 'w-0'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CraftsmanshipSection;

