const Craftsmanship: React.FC = () => {
  return (
    <section className="py-24 bg-luxury-darkGray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            El İşçiliği <span className="text-luxury-goldLight">Felsefemiz</span>
          </h2>
          <p className="text-lg text-luxury-lightGray max-w-3xl mx-auto">
            Her ürünümüz, ustalarımızın yılların tecrübesiyle şekillenen titiz çalışmasının ürünüdür
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-luxury-goldLight/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-sans text-xl font-semibold text-white mb-3">Tasarım</h3>
            <p className="text-luxury-lightGray">
              Her ürün, estetik ve işlevselliği birleştiren özgün tasarımlarla başlar
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-luxury-goldLight/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-sans text-xl font-semibold text-white mb-3">Malzeme Seçimi</h3>
            <p className="text-luxury-lightGray">
              Sadece en kaliteli hammaddeler: pirinç, paslanmaz çelik, kristal cam
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-luxury-goldLight/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-sans text-xl font-semibold text-white mb-3">El İşçiliği</h3>
            <p className="text-luxury-lightGray">
              Ustalarımız tarafından özenle işlenen her detay, benzersiz karakterler yaratır
            </p>
          </div>

          {/* Step 4 */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-luxury-goldLight/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-sans text-xl font-semibold text-white mb-3">Kalite Kontrolü</h3>
            <p className="text-luxury-lightGray">
              Her ürün, katı kalite standartlarımızdan geçerek size ulaşır
            </p>
          </div>
        </div>

        {/* Quote Section */}
        <div className="mt-20 max-w-4xl mx-auto text-center">
          <blockquote className="text-2xl text-white italic mb-4">
            &ldquo;Bir nargile sadece bir nesne değil, zarafet, zanaat ve kültürün bir araya geldiği 
            bir sanat eseridir.&rdquo;
          </blockquote>
          <p className="text-luxury-goldLight font-semibold">— Aychookah Felsefesi</p>
        </div>
      </div>
    </section>
  );
};

export default Craftsmanship;

