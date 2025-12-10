"use client";

import { 
  OrganizationJsonLd, 
  BreadcrumbJsonLd, 
  AggregateRatingJsonLd,
} from "next-seo";

interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
    areaServed: string;
  };
  sameAs?: string[];
}

interface ProductData {
  name: string;
  description: string;
  image: string[];
  brand?: string;
  sku?: string;
  offers: {
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

interface BreadcrumbData {
  itemListElement: Array<{
    position: number;
    name: string;
    item: string;
  }>;
}

interface BreadcrumbListItem {
  name: string;
  item: string;
}

interface ReviewData {
  author: string;
  reviewRating: {
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  reviewBody?: string;
  datePublished?: string;
}

export function OrganizationStructuredData({ data }: { data: OrganizationData }) {
  return (
    <OrganizationJsonLd
      type="Organization"
      name={data.name}
      url={data.url}
      logo={data.logo}
      description={data.description}
      contactPoint={data.contactPoint}
      sameAs={data.sameAs}
    />
  );
}

export function ProductStructuredData({ data }: { data: ProductData }) {
  // Ensure images array is not empty
  const images = Array.isArray(data.image) && data.image.length > 0 ? data.image : [];
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description: data.description,
    image: images,
    ...(data.brand && { brand: data.brand }),
    ...(data.sku && { sku: data.sku }),
    offers: {
      "@type": "Offer",
      price: data.offers.price,
      priceCurrency: data.offers.priceCurrency,
      availability: `https://schema.org/${data.offers.availability}`,
      url: data.offers.url,
    },
    ...(data.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: data.aggregateRating.ratingValue,
        reviewCount: data.aggregateRating.reviewCount,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbStructuredData({ data }: { data: BreadcrumbData }) {
  // Ensure itemListElement is defined and is an array
  if (!data || !data.itemListElement || !Array.isArray(data.itemListElement) || data.itemListElement.length === 0) {
    return null;
  }

  // Transform to the format expected by next-seo (items prop with BreadcrumbListItem[])
  const items: BreadcrumbListItem[] = data.itemListElement
    .sort((a, b) => a.position - b.position) // Sort by position
    .map((item) => ({
      name: item.name,
      item: item.item,
    }));

  return (
    <BreadcrumbJsonLd
      items={items}
    />
  );
}

export function ReviewStructuredData({ data }: { data: ReviewData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: data.author,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: data.reviewRating.ratingValue,
      bestRating: data.reviewRating.bestRating || 5,
      worstRating: data.reviewRating.worstRating || 1,
    },
    ...(data.reviewBody && { reviewBody: data.reviewBody }),
    ...(data.datePublished && { datePublished: data.datePublished }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function AggregateRatingStructuredData({
  itemReviewed,
  ratingValue,
  reviewCount,
}: {
  itemReviewed: string;
  ratingValue: number;
  reviewCount: number;
}) {
  return (
    <AggregateRatingJsonLd
      itemReviewed={itemReviewed}
      ratingValue={ratingValue}
      reviewCount={reviewCount}
    />
  );
}

interface FAQData {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export function FAQStructuredData({ data }: { data: FAQData }) {
  if (!data.questions || data.questions.length === 0) {
    return null;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface LocalBusinessData {
  name: string;
  url: string;
  description?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  priceRange?: string;
  image?: string;
}

export function LocalBusinessStructuredData({ data }: { data: LocalBusinessData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: data.name,
    url: data.url,
    ...(data.description && { description: data.description }),
    ...(data.telephone && { telephone: data.telephone }),
    ...(data.email && { email: data.email }),
    ...(data.address && {
      address: {
        "@type": "PostalAddress",
        ...(data.address.streetAddress && { streetAddress: data.address.streetAddress }),
        ...(data.address.addressLocality && { addressLocality: data.address.addressLocality }),
        ...(data.address.addressRegion && { addressRegion: data.address.addressRegion }),
        ...(data.address.postalCode && { postalCode: data.address.postalCode }),
        ...(data.address.addressCountry && { addressCountry: data.address.addressCountry }),
      },
    }),
    ...(data.geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: data.geo.latitude,
        longitude: data.geo.longitude,
      },
    }),
    ...(data.openingHours && { openingHours: data.openingHours }),
    ...(data.priceRange && { priceRange: data.priceRange }),
    ...(data.image && { image: data.image }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface WebSiteData {
  url: string;
  name: string;
  description?: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

export function WebSiteStructuredData({ data }: { data: WebSiteData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: data.url,
    name: data.name,
    description: data.description,
    ...(data.potentialAction && {
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: data.potentialAction.target,
        },
        "query-input": data.potentialAction.queryInput,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

