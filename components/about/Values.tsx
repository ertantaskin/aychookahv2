const Values: React.FC = () => {
  const values = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Kalite",
      description: "Her üründe en yüksek kalite standartlarını koruyoruz. Malzeme seçiminden bitmiş ürüne kadar her aşamada mükemmeliyeti hedefliyoruz."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Geleneksel Zanaat",
      description: "Yüzyıllık zanaat geleneklerini koruyarak, modern dünyaya taşıyoruz. Her ürün, bu geleneğin yaşayan bir parçasıdır."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "İnovasyon",
      description: "Geleneği korurken, modern tasarım ve teknoloji ile yenilikçi çözümler üretiyoruz."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Müşteri Memnuniyeti",
      description: "Müşterilerimizin deneyimini her zaman ön planda tutuyoruz. Satış sonrası destek ve garantili hizmet sunuyoruz."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Orijinallik",
      description: "Sadece orijinal ve sertifikalı ürünler sunuyoruz. İthal ürünlerimiz doğrudan kaynaklardan temin edilir."
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Sürdürülebilirlik",
      description: "Çevre dostu üretim süreçleri ve uzun ömürlü ürünlerle sürdürülebilir bir gelecek için çalışıyoruz."
    },
  ];

  return (
    <section className="py-24 bg-luxury-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Değerlerimiz ve <span className="text-luxury-goldLight">Prensiplerimiz</span>
          </h2>
          <p className="text-lg text-luxury-lightGray max-w-3xl mx-auto">
            Aychookah&apos;ı benzersiz kılan ve her adımda bize rehberlik eden temel değerler
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-luxury-darkGray p-8 rounded-sm hover:bg-luxury-mediumGray transition-colors duration-300">
              <div className="w-16 h-16 rounded-full bg-luxury-goldLight/20 flex items-center justify-center text-luxury-goldLight mb-6">
                {value.icon}
              </div>
              <h3 className="font-sans text-xl font-semibold text-white mb-3">{value.title}</h3>
              <p className="text-luxury-lightGray leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;

