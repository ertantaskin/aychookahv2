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

// Medya listesi getir
export const getMediaList = async (
  page: number = 1,
  limit: number = 20,
  search?: string,
  type?: string
) => {
  await checkAdmin();

  try {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (type) {
      where.type = type;
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.media.count({ where }),
    ]);

    return {
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching media list:", error);
    throw new Error("Medya listesi yüklenirken bir hata oluştu");
  }
};

// Tek medya getir
export const getMediaById = async (id: string) => {
  await checkAdmin();

  try {
    const media = await prisma.media.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!media) {
      throw new Error("Medya bulunamadı");
    }

    return media;
  } catch (error) {
    console.error("Error fetching media:", error);
    throw new Error("Medya yüklenirken bir hata oluştu");
  }
};

// Medya oluştur (upload tamamlandıktan sonra)
export const createMedia = async (data: {
  name: string;
  url: string;
  type: string;
  size: number;
  mimeType: string;
  alt?: string;
  description?: string;
}) => {
  const userId = await checkAdmin();

  try {
    const media = await prisma.media.create({
      data: {
        name: data.name,
        url: data.url,
        type: data.type,
        size: data.size,
        mimeType: data.mimeType,
        alt: data.alt || null,
        description: data.description || null,
        uploadedBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/admin/medya");
    return { success: true, media };
  } catch (error) {
    console.error("Error creating media:", error);
    throw new Error("Medya oluşturulurken bir hata oluştu");
  }
};

// Medya sil
export const deleteMedia = async (id: string) => {
  await checkAdmin();

  try {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new Error("Medya bulunamadı");
    }

    // Check if media is being used
    if (media.usageCount > 0) {
      throw new Error("Bu medya kullanımda olduğu için silinemez");
    }

    // Note: R2 deletion is handled in API route
    // This function only handles database deletion

    await prisma.media.delete({
      where: { id },
    });

    revalidatePath("/admin/medya");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting media:", error);
    throw new Error(error.message || "Medya silinirken bir hata oluştu");
  }
};

// Medya kullanım sayısını güncelle
export const updateMediaUsage = async (id: string, increment: boolean = true) => {
  await checkAdmin();

  try {
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new Error("Medya bulunamadı");
    }

    await prisma.media.update({
      where: { id },
      data: {
        usageCount: increment
          ? { increment: 1 }
          : { decrement: 1 },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating media usage:", error);
    throw new Error("Medya kullanım sayısı güncellenirken bir hata oluştu");
  }
};

// Medya güncelle (alt text, description vb.)
export const updateMedia = async (
  id: string,
  data: {
    alt?: string;
    description?: string;
    name?: string;
  }
) => {
  await checkAdmin();

  try {
    const media = await prisma.media.update({
      where: { id },
      data: {
        alt: data.alt !== undefined ? (data.alt.trim() || null) : undefined,
        description: data.description !== undefined ? (data.description.trim() || null) : undefined,
        name: data.name || undefined,
      },
    });

    revalidatePath("/admin/medya");
    return { success: true, media };
  } catch (error) {
    console.error("Error updating media:", error);
    throw new Error("Medya güncellenirken bir hata oluştu");
  }
};

