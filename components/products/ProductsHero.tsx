const ProductsHero: React.FC = () => {
  return (
    <section className="relative pt-4 sm:pt-8 pb-10 sm:pb-12 bg-gradient-to-b from-luxury-black to-luxury-darkGray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8 bg-luxury-goldLight/10 border border-luxury-goldLight/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-luxury-goldLight rounded-full" />
            <span className="text-luxury-goldLight text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Premium Koleksiyon
            </span>
          </div>

          {/* Title */}
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
            <span className="block text-white mb-1 sm:mb-2">Ürün</span>
            <span className="block text-luxury-goldLight">Koleksiyonumuz</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-luxury-lightGray max-w-2xl mx-auto leading-relaxed px-4">
            El işçiliği ve lüks tasarımın buluştuğu özel nargile koleksiyonumuz. 
            Her biri özenle seçilmiş premium ürünler.
          </p>
        </div>
      </div>

    </section>
  );
};

export default ProductsHero;
