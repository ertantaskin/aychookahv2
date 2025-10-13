const ComingSoonHMD: React.FC = () => {

  return (
    <section className="relative py-8 sm:py-12 lg:py-16 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-5 left-5 w-48 h-48 sm:w-72 sm:h-72 bg-luxury-goldLight/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-5 right-5 w-56 h-56 sm:w-80 sm:h-80 bg-luxury-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 items-center">
          {/* Left Side - Content */}
          <div className="relative z-10 order-2 lg:order-1 space-y-3 sm:space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-luxury-goldLight/50 rounded-full bg-luxury-goldLight/10 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-luxury-goldLight rounded-full animate-pulse" />
              <span className="text-luxury-gold text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">
                Yeni Ürün
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-1.5 sm:space-y-2">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                <span className="block bg-gradient-to-r from-luxury-black via-luxury-darkGray to-luxury-black bg-clip-text text-transparent">
                  Yeni Nesil
                </span>
                <span className="block text-luxury-gold">HMD</span>
              </h2>
              
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-10 sm:w-12 bg-luxury-goldLight rounded-full" />
                <p className="text-lg sm:text-xl font-light text-gray-400">
                  Çok Yakında
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Nargile deneyiminizi üst seviyeye taşıyacak mühendislik harikası. 
              <span className="block mt-1 text-luxury-gold font-semibold">Devrim yaratmaya hazır olun.</span>
            </p>

            {/* Features - Modern Icons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { icon: '🔥', text: 'Isı Kontrolü' },
                { icon: '⚡', text: 'Kolay Kullanım' },
                { icon: '💎', text: 'Premium' },
                { icon: '🎯', text: 'Profesyonel' }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="group flex items-center gap-2 p-2.5 sm:p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-100 hover:border-luxury-goldLight/50 transition-all duration-300"
                >
                  <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</span>
                  <span className="text-[11px] sm:text-xs font-medium text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Simple CTA */}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-px flex-1 bg-gradient-to-r from-luxury-goldLight to-transparent" />
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-semibold">
                Takipte Kalın
              </p>
              <div className="h-px flex-1 bg-gradient-to-l from-luxury-goldLight to-transparent" />
            </div>
          </div>

          {/* Right Side - Product Preview with Safety Tape */}
          <div className="relative order-1 lg:order-2">
            <div className="relative max-w-sm mx-auto lg:max-w-none">
              {/* Product Container */}
              <div className="relative bg-gradient-to-br from-luxury-mediumGray to-luxury-darkGray rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden">
                {/* Subtle Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/5 to-transparent" />

                {/* Blurred Product Silhouette */}
                <div className="relative aspect-square">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Product Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-luxury-goldLight/25 via-luxury-gold/15 to-luxury-goldLight/25 rounded-full blur-3xl animate-pulse" />
                    
                    {/* Product Icon/Shape (blurred) */}
                    <div className="relative">
                      <svg className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 text-luxury-goldLight opacity-20 blur-2xl" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 15.5V7h2v10.5h-2z"/>
                      </svg>
                    </div>

                    {/* Question Mark */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-[220px] sm:text-[280px] lg:text-[380px] font-bold text-luxury-goldLight/30 animate-pulse leading-none">
                        ?
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safety Tape - Multiple Strips */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Tape 1 - Diagonal */}
                  <div className="absolute w-full transform -rotate-12 translate-y-5 sm:translate-y-6">
                    <div className="relative bg-yellow-400 py-1.5 sm:py-2 shadow-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300" />
                      <div className="relative flex items-center justify-center gap-3 sm:gap-6 animate-marquee whitespace-nowrap">
                        {[...Array(8)].map((_, i) => (
                          <span key={i} className="text-black font-black text-[9px] sm:text-[10px] uppercase tracking-wider">
                            ⚠️ Çok Yakında ⚠️
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tape 2 - Diagonal Opposite */}
                  <div className="absolute w-full transform rotate-12 -translate-y-5 sm:-translate-y-6">
                    <div className="relative bg-yellow-400 py-1.5 sm:py-2 shadow-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300" />
                      <div className="relative flex items-center justify-center gap-3 sm:gap-6 animate-marquee-reverse whitespace-nowrap">
                        {[...Array(8)].map((_, i) => (
                          <span key={i} className="text-black font-black text-[9px] sm:text-[10px] uppercase tracking-wider">
                            🔥 Coming Soon 🔥
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Secret Badge */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
                  <div className="bg-red-600 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded transform rotate-12 shadow-lg">
                    <p className="font-black text-[8px] sm:text-[9px] uppercase tracking-wider">Top Secret</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px sm:h-0.5 bg-gradient-to-r from-transparent via-luxury-goldLight to-transparent opacity-50" />
    </section>
  );
};

export default ComingSoonHMD;

