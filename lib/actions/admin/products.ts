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

// Ürün oluştur
export const createProduct = async (data: {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  stock: number;
  categoryId: string;
  material?: string;
  height?: string;
  equipmentType?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isActive?: boolean;
  features?: string[];
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  brand?: string;
}) => {
  await checkAdmin();

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription && data.shortDescription.trim() !== "" ? data.shortDescription : null,
        price: data.price,
        stock: data.stock,
        category: {
          connect: { id: data.categoryId },
        },
        material: data.material || null,
        height: data.height || null,
        equipmentType: data.equipmentType || null,
        isNew: data.isNew || false,
        isBestseller: data.isBestseller || false,
        isActive: data.isActive ?? true,
        seoTitle: data.seoTitle && data.seoTitle.trim() !== "" ? data.seoTitle : null,
        seoDescription: data.seoDescription && data.seoDescription.trim() !== "" ? data.seoDescription : null,
        metaKeywords: data.metaKeywords && data.metaKeywords.trim() !== "" ? data.metaKeywords : null,
        ogImage: data.ogImage && data.ogImage.trim() !== "" ? data.ogImage : null,
        brand: data.brand && data.brand.trim() !== "" ? data.brand : null,
        features: {
          create: (data.features || []).map(feature => ({ name: feature })),
        },
        images: {
          create: (data.images || []).map((img, index) => ({
            url: img.url,
            alt: img.alt,
            isPrimary: img.isPrimary || index === 0,
          })),
        },
      },
      include: {
        category: true,
        images: true,
        features: true,
      },
    });

    revalidatePath("/urunler");
    revalidatePath("/admin/urunler");
    revalidatePath(`/urun/${product.slug}`);
    return { success: true, product };
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Ürün oluşturulurken bir hata oluştu");
  }
};

// Ürün güncelle
export const updateProduct = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    price?: number;
    stock?: number;
    categoryId?: string;
    material?: string;
    height?: string;
    equipmentType?: string;
    isNew?: boolean;
    isBestseller?: boolean;
    isActive?: boolean;
    features?: string[];
    images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
    seoTitle?: string;
    seoDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
    brand?: string;
  }
) => {
  await checkAdmin();

  try {
    // Zorunlu alanları kontrol et
    if (!data.name || !data.slug || !data.description || data.price === undefined || data.stock === undefined || !data.categoryId) {
      throw new Error("Zorunlu alanlar eksik: name, slug, description, price, stock, categoryId");
    }

    // Mevcut özellikleri ve görselleri sil
    await prisma.productFeature.deleteMany({
      where: { productId: id },
    });
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    // Boş string'leri null'a çevir ve undefined kontrolü yap
    const cleanData: any = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      shortDescription: data.shortDescription && typeof data.shortDescription === 'string' && data.shortDescription.trim() !== "" ? data.shortDescription : null,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
      stock: typeof data.stock === 'string' ? parseInt(data.stock, 10) : data.stock,
      category: {
        connect: { id: data.categoryId },
      },
      material: data.material && typeof data.material === 'string' && data.material.trim() !== "" ? data.material : null,
      height: data.height && typeof data.height === 'string' && data.height.trim() !== "" ? data.height : null,
      equipmentType: data.equipmentType && typeof data.equipmentType === 'string' && data.equipmentType.trim() !== "" ? data.equipmentType : null,
      isNew: data.isNew ?? false,
      isBestseller: data.isBestseller ?? false,
      isActive: data.isActive ?? true,
      seoTitle: data.seoTitle && typeof data.seoTitle === 'string' && data.seoTitle.trim() !== "" ? data.seoTitle : null,
      seoDescription: data.seoDescription && typeof data.seoDescription === 'string' && data.seoDescription.trim() !== "" ? data.seoDescription : null,
      metaKeywords: data.metaKeywords && typeof data.metaKeywords === 'string' && data.metaKeywords.trim() !== "" ? data.metaKeywords : null,
      ogImage: data.ogImage && typeof data.ogImage === 'string' && data.ogImage.trim() !== "" ? data.ogImage : null,
      brand: data.brand && typeof data.brand === 'string' && data.brand.trim() !== "" ? data.brand : null,
      features: {
        create: (data.features || []).map(feature => ({ name: feature })),
      },
      images: {
        create: (data.images || []).map((img, index) => ({
          url: img.url,
          alt: img.alt || data.name,
          isPrimary: img.isPrimary || index === 0,
        })),
      },
    };

    const product = await prisma.product.update({
      where: { id },
      data: cleanData,
      include: {
        category: true,
        images: true,
        features: true,
      },
    });

    revalidatePath("/urunler");
    revalidatePath("/admin/urunler");
    revalidatePath(`/urun/${product.slug}`);
    return { success: true, product };
  } catch (error) {
    console.error("Error updating product:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    if (error instanceof Error) {
      throw new Error(`Ürün güncellenirken bir hata oluştu: ${error.message}`);
    }
    throw new Error("Ürün güncellenirken bir hata oluştu");
  }
};

// Ürün sil
export const deleteProduct = async (id: string) => {
  await checkAdmin();

  try {
    // Siparişlerde kullanılıp kullanılmadığını kontrol et
    const orderItemsCount = await prisma.orderItem.count({
      where: {
        productId: id,
      },
    });

    if (orderItemsCount > 0) {
      // Siparişlerde kullanılıyorsa: Önce ürün bilgilerini al
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      });

      if (product) {
        // OrderItem'lara ürün bilgilerini snapshot olarak kaydet
        // Böylece ürün silinse bile siparişlerde görünecek
        const productImageUrl = product.images[0]?.url || null;
        
        // Önce ürün bilgilerini güncelle (eğer yoksa)
        await prisma.$executeRaw`
          UPDATE order_items 
          SET 
            "productName" = ${product.name},
            "productImageUrl" = ${productImageUrl}
          WHERE "productId" = ${id} 
            AND ("productName" IS NULL OR "productImageUrl" IS NULL)
        `;

        // Şimdi productId'yi null yap
        await prisma.orderItem.updateMany({
          where: {
            productId: id,
          },
          data: {
            productId: null as any,
          },
        });
      }

      // Şimdi ürünü tamamen sil
      await prisma.product.delete({
        where: { id },
      });

      revalidatePath("/urunler");
      revalidatePath("/admin/urunler");
      return { 
        success: true, 
        softDelete: false,
        message: "Ürün başarıyla silindi. Siparişlerdeki ürün referansları kaldırıldı." 
      };
    } else {
      // Siparişlerde kullanılmıyorsa direkt sil
      await prisma.product.delete({
        where: { id },
      });

      revalidatePath("/urunler");
      revalidatePath("/admin/urunler");
      return { 
        success: true, 
        softDelete: false,
        message: "Ürün başarıyla silindi." 
      };
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Ürün silinirken bir hata oluştu");
  }
};

// Tüm ürünleri getir (admin için)
export const getAllProducts = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  categoryId?: string,
  isActive?: boolean,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
) => {
  await checkAdmin();

  try {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Arama filtresi
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Kategori filtresi
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Durum filtresi
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Sıralama
    const orderBy: any = {};
    if (sortBy === "name") {
      orderBy.name = sortOrder;
    } else if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else if (sortBy === "stock") {
      orderBy.stock = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
        orderBy,
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
    console.error("Error fetching products:", error);
    throw new Error("Ürünler yüklenirken bir hata oluştu");
  }
};

// Öne çıkan ürünleri güncelle (admin için)
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
    }

    revalidatePath("/");
    revalidatePath("/admin/urunler/one-cikan");

    return { success: true };
  } catch (error) {
    console.error("Error updating featured products:", error);
    throw new Error("Öne çıkan ürünler güncellenirken bir hata oluştu");
  }
};

// Kategorileri getir (admin için)
export const getCategories = async () => {
  await checkAdmin();

  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Kategoriler yüklenirken bir hata oluştu");
  }
};

