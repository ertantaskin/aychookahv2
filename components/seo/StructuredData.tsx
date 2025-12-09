"use client";

import { 
  OrganizationJsonLd, 
  ProductJsonLd, 
  BreadcrumbJsonLd, 
  ReviewJsonLd, 
  AggregateRatingJsonLd,
  LocalBusinessJsonLd,
  JsonLd,
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
  
  return (
    <ProductJsonLd
      productName={data.name}
      description={data.description}
      images={images}
      brand={data.brand}
      sku={data.sku}
      offers={{
        price: data.offers.price,
        priceCurrency: data.offers.priceCurrency,
        availability: data.offers.availability,
        url: data.offers.url,
      }}
      aggregateRating={data.aggregateRating}
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
  return (
    <ReviewJsonLd
      author={data.author}
      reviewRating={data.reviewRating}
      reviewBody={data.reviewBody}
      datePublished={data.datePublished}
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

  return (
    <JsonLd
      type="FAQPage"
      scriptKey="FAQPage"
      data={{
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
      }}
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
  return (
    <LocalBusinessJsonLd
      type="Store"
      name={data.name}
      url={data.url}
      description={data.description}
      telephone={data.telephone}
      email={data.email}
      address={{
        streetAddress: data.address?.streetAddress,
        addressLocality: data.address?.addressLocality,
        addressRegion: data.address?.addressRegion,
        postalCode: data.address?.postalCode,
        addressCountry: data.address?.addressCountry,
      }}
      geo={data.geo}
      openingHours={data.openingHours}
      priceRange={data.priceRange}
      images={data.image ? [data.image] : undefined}
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
  return (
    <JsonLd
      type="WebPage"
      scriptKey="WebPage"
      data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        url: data.url,
        name: data.name,
        description: data.description,
        potentialAction: data.potentialAction ? {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: data.potentialAction.target,
          },
          "query-input": data.potentialAction.queryInput,
        } : undefined,
      }}
    />
  );
}

