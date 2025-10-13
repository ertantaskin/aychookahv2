import type { Metadata } from "next";
import { Poppins, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  title: {
    default: "Aychookah - Lüks Nargile Takımları ve Aksesuarları",
    template: "%s | Aychookah"
  },
  description: "Aychookah, kendi ürettiği lüks nargile takımları ve ithal orijinal Rus nargile ekipmanlarını sunar. El işçiliği ve kaliteyi bir araya getiren profesyonel nargile deneyimi.",
  keywords: ["nargile", "rus nargile", "lüks nargile", "nargile takımı", "nargile aksesuarları", "el yapımı nargile", "orijinal rus nargile"],
  authors: [{ name: "Aychookah" }],
  creator: "Aychookah",
  publisher: "Aychookah",
  metadataBase: new URL('https://aychookah.com'),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://aychookah.com",
    siteName: "Aychookah",
    title: "Aychookah - Lüks Nargile Takımları ve Aksesuarları",
    description: "Kendi ürettiği lüks nargile takımları ve ithal orijinal Rus nargile ekipmanları.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Aychookah - Lüks Nargile Takımları",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aychookah - Lüks Nargile Takımları",
    description: "El işçiliği ve kaliteyi bir araya getiren profesyonel nargile deneyimi.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="tr" className={`${poppins.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;

