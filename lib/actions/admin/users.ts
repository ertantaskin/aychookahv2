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

// Tüm kullanıcıları getir
export const getAllUsers = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  role?: string,
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
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Rol filtresi
    if (role) {
      where.role = role;
    }

    // Sıralama
    const orderBy: any = {};
    if (sortBy === "name") {
      orderBy.name = sortOrder;
    } else if (sortBy === "email") {
      orderBy.email = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Kullanıcılar yüklenirken bir hata oluştu");
  }
};

// Kullanıcı sil
export const deleteUser = async (userId: string) => {
  await checkAdmin();

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/kullanicilar");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Kullanıcı silinirken bir hata oluştu");
  }
};

