# Aychookah - Lüks Nargile Web Sitesi

Modern ve şık bir nargile markası web sitesi. Next.js 15, TypeScript ve Tailwind CSS kullanılarak geliştirilmiştir.

## 🎯 Özellikler

- ✨ **Modern Tasarım**: Siyah, beyaz ve koyu gri renk paleti ile lüks ve sade bir görünüm
- 🎨 **Responsive**: Mobil, tablet ve masaüstü cihazlarda mükemmel görünüm
- ⚡ **Performans**: Next.js 15 App Router ile optimize edilmiş performans
- 🔍 **SEO Uyumlu**: Meta etiketler, sitemap ve robots.txt ile tam SEO desteği
- 🌐 **Türkçe İçerik**: Tam Türkçe dil desteği
- 📱 **PWA Desteği**: Progressive Web App özellikleri

## 📄 Sayfalar

1. **Ana Sayfa**: Hero bölümü, öne çıkan ürünler, el işçiliği ve Rus kültürü tanıtımı
2. **Ürünler**: Filtrelenebilir ve sıralanabilir ürün listesi
3. **Hakkımızda**: Marka hikayesi, değerler ve üretim süreci
4. **İletişim**: İletişim formu ve iletişim bilgileri

## 🚀 Kurulum

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

3. **Tarayıcınızda açın:**
```
http://localhost:3000
```

## 🏗️ Proje Yapısı

```
aychookah/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Ana layout
│   ├── page.tsx           # Ana sayfa
│   ├── globals.css        # Global stiller
│   ├── urunler/           # Ürünler sayfası
│   ├── hakkimizda/        # Hakkımızda sayfası
│   ├── iletisim/          # İletişim sayfası
│   ├── sitemap.ts         # SEO sitemap
│   ├── robots.ts          # SEO robots
│   └── manifest.ts        # PWA manifest
├── components/            # React bileşenleri
│   ├── Header.tsx         # Header bileşeni
│   ├── Footer.tsx         # Footer bileşeni
│   ├── home/             # Ana sayfa bileşenleri
│   ├── products/         # Ürünler bileşenleri
│   ├── about/            # Hakkımızda bileşenleri
│   └── contact/          # İletişim bileşenleri
├── public/               # Statik dosyalar
├── tailwind.config.ts    # Tailwind yapılandırması
├── tsconfig.json         # TypeScript yapılandırması
└── package.json          # Proje bağımlılıkları
```

## 🎨 Renk Paleti

- **Luxury Black**: #0A0A0A
- **Dark Gray**: #1A1A1A
- **Medium Gray**: #2D2D2D
- **Light Gray**: #B8B8B8
- **Gold**: #D4AF37
- **Gold Light**: #E5C76B

## 📦 Kullanılan Teknolojiler

- **Next.js 15**: React framework (App Router)
- **TypeScript**: Tip güvenliği
- **Tailwind CSS**: Utility-first CSS framework
- **React 18**: UI kütüphanesi
- **Zod**: Form validasyonu için (isteğe bağlı)

## 🔧 Özelleştirme

### Renkleri Değiştirme
`tailwind.config.ts` dosyasında renk paletini özelleştirebilirsiniz.

### Ürün Ekleme
`components/products/ProductsGrid.tsx` dosyasındaki `allProducts` dizisine yeni ürünler ekleyebilirsiniz.

### İletişim Bilgileri
`components/Footer.tsx` ve `components/contact/ContactInfo.tsx` dosyalarında iletişim bilgilerini güncelleyebilirsiniz.

## 🌐 Deployment

### Vercel (Önerilen)
```bash
npm run build
```
Projeyi Vercel'e yükleyin ve otomatik deployment yapın.

### Diğer Platformlar
Next.js'in desteklediği herhangi bir platformda (Netlify, AWS, DigitalOcean, vb.) deploy edebilirsiniz.

## 📝 SEO İyileştirmeleri

- ✅ Meta etiketler (title, description, keywords)
- ✅ Open Graph etiketleri
- ✅ Twitter Card etiketleri
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Semantic HTML
- ✅ Alt etiketleri (görseller eklendiğinde)
- ✅ Structured data (isteğe bağlı olarak eklenebilir)

## 🖼️ Görseller Ekleme

Ürün görselleri için `public/images/products/` klasörüne görselleri ekleyin.
Önerilen görsel formatları: WebP, AVIF (Next.js otomatik optimize eder)

## 🔐 Güvenlik

- Form validasyonu (Zod ile genişletilebilir)
- XSS koruması (React varsayılan)
- CSRF koruması (API route'ları eklendiğinde)
- Helmet entegrasyonu (production için önerilir)

## 📄 Lisans

Bu proje özel kullanım içindir.

## 📞 Destek

Sorularınız için: info@aychookah.com

---

**Aychookah** - Lüks Nargile Sanatının Zirvesi

