"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Admin kontrolü
const checkAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Yetkisiz erişim");
  }
  return session.user.id;
};

// Seçili öne çıkan ürünleri getir
export const getFeaturedProductsForSelection = async () => {
  await checkAdmin();

  try {
    // Sıralama bilgisini al
    const orderSettings = await prisma.storeSettings.findUnique({
      where: { key: "featuredProductsOrder" },
    });

    const orderArray = orderSettings?.config && typeof orderSettings.config === 'object' && 'order' in orderSettings.config
      ? (orderSettings.config as any).order as string[]
      : null;

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        isFeatured: true,
        category: {
          select: {
            name: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            url: true,
            alt: true,
          },
        },
      },
    });

    // Sıralama bilgisi varsa ona göre sırala
    if (orderArray && orderArray.length > 0) {
      const productMap = new Map(products.map(p => [p.id, p]));
      const orderedProducts = orderArray
        .map(id => productMap.get(id))
        .filter((p): p is typeof products[0] => p !== undefined);
      
      // Sıralama bilgisinde olmayan ürünleri sona ekle
      const remainingProducts = products.filter(p => !orderArray.includes(p.id));
      return [...orderedProducts, ...remainingProducts];
    }

    // Sıralama bilgisi yoksa isme göre sırala
    return products.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    throw new Error("Öne çıkan ürünler yüklenirken bir hata oluştu");
  }
};

// Son ürünleri getir (varsayılan liste için)
export const getRecentProductsForSelection = async (limit: number = 20) => {
  await checkAdmin();

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        isFeatured: true,
        category: {
          select: {
            name: true,
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            url: true,
            alt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return products;
  } catch (error) {
    console.error("Error fetching recent products:", error);
    throw new Error("Ürünler yüklenirken bir hata oluştu");
  }
};

// Ürünleri arama ve sayfalama ile getir
export const searchProductsForSelection = async (
  searchQuery?: string,
  page: number = 1,
  limit: number = 20
) => {
  await checkAdmin();

  try {
    const skip = (page - 1) * limit;
    const where: any = {
      isActive: true,
    };

    // Arama filtresi
    if (searchQuery && searchQuery.trim() !== "") {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { slug: { contains: searchQuery, mode: "insensitive" } },
        {
          category: {
            name: { contains: searchQuery, mode: "insensitive" },
          },
        },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          isFeatured: true,
          category: {
            select: {
              name: true,
            },
          },
          images: {
            where: { isPrimary: true },
            take: 1,
            select: {
              url: true,
              alt: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error searching products:", error);
    throw new Error("Ürünler aranırken bir hata oluştu");
  }
};

// Öne çıkan ürünleri güncelle
export const updateFeaturedProducts = async (productIds: string[]) => {
  await checkAdmin();

  try {
    // Önce tüm ürünlerin isFeatured değerini false yap
    await prisma.product.updateMany({
      data: {
        isFeatured: false,
      },
    });

    // Seçilen ürünlerin isFeatured değerini true yap
    if (productIds.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: { in: productIds },
        },
        data: {
          isFeatured: true,
        },
      });

      // Sıralama bilgisini StoreSettings'te sakla
      await prisma.storeSettings.upsert({
        where: { key: "featuredProductsOrder" },
        update: {
          config: { order: productIds } as any,
        },
        create: {
          key: "featuredProductsOrder",
          config: { order: productIds } as any,
        },
      });
    } else {
      // Eğer hiç ürün seçilmediyse sıralama bilgisini de temizle
      await prisma.storeSettings.deleteMany({
        where: { key: "featuredProductsOrder" },
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/urunler/one-cikan");

    return { success: true };
  } catch (error) {
    console.error("Error updating featured products:", error);
    throw new Error("Öne çıkan ürünler güncellenirken bir hata oluştu");
  }
};

