const AboutHero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-luxury-black via-luxury-darkGray to-luxury-mediumGray overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-2 bg-luxury-goldLight/20 rounded-sm mb-6">
            <span className="text-luxury-goldLight font-semibold text-sm uppercase tracking-wider">
              Hikayemiz
            </span>
          </div>
          
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-wide">
            Gelenekten <span className="text-luxury-goldLight">Geleceğe</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-luxury-lightGray leading-relaxed">
            Aychookah, tutku ve zanaat geleneğinin buluştuğu, her detayda mükemmeliyeti arayan 
            bir markadır. El işçiliği nargile üretimi ve orijinal Rus nargile kültürünü 
            Türkiye&apos;ye taşımanın gururunu yaşıyoruz.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;

