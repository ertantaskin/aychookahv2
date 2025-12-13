import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import ComingSoonHMD from "@/components/home/ComingSoonHMD";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CraftsmanshipSection from "@/components/home/CraftsmanshipSection";
import RussianHeritage from "@/components/home/RussianHeritage";
import CTASection from "@/components/home/CTASection";
import { getPageMetadata } from "@/lib/seo";
import { OrganizationStructuredData, BreadcrumbStructuredData, WebSiteStructuredData } from "@/components/seo/StructuredData";
import { getSiteSEO } from "@/lib/actions/seo";
import { getHeroSlides } from "@/lib/actions/admin/hero";

// Cache'i devre dışı bırak - her istekte yeniden oluştur
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const pageMetadata = await getPageMetadata("/");
  if (pageMetadata) {
    return pageMetadata;
  }

  // Fallback metadata
  const siteSEO = await getSiteSEO();
  const baseUrl = siteSEO.siteUrl;
  
  return {
    title: "Ana Sayfa",
    description: "Aychookah - Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın profesyonel buluşması.",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: baseUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      title: "Ana Sayfa",
      description: "Aychookah - Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın profesyonel buluşması.",
      url: baseUrl,
      siteName: siteSEO.siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: "Ana Sayfa",
      description: "Aychookah - Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın profesyonel buluşması.",
    },
  };
}

const HomePage: React.FC = async () => {
  let siteSEO;
  try {
    siteSEO = await getSiteSEO();
  } catch (error) {
    console.error('Error fetching site SEO:', error);
    // Fallback values
    siteSEO = {
      siteName: 'Aychookah',
      siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://aychookah.com',
      siteDescription: 'Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları',
      ogImage: undefined,
    };
  }

  // Load hero slides server-side
  let heroSlides = [];
  try {
    heroSlides = await getHeroSlides();
  } catch (error) {
    console.error('Error fetching hero slides:', error);
  }

  const baseUrl = siteSEO?.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://aychookah.com';

  // Organization structured data
  const organizationData = {
    name: siteSEO?.siteName || 'Aychookah',
    url: baseUrl,
    description: siteSEO?.siteDescription || 'Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları',
    logo: siteSEO?.ogImage || undefined,
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    itemListElement: [
      {
        position: 1,
        name: "Ana Sayfa",
        item: baseUrl,
      },
    ],
  };

  // WebSite structured data
  const websiteData = {
    url: baseUrl,
    name: siteSEO?.siteName || 'Aychookah',
    description: siteSEO?.siteDescription || 'Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları',
    potentialAction: {
      target: `${baseUrl}/urunler?arama={search_term_string}`,
      queryInput: "required name=search_term_string",
    },
  };

  return (
    <>
      <OrganizationStructuredData data={organizationData} />
      <WebSiteStructuredData data={websiteData} />
      <BreadcrumbStructuredData data={breadcrumbData} />
      <Hero slides={heroSlides} />
      <ComingSoonHMD />
      <FeaturedProducts />
      <CraftsmanshipSection />
      <RussianHeritage />
      <CTASection />
    </>
  );
};

export default HomePage;

