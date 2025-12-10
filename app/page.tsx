import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import ComingSoonHMD from "@/components/home/ComingSoonHMD";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CraftsmanshipSection from "@/components/home/CraftsmanshipSection";
import RussianHeritage from "@/components/home/RussianHeritage";
import CTASection from "@/components/home/CTASection";
import { getPageMetadata } from "@/lib/seo";
import { OrganizationStructuredData, BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import { getSiteSEO } from "@/lib/actions/seo";

export async function generateMetadata(): Promise<Metadata> {
  const pageMetadata = await getPageMetadata("/");
  if (pageMetadata) {
    return pageMetadata;
  }

  // Fallback metadata
  return {
  title: "Ana Sayfa",
  description: "Aychookah - Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın profesyonel buluşması.",
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

  return (
    <>
      <OrganizationStructuredData data={organizationData} />
      <BreadcrumbStructuredData data={breadcrumbData} />
      <Hero />
      <ComingSoonHMD />
      <FeaturedProducts />
      <CraftsmanshipSection />
      <RussianHeritage />
      <CTASection />
    </>
  );
};

export default HomePage;

