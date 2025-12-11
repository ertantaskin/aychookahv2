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

  return (
    <html lang="tr" className={`${poppins.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col">
        {analyticsId && <GoogleAnalytics analyticsId={analyticsId} />}
        <Header />
        <main className={`flex-grow ${isAdminPage ? 'pt-0' : 'pt-20'} admin-main`}>
          {children}
        </main>
        <Footer />
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

