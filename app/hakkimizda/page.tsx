import type { Metadata } from "next";
import AboutHero from "@/components/about/AboutHero";
import OurStory from "@/components/about/OurStory";
import Craftsmanship from "@/components/about/Craftsmanship";
import RussianConnection from "@/components/about/RussianConnection";
import Values from "@/components/about/Values";
import { getPageMetadata } from "@/lib/seo";
import { getSiteSEO } from "@/lib/actions/seo";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  const pageMetadata = await getPageMetadata("/hakkimizda");
  if (pageMetadata) {
    return pageMetadata;
  }

  // Fallback metadata
  const siteSEO = await getSiteSEO();
  const baseUrl = siteSEO.siteUrl;
  
  return {
    title: "Hakkımızda",
    description: "Aychookah'ın hikayesi, el işçiliği felsefemiz ve Rus nargile kültürüyle olan derin bağımız. Geleneksel zanaatı modern tasarımla buluşturuyoruz.",
    keywords: ["nargile üretimi", "el yapımı nargile", "rus nargile kültürü", "nargile zanaatı", "lüks nargile üretici"],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/hakkimizda`,
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
      title: "Hakkımızda",
      description: "Aychookah'ın hikayesi, el işçiliği felsefemiz ve Rus nargile kültürüyle olan derin bağımız. Geleneksel zanaatı modern tasarımla buluşturuyoruz.",
      url: `${baseUrl}/hakkimizda`,
      siteName: siteSEO.siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: "Hakkımızda",
      description: "Aychookah'ın hikayesi, el işçiliği felsefemiz ve Rus nargile kültürüyle olan derin bağımız. Geleneksel zanaatı modern tasarımla buluşturuyoruz.",
    },
  };
}

const AboutPage: React.FC = async () => {
  const siteSEO = await getSiteSEO();
  const baseUrl = siteSEO.siteUrl;

  // Breadcrumb structured data
  const breadcrumbData = {
    itemListElement: [
      {
        position: 1,
        name: "Ana Sayfa",
        item: baseUrl,
      },
      {
        position: 2,
        name: "Hakkımızda",
        item: `${baseUrl}/hakkimizda`,
      },
    ],
  };

  return (
    <>
      <BreadcrumbStructuredData data={breadcrumbData} />
      <AboutHero />
      <OurStory />
      <Craftsmanship />
      <RussianConnection />
      <Values />
    </>
  );
};

export default AboutPage;

