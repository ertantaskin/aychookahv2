import { Metadata } from "next";
import { getSiteSEO, getPageSEO } from "@/lib/actions/seo";
import { DefaultSeo, NextSeo } from "next-seo";

export async function getDefaultMetadata(): Promise<Metadata> {
  const siteSEO = await getSiteSEO();

  return {
    title: {
      default: siteSEO.defaultTitle,
      template: `%s | ${siteSEO.siteName}`,
    },
    description: siteSEO.defaultDescription,
    keywords: siteSEO.defaultKeywords?.split(",").map((k) => k.trim()),
    metadataBase: new URL(siteSEO.siteUrl),
    icons: siteSEO.favicon ? {
      icon: siteSEO.favicon,
      shortcut: siteSEO.favicon,
      apple: siteSEO.favicon,
    } : undefined,
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: siteSEO.siteUrl,
      siteName: siteSEO.siteName,
      title: siteSEO.defaultTitle,
      description: siteSEO.defaultDescription,
      images: siteSEO.ogImage
        ? [
            {
              url: siteSEO.ogImage,
              width: 1200,
              height: 630,
              alt: siteSEO.siteName,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: siteSEO.defaultTitle,
      description: siteSEO.defaultDescription,
      images: siteSEO.ogImage ? [siteSEO.ogImage] : [],
      ...(siteSEO.twitterHandle && { site: siteSEO.twitterHandle }),
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
    ...(siteSEO.googleSiteVerification && {
      verification: {
        google: siteSEO.googleSiteVerification,
        ...(siteSEO.bingVerification && { other: { "msvalidate.01": siteSEO.bingVerification } }),
      },
    }),
  };
}

export async function getPageMetadata(pagePath: string): Promise<Metadata | null> {
  const pageSEO = await getPageSEO(pagePath);
  if (!pageSEO) return null;

  const siteSEO = await getSiteSEO();
  const baseUrl = siteSEO.siteUrl;

  const metadata: Metadata = {
    title: pageSEO.title || pageSEO.pageName,
    description: pageSEO.description || undefined,
    keywords: pageSEO.keywords?.split(",").map((k) => k.trim()),
    alternates: {
      canonical: pageSEO.canonical || `${baseUrl}${pageSEO.pagePath}`,
    },
    robots: {
      index: !pageSEO.noindex,
      follow: !pageSEO.nofollow,
      googleBot: {
        index: !pageSEO.noindex,
        follow: !pageSEO.nofollow,
      },
    },
    openGraph: {
      type: (pageSEO.ogType as "website" | "article" | "product") || "website",
      title: pageSEO.ogTitle || pageSEO.title || pageSEO.pageName,
      description: pageSEO.ogDescription || pageSEO.description || undefined,
      images: pageSEO.ogImage
        ? [
            {
              url: pageSEO.ogImage,
              width: 1200,
              height: 630,
              alt: pageSEO.ogTitle || pageSEO.pageName,
            },
          ]
        : [],
    },
  };

  return metadata;
}

export function getDefaultSeoConfig(siteSEO: any) {
  return {
    title: siteSEO.defaultTitle,
    description: siteSEO.defaultDescription,
    canonical: siteSEO.siteUrl,
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: siteSEO.siteUrl,
      siteName: siteSEO.siteName,
      title: siteSEO.defaultTitle,
      description: siteSEO.defaultDescription,
      images: siteSEO.ogImage
        ? [
            {
              url: siteSEO.ogImage,
              width: 1200,
              height: 630,
              alt: siteSEO.siteName,
            },
          ]
        : [],
    },
    twitter: {
      handle: siteSEO.twitterHandle || undefined,
      site: siteSEO.twitterHandle || undefined,
      cardType: "summary_large_image",
    },
    facebook: {
      appId: siteSEO.facebookAppId || undefined,
    },
  };
}

