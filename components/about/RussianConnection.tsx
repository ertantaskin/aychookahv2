const RussianConnection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Placeholder */}
          <div className="relative h-96 lg:h-[500px] bg-luxury-mediumGray rounded-sm overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-32 h-32 mx-auto text-luxury-lightGray mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-luxury-lightGray">Rus Nargile Geleneği</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-luxury-black mb-6">
              Rus Nargile <span className="text-luxury-goldLight">Geleneği</span>
            </h2>
            
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                Rus nargile üretimi, yüzyılları aşan bir zanaat geleneğidir. Pirinç dökümden 
                cam işçiliğine kadar her aşamada gösterilen titizlik ve sanatsal dokunuş, 
                bu ürünleri dünya çapında benzersiz kılar.
              </p>
              
              <p>
                Aychookah olarak, Rusya&apos;daki en prestijli nargile üreticileriyle doğrudan 
                çalışıyoruz. Bu partnership, size %100 orijinal, el işçiliği Rus nargile 
                takımlarını sunmamızı sağlıyor.
              </p>
              
              <p>
                Her Rus nargile, sadece bir içim deneyimi değil, aynı zamanda bir kültürel 
                miras parçasıdır. Geleneksel motifleri, sofistike tasarımları ve üstün 
                kaliteleriyle bu ürünler, koleksiyonunuzun en değerli parçaları olacaktır.
              </p>
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-6 rounded-sm">
                <div className="text-3xl font-bold text-luxury-black mb-2">100%</div>
                <div className="text-sm text-gray-600">Orijinal İthalat</div>
              </div>
              <div className="bg-gray-50 p-6 rounded-sm">
                <div className="text-3xl font-bold text-luxury-black mb-2">50+</div>
                <div className="text-sm text-gray-600">Farklı Model</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RussianConnection;

