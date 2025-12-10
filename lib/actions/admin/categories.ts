"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

// Kategorileri listele
export const getCategoriesForAdmin = async () => {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Yetkisiz erişim");
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Kategoriler yüklenirken bir hata oluştu");
  }
};

// Tek kategori getir
export const getCategoryForAdmin = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Yetkisiz erişim");
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error("Kategori bulunamadı");
    }

    return category;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw new Error("Kategori yüklenirken bir hata oluştu");
  }
};

// Slug'dan kategori getir
export const getCategoryBySlug = async (slug: string) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return category;
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    return null;
  }
};

// Kategori oluştur
export const createCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Yetkisiz erişim");
    }

    // Slug'un benzersiz olduğunu kontrol et
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingCategory) {
      throw new Error("Bu slug zaten kullanılıyor");
    }

    // İsim benzersizliğini kontrol et
    const existingName = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingName) {
      throw new Error("Bu kategori adı zaten kullanılıyor");
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        metaKeywords: data.metaKeywords || null,
        ogImage: data.ogImage || null,
      },
    });

    revalidatePath("/admin/urunler/kategoriler");
    revalidatePath("/kategori");
    revalidatePath("/urunler");

    return category;
  } catch (error: any) {
    console.error("Error creating category:", error);
    throw new Error(error.message || "Kategori oluşturulurken bir hata oluştu");
  }
};

// Kategori güncelle
export const updateCategory = async (
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    seoTitle?: string;
    seoDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
  }
) => {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Yetkisiz erişim");
    }

    // Mevcut kategoriyi al
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new Error("Kategori bulunamadı");
    }

    // Slug değiştiyse benzersizliğini kontrol et
    if (data.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        throw new Error("Bu slug zaten kullanılıyor");
      }
    }

    // İsim değiştiyse benzersizliğini kontrol et
    if (data.name !== existingCategory.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: data.name },
      });

      if (nameExists) {
        throw new Error("Bu kategori adı zaten kullanılıyor");
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        metaKeywords: data.metaKeywords || null,
        ogImage: data.ogImage || null,
      },
    });

    revalidatePath("/admin/urunler/kategoriler");
    revalidatePath(`/kategori/${category.slug}`);
    revalidatePath("/kategori");
    revalidatePath("/urunler");

    return category;
  } catch (error: any) {
    console.error("Error updating category:", error);
    throw new Error(error.message || "Kategori güncellenirken bir hata oluştu");
  }
};

// Kategori sil
export const deleteCategory = async (id: string) => {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Yetkisiz erişim");
    }

    // Kategoriye ait ürün var mı kontrol et
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new Error("Kategori bulunamadı");
    }

    if (category._count.products > 0) {
      throw new Error(
        `Bu kategoriye ait ${category._count.products} ürün bulunuyor. Önce ürünleri silin veya başka bir kategoriye taşıyın.`
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/urunler/kategoriler");
    revalidatePath("/kategori");
    revalidatePath("/urunler");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    throw new Error(error.message || "Kategori silinirken bir hata oluştu");
  }
};

