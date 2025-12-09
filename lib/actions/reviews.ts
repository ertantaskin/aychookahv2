"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, "Yorum gereklidir").max(1000, "Yorum çok uzun"),
  productId: z.string().min(1),
});

// Yorum ekle
export const addReview = async (data: {
  rating: number;
  comment: string;
  productId: string;
}) => {
  try {
    // Kullanıcı kontrolü
    const session = await auth();
    if (!session?.user || session.user.role !== "user") {
      throw new Error("Yorum yapmak için giriş yapmanız gerekiyor");
    }

    // Validasyon
    const validatedData = reviewSchema.parse(data);

    // Ürün kontrolü
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      throw new Error("Ürün bulunamadı");
    }

    // Kullanıcının daha önce bu ürün için yorum yapıp yapmadığını kontrol et
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId: validatedData.productId,
      },
    });

    if (existingReview) {
      throw new Error("Bu ürün için zaten bir yorum yaptınız");
    }

    // Yorum oluştur (isApproved: false - admin onayı bekliyor)
    const review = await prisma.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        userId: session.user.id,
        productId: validatedData.productId,
        isApproved: false,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Sayfayı yeniden doğrula
    revalidatePath(`/urun/${product.slug}`);

    return {
      success: true,
      message: "Yorumunuz gönderildi. Admin onayından sonra yayınlanacaktır.",
      review,
    };
  } catch (error) {
    console.error("Error adding review:", error);
    if (error instanceof z.ZodError) {
      throw new Error(error.errors[0].message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Yorum eklenirken bir hata oluştu");
  }
};

