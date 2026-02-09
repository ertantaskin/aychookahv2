"use server";

import { prisma } from "@/lib/prisma";

export async function seedMenuAndHero() {
  try {
    console.log("🌱 Menü ve Hero içerikleri seed ediliyor...");

    // Check if data already exists
    const existingMenuItems = await prisma.menuItem.count();
    const existingHeroSlides = await prisma.heroSlide.count();

    if (existingMenuItems > 0 || existingHeroSlides > 0) {
      console.log("⚠️  Veritabanında zaten menü veya hero slide kayıtları var. Seed atlanıyor.");
      return { success: true, message: "Seed zaten yapılmış" };
    }

    // 1. Header Menüleri
    const headerMenus = [
      { label: "Ana Sayfa", href: "/", order: 0 },
      { label: "Ürünler", href: "/urunler", order: 1 },
      { label: "Hakkımızda", href: "/hakkimizda", order: 2 },
      { label: "İletişim", href: "/iletisim", order: 3 },
    ];

    for (const menu of headerMenus) {
      await prisma.menuItem.create({
        data: {
          label: menu.label,
          href: menu.href,
          location: "header",
          order: menu.order,
          isActive: true,
          isSectionTitle: false,
        },
      });
    }
    console.log("✅ Header menüleri eklendi");

    // 2. Footer Bölüm Başlıkları
    const sectionTitles = [
      { location: "footer-links", label: "Keşfet" },
      { location: "footer-categories", label: "Kategoriler" },
      { location: "footer-contact", label: "İletişim" },
      { location: "footer-social", label: "Bizi Takip Edin" },
    ];

    for (const title of sectionTitles) {
      await prisma.menuItem.create({
        data: {
          label: title.label,
          href: null,
          location: `${title.location}-title`,
          order: 0,
          isActive: true,
          isSectionTitle: true,
        },
      });
    }
    console.log("✅ Footer bölüm başlıkları eklendi");

    // 3. Footer "Keşfet" Menüleri
    const footerLinks = [
      { label: "Ana Sayfa", href: "/", order: 0 },
      { label: "Ürünler", href: "/urunler", order: 1 },
      { label: "Hakkımızda", href: "/hakkimizda", order: 2 },
      { label: "İletişim", href: "/iletisim", order: 3 },
    ];

    for (const link of footerLinks) {
      await prisma.menuItem.create({
        data: {
          label: link.label,
          href: link.href,
          location: "footer-links",
          order: link.order,
          isActive: true,
          isSectionTitle: false,
        },
      });
    }
    console.log("✅ Footer 'Keşfet' menüleri eklendi");

    // 4. Footer "Kategoriler" Menüleri
    const footerCategories = [
      { label: "Premium Nargile", href: "/urunler", order: 0 },
      { label: "Rus Tasarımı", href: "/urunler", order: 1 },
      { label: "Ekipmanlar", href: "/urunler", order: 2 },
      { label: "Aksesuarlar", href: "/urunler", order: 3 },
    ];

    for (const category of footerCategories) {
      await prisma.menuItem.create({
        data: {
          label: category.label,
          href: category.href,
          location: "footer-categories",
          order: category.order,
          isActive: true,
          isSectionTitle: false,
        },
      });
    }
    console.log("✅ Footer 'Kategoriler' menüleri eklendi");

    // 5. Sosyal Medya Linkleri
    const socialLinks = [
      { label: "Instagram", href: "#", order: 0, icon: "instagram" },
      { label: "Facebook", href: "#", order: 1, icon: "facebook" },
      { label: "Twitter", href: "#", order: 2, icon: "twitter" },
      { label: "WhatsApp", href: "#", order: 3, icon: "whatsapp" },
    ];

    for (const social of socialLinks) {
      await prisma.menuItem.create({
        data: {
          label: social.label,
          href: social.href,
          location: "footer-social",
          order: social.order,
          isActive: true,
          isSectionTitle: false,
          icon: social.icon,
        },
      });
    }
    console.log("✅ Sosyal medya linkleri eklendi");

    // 6. Alt Bar Linkleri
    const bottomLinks = [
      { label: "Gizlilik Politikası", href: "#", order: 0 },
      { label: "Kullanım Koşulları", href: "#", order: 1 },
    ];

    for (const link of bottomLinks) {
      await prisma.menuItem.create({
        data: {
          label: link.label,
          href: link.href,
          location: "footer-bottom",
          order: link.order,
          isActive: true,
          isSectionTitle: false,
        },
      });
    }
    console.log("✅ Alt bar linkleri eklendi");

    // 7. Hero Slides
    const heroSlides = [
      {
        title: "Lüks Nargile",
        subtitle: "Sanatının Zirvesi",
        description: "El işçiliği ile üretilmiş özel tasarım nargile takımları ve orijinal Rus nargile ekipmanları. Geleneksel zanaat, modern tasarımla buluşuyor.",
        image: "/images/hero/slide-2.jpg",
        ctaText: "Ürünleri Keşfet",
        ctaLink: "/urunler",
        position: "left",
        order: 0,
      },
      {
        title: "Rus Koleksiyonu",
        subtitle: "Orijinal İthalat",
        description: "Doğrudan Rusya'dan ithal edilen orijinal nargile takımları. Yüzyıllık geleneğin modern yorumu.",
        image: "/images/hero/slide-2.jpg",
        ctaText: "Koleksiyonu İncele",
        ctaLink: "/urunler",
        position: "center",
        order: 1,
      },
      {
        title: "El İşçiliği",
        subtitle: "Ustaların Eseri",
        description: "Her bir ürün, ustalarımızın yılların deneyimiyle şekillenen titiz çalışmasının ürünüdür.",
        image: "/images/hero/slide-3.jpg",
        ctaText: "Hikayemizi Keşfet",
        ctaLink: "/hakkimizda",
        position: "right",
        order: 2,
      },
    ];

    for (const slide of heroSlides) {
      await prisma.heroSlide.create({
        data: slide,
      });
    }
    console.log("✅ Hero slides eklendi");

    // 8. İletişim Bilgileri (contact_info tablosu)
    const existingContact = await prisma.contactInfo.findFirst();
    if (!existingContact) {
      await prisma.contactInfo.create({
        data: {
          email: "info@aychookah.com",
          phone: "+90 XXX XXX XX XX",
          whatsapp: "905XXXXXXXXX",
          address: "İstanbul, Türkiye",
          workingHours: "Pzt - Cum: 09:00 - 18:00",
          footerDescription:
            "Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın buluştuğu profesyonel nargile deneyimi.",
        },
      });
      console.log("✅ İletişim bilgileri (contact_info) eklendi");
    }

    console.log("🎉 Tüm içerik başarıyla seed edildi!");
    return { success: true, message: "Seed başarıyla tamamlandı" };
  } catch (error: any) {
    console.error("❌ Seed hatası:", error);
    throw new Error(error.message || "Seed işlemi sırasında bir hata oluştu");
  }
}

