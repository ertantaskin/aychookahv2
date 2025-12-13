"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod schemas
const heroSlideSchema = z.object({
  title: z.string().default(""),
  subtitle: z.string().default(""),
  description: z.string().default(""),
  image: z.string().min(1, "Resim URL'i gereklidir"),
  mobileImage: z.string().optional().nullable(),
  ctaText: z.string().default(""),
  ctaLink: z.string().default(""),
  position: z.enum(["left", "center", "right"]).default("center"),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  showContent: z.boolean().default(true),
  showOverlay: z.boolean().default(true),
});

const updateHeroSlideSchema = heroSlideSchema.partial().extend({
  id: z.string().min(1),
});

// Get all hero slides (public)
export async function getHeroSlides() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return slides;
  } catch (error) {
    console.error("Error getting hero slides:", error);
    return [];
  }
}

// Get all hero slides (admin)
export async function getAllHeroSlides() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    const slides = await prisma.heroSlide.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return slides;
  } catch (error) {
    console.error("Error getting all hero slides:", error);
    throw new Error("Hero slide'lar yüklenirken bir hata oluştu");
  }
}

// Get hero slide by ID
export async function getHeroSlideById(id: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    const slide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    return slide;
  } catch (error) {
    console.error("Error getting hero slide:", error);
    throw new Error("Hero slide yüklenirken bir hata oluştu");
  }
}

// Create hero slide
export async function createHeroSlide(data: z.infer<typeof heroSlideSchema>) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    const validatedData = heroSlideSchema.parse(data);

    const slide = await prisma.heroSlide.create({
      data: validatedData,
    });

    revalidatePath("/admin/hero");
    revalidatePath("/", "layout");
    return slide;
  } catch (error: any) {
    console.error("Error creating hero slide:", error);
    throw new Error(error.message || "Hero slide oluşturulurken bir hata oluştu");
  }
}

// Update hero slide
export async function updateHeroSlide(data: z.infer<typeof updateHeroSlideSchema>) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    const { id, ...updateData } = updateHeroSlideSchema.parse(data);

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/hero");
    revalidatePath("/", "layout");
    return slide;
  } catch (error: any) {
    console.error("Error updating hero slide:", error);
    throw new Error(error.message || "Hero slide güncellenirken bir hata oluştu");
  }
}

// Delete hero slide
export async function deleteHeroSlide(id: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    await prisma.heroSlide.delete({
      where: { id },
    });

    revalidatePath("/admin/hero");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting hero slide:", error);
    throw new Error(error.message || "Hero slide silinirken bir hata oluştu");
  }
}

// Reorder hero slides
export async function reorderHeroSlides(items: { id: string; order: number }[]) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.heroSlide.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    revalidatePath("/admin/hero");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error reordering hero slides:", error);
    throw new Error(error.message || "Hero slide sıralaması güncellenirken bir hata oluştu");
  }
}

