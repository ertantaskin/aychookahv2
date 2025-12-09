"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Site SEO Schema
const siteSEOSchema = z.object({
  siteName: z.string().min(1, "Site adı gereklidir"),
  siteDescription: z.string().min(1, "Site açıklaması gereklidir"),
  siteUrl: z.string().url("Geçerli bir URL giriniz"),
  defaultTitle: z.string().min(1, "Varsayılan başlık gereklidir"),
  defaultDescription: z.string().min(1, "Varsayılan açıklama gereklidir"),
  defaultKeywords: z.string().optional(),
  favicon: z.union([
    z.string().url("Geçerli bir favicon URL'i giriniz"),
    z.literal(""),
  ]).optional().transform((val) => val === "" ? undefined : val),
  ogImage: z.union([
    z.string().url("Geçerli bir görsel URL'i giriniz"),
    z.literal(""),
  ]).optional().transform((val) => val === "" ? undefined : val),
  twitterHandle: z.string().optional(),
  facebookAppId: z.string().optional(),
  instagramUrl: z.union([
    z.string().url("Geçerli bir Instagram URL'i giriniz"),
    z.literal(""),
  ]).optional().transform((val) => val === "" ? undefined : val),
  linkedinUrl: z.union([
    z.string().url("Geçerli bir LinkedIn URL'i giriniz"),
    z.literal(""),
  ]).optional().transform((val) => val === "" ? undefined : val),
  youtubeUrl: z.union([
    z.string().url("Geçerli bir YouTube URL'i giriniz"),
    z.literal(""),
  ]).optional().transform((val) => val === "" ? undefined : val),
  pinterestUrl: z.union([
    z.string().url("Geçerli bir Pinterest URL'i giriniz"),
    z.literal(""),
  ]).optional().transform((val) => val === "" ? undefined : val),
  googleSiteVerification: z.string().optional(),
  bingVerification: z.string().optional(),
  robotsTxt: z.string().optional(),
  analyticsId: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([
    z.string().email("Geçerli bir e-posta adresi giriniz"),
    z.literal(""),
  ]).optional().transform((val) => val === "" ? undefined : val),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openingHours: z.string().optional(),
  priceRange: z.string().optional(),
});

// Page SEO Schema
const pageSEOSchema = z.object({
  pagePath: z.string().min(1, "Sayfa yolu gereklidir"),
  pageName: z.string().min(1, "Sayfa adı gereklidir"),
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.union([
    z.string().url("Geçerli bir görsel URL'i giriniz"),
    z.literal(""),
  ]).optional().transform((val) => val === "" ? undefined : val),
  ogType: z.string().optional(),
  noindex: z.boolean().default(false),
  nofollow: z.boolean().default(false),
  canonical: z.union([
    z.string().url("Geçerli bir canonical URL'i giriniz"),
    z.literal(""),
  ]).optional().transform((val) => val === "" ? undefined : val),
});

export async function getSiteSEO() {
  try {
    let siteSEO = await prisma.siteSEO.findFirst();
    
    if (!siteSEO) {
      // Varsayılan değerlerle oluştur
      siteSEO = await prisma.siteSEO.create({
        data: {
          siteName: "Aychookah",
          siteDescription: "Lüks nargile takımları ve aksesuarları",
          siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://aychookah.com",
          defaultTitle: "Aychookah - Lüks Nargile Takımları",
          defaultDescription: "Aychookah, kendi ürettiği lüks nargile takımları ve ithal orijinal Rus nargile ekipmanlarını sunar.",
          defaultKeywords: "nargile, rus nargile, lüks nargile, nargile takımı",
        },
      });
    }
    
    return siteSEO;
  } catch (error) {
    console.error("Error fetching site SEO:", error);
    throw error;
  }
}

export async function updateSiteSEO(formData: FormData) {
  try {
    const data = {
      siteName: formData.get("siteName") as string,
      siteDescription: formData.get("siteDescription") as string,
      siteUrl: formData.get("siteUrl") as string,
      defaultTitle: formData.get("defaultTitle") as string,
      defaultDescription: formData.get("defaultDescription") as string,
      defaultKeywords: formData.get("defaultKeywords") as string || undefined,
      favicon: (formData.get("favicon") as string)?.trim() || undefined,
      ogImage: (formData.get("ogImage") as string)?.trim() || undefined,
      twitterHandle: formData.get("twitterHandle") as string || undefined,
      facebookAppId: formData.get("facebookAppId") as string || undefined,
      instagramUrl: (formData.get("instagramUrl") as string)?.trim() || undefined,
      linkedinUrl: (formData.get("linkedinUrl") as string)?.trim() || undefined,
      youtubeUrl: (formData.get("youtubeUrl") as string)?.trim() || undefined,
      pinterestUrl: (formData.get("pinterestUrl") as string)?.trim() || undefined,
      googleSiteVerification: formData.get("googleSiteVerification") as string || undefined,
      bingVerification: formData.get("bingVerification") as string || undefined,
      robotsTxt: formData.get("robotsTxt") as string || undefined,
      analyticsId: formData.get("analyticsId") as string || undefined,
      phone: formData.get("phone") as string || undefined,
      email: (formData.get("email") as string)?.trim() || undefined,
      address: formData.get("address") as string || undefined,
      city: formData.get("city") as string || undefined,
      country: formData.get("country") as string || undefined,
      postalCode: formData.get("postalCode") as string || undefined,
      latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : undefined,
      longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : undefined,
      openingHours: formData.get("openingHours") as string || undefined,
      priceRange: formData.get("priceRange") as string || undefined,
    };

    const validated = siteSEOSchema.parse(data);

    let siteSEO = await prisma.siteSEO.findFirst();
    
    if (siteSEO) {
      siteSEO = await prisma.siteSEO.update({
        where: { id: siteSEO.id },
        data: validated,
      });
    } else {
      siteSEO = await prisma.siteSEO.create({
        data: validated,
      });
    }

    revalidatePath("/admin/seo");
    revalidatePath("/");
    
    return { success: true, data: siteSEO };
  } catch (error) {
    console.error("Error updating site SEO:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "SEO ayarları güncellenirken bir hata oluştu" };
  }
}

export async function getPageSEO(pagePath: string) {
  try {
    const pageSEO = await prisma.pageSEO.findUnique({
      where: { pagePath },
    });
    return pageSEO;
  } catch (error) {
    console.error("Error fetching page SEO:", error);
    return null;
  }
}

export async function getAllPageSEO() {
  try {
    const pages = await prisma.pageSEO.findMany({
      orderBy: { pagePath: "asc" },
    });
    return pages;
  } catch (error) {
    console.error("Error fetching all page SEO:", error);
    return [];
  }
}

export async function createOrUpdatePageSEO(formData: FormData) {
  try {
    const data = {
      pagePath: formData.get("pagePath") as string,
      pageName: formData.get("pageName") as string,
      title: formData.get("title") as string || undefined,
      description: formData.get("description") as string || undefined,
      keywords: formData.get("keywords") as string || undefined,
      ogTitle: formData.get("ogTitle") as string || undefined,
      ogDescription: formData.get("ogDescription") as string || undefined,
      ogImage: (formData.get("ogImage") as string)?.trim() || undefined,
      ogType: formData.get("ogType") as string || "website",
      noindex: formData.get("noindex") === "on",
      nofollow: formData.get("nofollow") === "on",
      canonical: (formData.get("canonical") as string)?.trim() || undefined,
    };

    const validated = pageSEOSchema.parse(data);

    const existing = await prisma.pageSEO.findUnique({
      where: { pagePath: validated.pagePath },
    });

    let pageSEO;
    if (existing) {
      pageSEO = await prisma.pageSEO.update({
        where: { id: existing.id },
        data: validated,
      });
    } else {
      pageSEO = await prisma.pageSEO.create({
        data: validated,
      });
    }

    revalidatePath("/admin/seo");
    revalidatePath(validated.pagePath);
    
    return { success: true, data: pageSEO };
  } catch (error) {
    console.error("Error creating/updating page SEO:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Sayfa SEO ayarları kaydedilirken bir hata oluştu" };
  }
}

export async function deletePageSEO(id: string) {
  try {
    await prisma.pageSEO.delete({
      where: { id },
    });

    revalidatePath("/admin/seo");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting page SEO:", error);
    return { success: false, error: "Sayfa SEO ayarları silinirken bir hata oluştu" };
  }
}

