"use client";

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
    shippingDetails?: {
      shippingRate?: {
        value: number;
        currency: string;
      };
      shippingDestination?: {
        "@type"?: "DefinedRegion" | string;
        addressCountry: string;
      };
      deliveryTime?: {
        "@type"?: "ShippingDeliveryTime" | string;
        businessDays?: {
          "@type"?: "OpeningHoursSpecification" | string;
          dayOfWeek?: string[];
        };
        cutoffTime?: string;
        handlingTime?: {
          "@type"?: "QuantitativeValue" | string;
          minValue?: number;
          maxValue?: number;
          unitCode?: "DAY" | string;
        };
        transitTime?: {
          "@type"?: "QuantitativeValue" | string;
          minValue?: number;
          maxValue?: number;
          unitCode?: "DAY" | string;
        };
      };
    };
    hasMerchantReturnPolicy?: {
      "@type"?: "MerchantReturnPolicy" | string;
      applicableCountry?: string;
      returnPolicyCategory?: string;
      merchantReturnDays?: number;
      returnMethod?: string;
      returnFees?: string;
    };
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    ...(data.logo && { logo: data.logo }),
    ...(data.description && { description: data.description }),
    ...(data.contactPoint && {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: data.contactPoint.telephone,
        contactType: data.contactPoint.contactType,
        areaServed: data.contactPoint.areaServed,
      },
    }),
    ...(data.sameAs && data.sameAs.length > 0 && { sameAs: data.sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ProductStructuredData({ data }: { data: ProductData }) {
  try {
    // Ensure images array is not empty
    const images = Array.isArray(data.image) && data.image.length > 0 ? data.image : [];
    
    // Validate required fields
    if (!data.name || !data.description) {
      console.warn("ProductStructuredData: Missing required fields");
      return null;
    }
    
    // Validate offers - Google requires offers, review, or aggregateRating
    const offerPrice = Number(data.offers.price) || 0;
    const hasValidOffer = offerPrice > 0 && data.offers.priceCurrency;
    
    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: String(data.name),
      description: String(data.description),
      ...(images.length > 0 && { image: images }),
      ...(data.brand && { 
        brand: {
          "@type": "Brand",
          name: String(data.brand)
        }
      }),
      ...(data.sku && { sku: String(data.sku) }),
    };

    // Offers - Google'ın zorunlu alanı (mutlaka ekle)
    // Eğer price 0 ise bile minimum bir offer ekle (Google gereksinimi)
    jsonLd.offers = {
      "@type": "Offer",
      price: hasValidOffer ? offerPrice : 1, // Minimum 1 TRY (geçersiz fiyat için)
      priceCurrency: String(data.offers.priceCurrency || "TRY"),
      availability: `https://schema.org/${data.offers.availability || "InStock"}`, // Google'ın beklediği format
      ...(data.offers.url && data.offers.url.trim() && { url: String(data.offers.url) }),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: "https://schema.org/NewCondition",
      // Shipping Details (isteğe bağlı ama Google öneriyor)
      ...(data.offers.shippingDetails && {
        shippingDetails: {
          "@type": "OfferShippingDetails",
          ...(data.offers.shippingDetails.shippingRate && {
            shippingRate: {
              "@type": "MonetaryAmount",
              value: Number(data.offers.shippingDetails.shippingRate.value) || 0,
              currency: String(data.offers.shippingDetails.shippingRate.currency || "TRY"),
            },
          }),
          ...(data.offers.shippingDetails.shippingDestination && {
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: String(data.offers.shippingDetails.shippingDestination.addressCountry || "TR"),
            },
          }),
          ...(data.offers.shippingDetails.deliveryTime && {
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              ...(data.offers.shippingDetails.deliveryTime.businessDays && {
                businessDays: {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: Array.isArray(data.offers.shippingDetails.deliveryTime.businessDays.dayOfWeek)
                    ? data.offers.shippingDetails.deliveryTime.businessDays.dayOfWeek
                    : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                },
              }),
              ...(data.offers.shippingDetails.deliveryTime.cutoffTime && {
                cutoffTime: String(data.offers.shippingDetails.deliveryTime.cutoffTime),
              }),
              ...(data.offers.shippingDetails.deliveryTime.handlingTime && {
                handlingTime: {
                  "@type": "QuantitativeValue",
                  minValue: Number(data.offers.shippingDetails.deliveryTime.handlingTime.minValue) || 0,
                  maxValue: Number(data.offers.shippingDetails.deliveryTime.handlingTime.maxValue) || 1,
                  unitCode: "DAY",
                },
              }),
              ...(data.offers.shippingDetails.deliveryTime.transitTime && {
                transitTime: {
                  "@type": "QuantitativeValue",
                  minValue: Number(data.offers.shippingDetails.deliveryTime.transitTime.minValue) || 1,
                  maxValue: Number(data.offers.shippingDetails.deliveryTime.transitTime.maxValue) || 3,
                  unitCode: "DAY",
                },
              }),
            },
          }),
        },
      }),
      // Merchant Return Policy (isteğe bağlı ama Google öneriyor)
      ...(data.offers.hasMerchantReturnPolicy && {
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: String(data.offers.hasMerchantReturnPolicy.applicableCountry || "TR"),
          returnPolicyCategory: String(data.offers.hasMerchantReturnPolicy.returnPolicyCategory || "https://schema.org/MerchantReturnFiniteReturnWindow"),
          ...(data.offers.hasMerchantReturnPolicy.merchantReturnDays && {
            merchantReturnDays: Number(data.offers.hasMerchantReturnPolicy.merchantReturnDays) || 14,
          }),
          ...(data.offers.hasMerchantReturnPolicy.returnMethod && {
            returnMethod: String(data.offers.hasMerchantReturnPolicy.returnMethod || "https://schema.org/ReturnByMail"),
          }),
          ...(data.offers.hasMerchantReturnPolicy.returnFees && {
            returnFees: String(data.offers.hasMerchantReturnPolicy.returnFees || "https://schema.org/FreeReturn"),
          }),
        },
      }),
    };

    // AggregateRating - Google'ın zorunlu alanı (offers yoksa)
    if (data.aggregateRating && data.aggregateRating.ratingValue > 0) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: Number(data.aggregateRating.ratingValue),
        reviewCount: Number(data.aggregateRating.reviewCount) || 0,
        bestRating: 5,
        worstRating: 1,
      };
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  } catch (error) {
    console.error("Error generating ProductStructuredData:", error);
    return null; // Hata durumunda hiçbir şey render etme
  }
}

export function BreadcrumbStructuredData({ data }: { data: BreadcrumbData }) {
  try {
    // Ensure itemListElement is defined and is an array
    if (!data || !data.itemListElement || !Array.isArray(data.itemListElement) || data.itemListElement.length === 0) {
      return null;
    }

    // Transform to the format expected by schema.org
    const items = data.itemListElement
      .sort((a, b) => a.position - b.position) // Sort by position
      .map((item) => ({
        "@type": "ListItem",
        position: Number(item.position) || 0,
        name: String(item.name || ""),
        item: String(item.item || ""),
      }))
      .filter(item => item.name && item.item); // Geçersiz item'ları filtrele

    if (items.length === 0) {
      return null;
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  } catch (error) {
    console.error("Error generating BreadcrumbStructuredData:", error);
    return null; // Hata durumunda hiçbir şey render etme
  }
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
  itemUrl,
  offers, // Offers ekle - Google gereksinimi
}: {
  itemReviewed: string;
  ratingValue: number;
  reviewCount: number;
  itemUrl?: string;
  offers?: {
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
  };
}) {
  try {
    // Veriler sistemden geliyor (prop'lar üzerinden)
    // Eğer rating yoksa veya geçersizse render etme
    if (!ratingValue || ratingValue <= 0 || reviewCount <= 0) {
      return null;
    }

    const jsonLd: any = {
      "@context": "https://schema.org",
      "@type": "AggregateRating",
      itemReviewed: {
        "@type": "Product",
        name: itemReviewed,
        ...(itemUrl && { url: itemUrl }),
        // Offers ekle - Google gereksinimi (offers, review veya aggregateRating zorunlu)
        ...(offers && {
          offers: {
            "@type": "Offer",
            price: Number(offers.price) || 1,
            priceCurrency: String(offers.priceCurrency || "TRY"),
            availability: `https://schema.org/${offers.availability || "InStock"}`,
            ...(offers.url && offers.url.trim() && { url: String(offers.url) }),
            priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            itemCondition: "https://schema.org/NewCondition",
          },
        }),
      },
      ratingValue: Number(ratingValue.toFixed(1)), // Virgülden sonra 1 basamak
      reviewCount: Number(reviewCount),
      bestRating: 5,
      worstRating: 1,
    };

    // Eğer offers yoksa, minimum bir offer ekle (Google gereksinimi)
    if (!offers && jsonLd.itemReviewed) {
      jsonLd.itemReviewed.offers = {
        "@type": "Offer",
        price: 1,
        priceCurrency: "TRY",
        availability: "https://schema.org/InStock",
        ...(itemUrl && { url: itemUrl }),
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        itemCondition: "https://schema.org/NewCondition",
      };
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  } catch (error) {
    console.error("Error generating AggregateRatingStructuredData:", error);
    return null;
  }
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
    "@type": "WebSite",
    url: data.url,
    name: data.name,
    ...(data.description && { description: data.description }),
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

interface CollectionPageData {
  name: string;
  description?: string;
  url: string;
  image?: string;
  numberOfItems?: number;
}

export function CollectionPageStructuredData({ data }: { data: CollectionPageData }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.name,
    ...(data.description && { description: data.description }),
    url: data.url,
    ...(data.image && { image: data.image }),
    ...(data.numberOfItems !== undefined && { numberOfItems: data.numberOfItems }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

