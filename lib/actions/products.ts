"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ProductFilters {
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  isActive?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
}

export interface ProductSort {
  field: "name" | "price" | "createdAt" | "stock";
  order: "asc" | "desc";
}

// Ürünleri listele
export const getProducts = async (
  filters?: ProductFilters,
  sort?: ProductSort,
  page: number = 1,
  limit: number = 20
) => {
  try {
    const where: any = {};

    if (filters?.categoryIds && filters.categoryIds.length > 0) {
      where.categoryId = { in: filters.categoryIds };
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters?.searchQuery) {
      where.OR = [
        { name: { contains: filters.searchQuery, mode: "insensitive" } },
        { description: { contains: filters.searchQuery, mode: "insensitive" } },
      ];
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isNew !== undefined) {
      where.isNew = filters.isNew;
    }

    if (filters?.isBestseller !== undefined) {
      where.isBestseller = filters.isBestseller;
    }

    const orderBy: any = {};
    if (sort) {
      orderBy[sort.field] = sort.order;
    } else {
      orderBy.createdAt = "desc";
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { isPrimary: "desc" },
            take: 1,
          },
          features: true,
          _count: {
            select: {
              reviews: true,
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
    // Veritabanı bağlantı hatası veya tablo yoksa boş dizi döndür
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      if (error.message.includes("does not exist") || error.message.includes("relation") || error.message.includes("connect")) {
        return {
          products: [],
          total: 0,
          page: 1,
          totalPages: 0,
        };
      }
    }
    throw new Error("Ürünler yüklenirken bir hata oluştu");
  }
};

// Tek ürün getir
export const getProduct = async (slug: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { isPrimary: "desc" },
        },
        features: true,
        reviews: {
          where: {
            isApproved: true,
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error("Ürün bulunamadı");
    }

    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Ürün yüklenirken bir hata oluştu");
  }
};

// Kategorileri getir
export const getCategories = async () => {
  try {
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
    // Veritabanı bağlantı hatası veya tablo yoksa boş dizi döndür
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      if (error.message.includes("does not exist") || error.message.includes("relation") || error.message.includes("connect")) {
        return [];
      }
    }
    throw new Error("Kategoriler yüklenirken bir hata oluştu");
  }
};

// İlgili ürünleri getir
export const getRelatedProducts = async (productId: string, categoryId: string, limit: number = 4) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
        isActive: true,
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return products;
  } catch (error) {
    console.error("Error fetching related products:", error);
    return [];
  }
};

