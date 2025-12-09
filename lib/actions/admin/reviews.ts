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

// Tüm yorumları getir (onaylanmış ve onay bekleyen)
export const getAllReviews = async () => {
  try {
    await checkAdmin();

    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw new Error("Yorumlar yüklenirken bir hata oluştu");
  }
};

// Onay bekleyen yorumları getir
export const getPendingReviews = async () => {
  try {
    await checkAdmin();

    const reviews = await prisma.review.findMany({
      where: {
        isApproved: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return reviews;
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    throw new Error("Yorumlar yüklenirken bir hata oluştu");
  }
};

// Yorumu onayla
export const approveReview = async (reviewId: string) => {
  try {
    await checkAdmin();

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        product: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!review) {
      throw new Error("Yorum bulunamadı");
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        isApproved: true,
      },
    });

    revalidatePath(`/urun/${review.product.slug}`);
    revalidatePath("/admin/yorumlar");

    return { success: true, message: "Yorum onaylandı" };
  } catch (error) {
    console.error("Error approving review:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Yorum onaylanırken bir hata oluştu");
  }
};

// Yorumu reddet/sil
export const rejectReview = async (reviewId: string) => {
  try {
    await checkAdmin();

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error("Yorum bulunamadı");
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    revalidatePath("/admin/yorumlar");

    return { success: true, message: "Yorum silindi" };
  } catch (error) {
    console.error("Error rejecting review:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Yorum silinirken bir hata oluştu");
  }
};

// Yorumu onaydan çıkar (onaylı yorumu beklemeye al)
export const unapproveReview = async (reviewId: string) => {
  try {
    await checkAdmin();

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        product: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!review) {
      throw new Error("Yorum bulunamadı");
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        isApproved: false,
      },
    });

    revalidatePath(`/urun/${review.product.slug}`);
    revalidatePath("/admin/yorumlar");

    return { success: true, message: "Yorum onaydan çıkarıldı" };
  } catch (error) {
    console.error("Error unapproving review:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Yorum onaydan çıkarılırken bir hata oluştu");
  }
};

// Toplu işlemler
export const bulkApproveReviews = async (reviewIds: string[]) => {
  try {
    await checkAdmin();

    if (reviewIds.length === 0) {
      throw new Error("Hiç yorum seçilmedi");
    }

    await prisma.review.updateMany({
      where: {
        id: { in: reviewIds },
      },
      data: {
        isApproved: true,
      },
    });

    revalidatePath("/admin/yorumlar");

    return { success: true, message: `${reviewIds.length} yorum onaylandı` };
  } catch (error) {
    console.error("Error bulk approving reviews:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Yorumlar onaylanırken bir hata oluştu");
  }
};

export const bulkUnapproveReviews = async (reviewIds: string[]) => {
  try {
    await checkAdmin();

    if (reviewIds.length === 0) {
      throw new Error("Hiç yorum seçilmedi");
    }

    await prisma.review.updateMany({
      where: {
        id: { in: reviewIds },
      },
      data: {
        isApproved: false,
      },
    });

    revalidatePath("/admin/yorumlar");

    return { success: true, message: `${reviewIds.length} yorum onaydan çıkarıldı` };
  } catch (error) {
    console.error("Error bulk unapproving reviews:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Yorumlar onaydan çıkarılırken bir hata oluştu");
  }
};

export const bulkDeleteReviews = async (reviewIds: string[]) => {
  try {
    await checkAdmin();

    if (reviewIds.length === 0) {
      throw new Error("Hiç yorum seçilmedi");
    }

    await prisma.review.deleteMany({
      where: {
        id: { in: reviewIds },
      },
    });

    revalidatePath("/admin/yorumlar");

    return { success: true, message: `${reviewIds.length} yorum silindi` };
  } catch (error) {
    console.error("Error bulk deleting reviews:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Yorumlar silinirken bir hata oluştu");
  }
};

