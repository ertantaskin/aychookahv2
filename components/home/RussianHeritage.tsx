"use client";

const RussianHeritage: React.FC = () => {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #0A0A0A 0, #0A0A0A 1px, transparent 0, transparent 50%)',
            backgroundSize: '10px 10px'
          }} 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-luxury-black/20 rounded-full bg-luxury-black/5">
              <svg className="w-4 h-4 text-luxury-goldLight" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
              <span className="text-luxury-black font-semibold text-sm uppercase tracking-wider">
                Orijinal İthalat
              </span>
            </div>
            
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-luxury-black mb-6 leading-tight">
              Rus Nargile{" "}
              <span className="inline-block bg-gradient-to-r from-luxury-goldLight to-luxury-gold bg-clip-text text-transparent">
                Kültürü
              </span>
            </h2>
            
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Rusya&apos;nın zengin nargile geleneğini Türkiye&apos;ye taşıyoruz. Orijinal Rus 
              nargile takımları, yüzyıllardır süregelen zanaat geleneğinin ürünüdür. 
              Her parça, Rus ustalığının ve titizliğinin bir göstergesidir.
            </p>
            
            <p className="text-gray-600 text-lg leading-relaxed mb-10">
              Doğrudan kaynaklardan ithal ettiğimiz bu özel ürünler, geleneksel Rus 
              tasarım estetiğini modern kullanım rahatlığıyla birleştirir. Benzersiz 
              formları ve üstün kaliteleriyle koleksiyonunuzun en değerli parçaları 
              olacaktır.
            </p>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="group relative text-center p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:border-luxury-goldLight/50 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-goldLight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative">
                  <div className="text-4xl font-bold text-luxury-black mb-2 group-hover:text-luxury-goldLight transition-colors">100%</div>
                  <div className="text-sm text-gray-600 font-medium">Orijinal</div>
                </div>
              </div>
              <div className="group relative text-center p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:border-luxury-goldLight/50 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-goldLight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative">
                  <div className="text-4xl font-bold text-luxury-black mb-2 group-hover:text-luxury-goldLight transition-colors">50+</div>
                  <div className="text-sm text-gray-600 font-medium">Model</div>
                </div>
              </div>
              <div className="group relative text-center p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:border-luxury-goldLight/50 hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-luxury-goldLight/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative">
                  <div className="text-4xl font-bold text-luxury-black mb-2 group-hover:text-luxury-goldLight transition-colors">10+</div>
                  <div className="text-sm text-gray-600 font-medium">Yıl Tecrübe</div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-10 space-y-4">
              {['Doğrudan Rusya\'dan İthalat', 'Sertifikalı Orijinallik', 'Premium Paketleme'].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-luxury-goldLight flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 text-luxury-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-luxury-goldLight transition-colors">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Side with Modern Design */}
          <div className="order-1 lg:order-2 relative group">
            <div className="relative h-96 lg:h-[600px] bg-gradient-to-br from-luxury-darkGray via-luxury-mediumGray to-luxury-black rounded-2xl overflow-hidden shadow-2xl">
              {/* Animated Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-luxury-goldLight via-luxury-gold to-luxury-goldLight rounded-2xl opacity-20 group-hover:opacity-40 blur-2xl transition-opacity duration-500 animate-gradient" />
              
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center transition-transform duration-500 group-hover:scale-110">
                  <div className="relative">
                    {/* Glowing Background */}
                    <div className="absolute inset-0 bg-luxury-goldLight/20 rounded-full blur-3xl animate-pulse" />
                    
                    {/* Icon */}
                    <svg className="relative w-40 h-40 mx-auto text-luxury-goldLight mb-6 drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-luxury-goldLight text-xl font-bold mb-2">Rus Koleksiyonu</p>
                  <p className="text-luxury-lightGray">Yüzyıllık Gelenek</p>
                </div>
              </div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-luxury-goldLight/30 rounded-tl-lg" />
              <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-luxury-goldLight/30 rounded-br-lg" />
              
              {/* Floating Particles */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-luxury-goldLight rounded-full animate-float opacity-60" />
              <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-luxury-goldLight rounded-full animate-float opacity-40" style={{ animationDelay: '2s' }} />
              <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-luxury-goldLight rounded-full animate-float opacity-50" style={{ animationDelay: '4s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RussianHeritage;

