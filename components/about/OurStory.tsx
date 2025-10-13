const OurStory: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Story Content */}
          <div>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-luxury-black mb-6">
              Bir Tutkunun <span className="text-luxury-goldLight">Hikayesi</span>
            </h2>
            
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                Aychookah&apos;ın kuruluş hikayesi, nargile kültürüne duyulan derin bir sevgi ve 
                saygıyla başladı. Kurucumuz, yıllar boyunca dünya çapında nargile geleneklerini 
                inceledi ve özellikle Rus nargile zanaatının benzersiz özelliklerini keşfetti.
              </p>
              
              <p>
                Bu keşif yolculuğu, hem geleneksel el işçiliğini korumak hem de modern 
                tasarım anlayışını harmanlama vizyonuyla Aychookah&apos;ın doğuşuna yol açtı. 
                Her ürünümüz, bu vizyonun somut bir yansımasıdır.
              </p>
              
              <p>
                Bugün, Türkiye&apos;nin önde gelen lüks nargile üreticilerinden biri olarak, 
                hem kendi el işçiliği üretimlerimizle hem de özenle seçilmiş orijinal Rus 
                ithalatlarımızla sektörde fark yaratıyoruz.
              </p>
            </div>
          </div>

          {/* Timeline or Image */}
          <div className="relative">
            <div className="bg-luxury-darkGray rounded-sm p-8 text-white">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-luxury-goldLight flex items-center justify-center font-bold text-luxury-black">
                    1
                  </div>
                  <div>
                    <h4 className="font-sans text-xl font-semibold mb-2">Vizyon</h4>
                    <p className="text-luxury-lightGray">
                      Dünya çapında nargile kültürlerinin incelenmesi ve Rus zanaatının keşfi
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-luxury-goldLight flex items-center justify-center font-bold text-luxury-black">
                    2
                  </div>
                  <div>
                    <h4 className="font-sans text-xl font-semibold mb-2">Kuruluş</h4>
                    <p className="text-luxury-lightGray">
                      Aychookah markasının doğuşu ve ilk atölye kurulumu
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-luxury-goldLight flex items-center justify-center font-bold text-luxury-black">
                    3
                  </div>
                  <div>
                    <h4 className="font-sans text-xl font-semibold mb-2">Üretim</h4>
                    <p className="text-luxury-lightGray">
                      El işçiliği üretim ve Rusya ile doğrudan ithalat partnerliği
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-luxury-goldLight flex items-center justify-center font-bold text-luxury-black">
                    4
                  </div>
                  <div>
                    <h4 className="font-sans text-xl font-semibold mb-2">Bugün</h4>
                    <p className="text-luxury-lightGray">
                      Türkiye&apos;nin önde gelen lüks nargile markalarından biri
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;

