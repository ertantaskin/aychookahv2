import type { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import { getPageMetadata } from "@/lib/seo";
import { getSiteSEO } from "@/lib/actions/seo";
import { BreadcrumbStructuredData, LocalBusinessStructuredData } from "@/components/seo/StructuredData";

export async function generateMetadata(): Promise<Metadata> {
  const pageMetadata = await getPageMetadata("/iletisim");
  if (pageMetadata) {
    return pageMetadata;
  }

  // Fallback metadata
  const siteSEO = await getSiteSEO();
  const baseUrl = siteSEO.siteUrl;
  
  return {
    title: "İletişim",
    description: "Aychookah ile iletişime geçin. Lüks nargile takımları ve Rus nargile ekipmanları hakkında bilgi almak için bize ulaşın.",
    keywords: ["nargile iletişim", "nargile satış", "nargile sipariş", "aychookah iletişim"],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/iletisim`,
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
      title: "İletişim",
      description: "Aychookah ile iletişime geçin. Lüks nargile takımları ve Rus nargile ekipmanları hakkında bilgi almak için bize ulaşın.",
      url: `${baseUrl}/iletisim`,
      siteName: siteSEO.siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: "İletişim",
      description: "Aychookah ile iletişime geçin. Lüks nargile takımları ve Rus nargile ekipmanları hakkında bilgi almak için bize ulaşın.",
    },
  };
}

const ContactPage: React.FC = async () => {
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
        name: "İletişim",
        item: `${baseUrl}/iletisim`,
      },
    ],
  };

  // LocalBusiness structured data
  const localBusinessData = {
    name: siteSEO.siteName,
    url: baseUrl,
    description: siteSEO.siteDescription,
    ...(siteSEO.phone && { telephone: siteSEO.phone }),
    ...(siteSEO.email && { email: siteSEO.email }),
    ...(siteSEO.address && {
      address: {
        streetAddress: siteSEO.address,
        addressLocality: siteSEO.city || undefined,
        addressCountry: siteSEO.country || "TR",
        postalCode: siteSEO.postalCode || undefined,
      },
    }),
    ...(siteSEO.latitude && siteSEO.longitude && {
      geo: {
        latitude: siteSEO.latitude,
        longitude: siteSEO.longitude,
      },
    }),
    ...(siteSEO.openingHours && { openingHours: siteSEO.openingHours.split(",") }),
    ...(siteSEO.priceRange && { priceRange: siteSEO.priceRange }),
  };

  return (
    <>
      <BreadcrumbStructuredData data={breadcrumbData} />
      {siteSEO.address && <LocalBusinessStructuredData data={localBusinessData} />}
      <ContactHero />
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;

