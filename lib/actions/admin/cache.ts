"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Tüm site cache'ini temizler
 * Admin yetkisi gerektirir
 */
export async function clearAllCache() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Yetkisiz erişim");
  }

  try {
    // Tüm önemli path'leri revalidate et
    const pathsToRevalidate = [
      "/",
      "/urunler",
      "/hakkimizda",
      "/iletisim",
      "/sepet",
      "/hesabim",
      "/hesabim/profil",
      "/hesabim/adresler",
      "/hesabim/siparisler",
      "/admin",
      "/admin/urunler",
      "/admin/siparisler",
      "/admin/kullanicilar",
      "/admin/yorumlar",
      "/admin/medya",
      "/admin/odeme-sistemleri",
      "/admin/seo",
    ];

    // Her path'i revalidate et (Next.js otomatik olarak hem layout hem page'i revalidate eder)
    pathsToRevalidate.forEach((path) => {
      revalidatePath(path);
    });

    // Tüm ürün sayfalarını revalidate et
    const products = await prisma.product.findMany({
      select: { slug: true },
    });

    products.forEach((product) => {
      revalidatePath(`/urun/${product.slug}`);
    });

    // Tüm kategori sayfalarını revalidate et
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });

    categories.forEach((category) => {
      revalidatePath(`/urunler?kategori=${category.slug}`);
    });

    // Sitemap'i de revalidate et
    revalidatePath("/sitemap.xml");
    revalidatePath("/sitemap-image.xml");

    return {
      success: true,
      message: `Cache başarıyla temizlendi. ${pathsToRevalidate.length + products.length + categories.length} sayfa yenilendi.`,
      revalidatedPaths: pathsToRevalidate.length + products.length + categories.length,
    };
  } catch (error) {
    console.error("Error clearing cache:", error);
    throw new Error("Cache temizlenirken bir hata oluştu");
  }
}

/**
 * Belirli bir path'in cache'ini temizler
 */
export async function clearPathCache(path: string) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Yetkisiz erişim");
  }

  try {
    revalidatePath(path);
    
    return {
      success: true,
      message: `${path} path'i başarıyla temizlendi.`,
    };
  } catch (error) {
    console.error("Error clearing path cache:", error);
    throw new Error("Path cache temizlenirken bir hata oluştu");
  }
}

