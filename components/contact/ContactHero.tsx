const ContactHero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-luxury-black via-luxury-darkGray to-luxury-mediumGray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-wide">
          <span className="text-luxury-goldLight">İletişime</span> Geçin
        </h1>
        <p className="text-lg sm:text-xl text-luxury-lightGray max-w-3xl mx-auto">
          Sorularınız, özel siparişleriniz veya işbirliği teklifleriniz için bize ulaşın. 
          Size en kısa sürede dönüş yapacağız.
        </p>
      </div>
    </section>
  );
};

export default ContactHero;

