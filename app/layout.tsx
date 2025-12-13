import type { Metadata } from "next";
import { Poppins, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { getDefaultMetadata } from "@/lib/seo";
import { getSiteSEO } from "@/lib/actions/seo";
import GoogleAnalytics from "@/components/seo/GoogleAnalytics";
import { headers } from "next/headers";
import { getMenuItems, getSectionTitle, getContactInfo } from "@/lib/actions/admin/menu";
import { getHeroSlides } from "@/lib/actions/admin/hero";
import { getLogoSettingsWithFallback } from "@/lib/actions/admin/logo";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    return await getDefaultMetadata();
  } catch (error) {
    // Fallback metadata
    return {
      title: {
        default: "Aychookah - Lüks Nargile Takımları ve Aksesuarları",
        template: "%s | Aychookah"
      },
      description: "Aychookah, kendi ürettiği lüks nargile takımları ve ithal orijinal Rus nargile ekipmanlarını sunar.",
      metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://aychookah.com'),
      icons: {
        icon: '/favicon.ico',
      },
    };
  }
}

const RootLayout: React.FC<{ children: React.ReactNode }> = async ({ children }) => {
  let analyticsId: string | null = null;
  try {
    const siteSEO = await getSiteSEO();
    analyticsId = siteSEO.analyticsId;
  } catch (error) {
    console.error("Error fetching analytics ID:", error);
  }

  // Admin sayfalarını kontrol et (padding'i kaldırmak için)
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/giris";

  // Menü verilerini server-side çek (paralel olarak)
  const [headerMenu, footerLinks, footerCategories, footerSocial, footerBottom, sectionTitles, contactInfo, heroSlides, logoSettings] = await Promise.all([
    getMenuItems("header").catch(() => []),
    getMenuItems("footer-links").catch(() => []),
    getMenuItems("footer-categories").catch(() => []),
    getMenuItems("footer-social").catch(() => []),
    getMenuItems("footer-bottom").catch(() => []),
    Promise.all([
      getSectionTitle("footer-links").catch(() => null),
      getSectionTitle("footer-categories").catch(() => null),
      getSectionTitle("footer-contact").catch(() => null),
      getSectionTitle("footer-social").catch(() => null),
    ]),
    getContactInfo().catch(() => ({
      email: "info@aychookah.com",
      phone: "+90 XXX XXX XX XX",
      footerDescription: "Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın buluştuğu profesyonel nargile deneyimi.",
    })),
    getHeroSlides().catch(() => []),
    getLogoSettingsWithFallback().catch(() => ({
      headerLogo: "/images/logo/ayc-hookah-logo.png",
      footerLogo: "/images/logo/ayc-hookah-logo.png",
    })),
  ]);

  // Navigation formatı
  const navigation = headerMenu
    .filter((item) => item.isActive && item.href)
    .map((item) => ({
      name: item.label,
      href: item.href!,
    }));

  // Footer data
  const footerData = {
    links: footerLinks.filter((item) => item.isActive && item.href),
    categories: footerCategories.filter((item) => item.isActive && item.href),
    social: footerSocial.filter((item) => item.isActive),
    bottom: footerBottom.filter((item) => item.isActive && item.href),
    sectionTitles: {
      links: sectionTitles[0]?.label || "Keşfet",
      categories: sectionTitles[1]?.label || "Kategoriler",
      contact: sectionTitles[2]?.label || "İletişim",
      social: sectionTitles[3]?.label || "Bizi Takip Edin",
    },
    contactInfo,
  };

  return (
    <html lang="tr" className={`${poppins.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col">
        {analyticsId && <GoogleAnalytics analyticsId={analyticsId} />}
        <Header 
          navigation={navigation} 
          contactInfo={contactInfo} 
          headerLogo={logoSettings.headerLogo} 
        />
        <main className={`flex-grow ${isAdminPage ? 'pt-0' : 'pt-20'} admin-main`}>
          {children}
        </main>
        <Footer 
          footerData={footerData} 
          footerLogo={logoSettings.footerLogo} 
        />
        <Toaster 
          position="top-right" 
          richColors 
          offset="90px"
          expand={true}
          duration={2000}
          toastOptions={{
            style: {
              zIndex: 9999,
            },
            duration: 2000,
          }}
        />
      </body>
    </html>
  );
};

export default RootLayout;

