"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Prisma client'ın doğru yüklendiğini kontrol et
if (typeof prisma === 'undefined' || !prisma) {
  console.error("Prisma client is not initialized");
}

const faqSchema = z.object({
  question: z.string().min(1, "Soru gereklidir"),
  answer: z.string().min(1, "Cevap gereklidir"),
  pagePath: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function getFAQs(pagePath?: string) {
  try {
    // Prisma client'ı kontrol et
    if (!prisma || !prisma.faq) {
      console.error("Prisma client or faq model not available");
      return [];
    }

    const where: any = { isActive: true };
    if (pagePath) {
      where.OR = [
        { pagePath: pagePath },
        { pagePath: null }, // Genel FAQ'ler
      ];
    } else {
      where.pagePath = null; // Sadece genel FAQ'ler
    }

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return faqs;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

export async function getAllFAQs() {
  try {
    // Prisma client'ı kontrol et
    if (!prisma) {
      console.error("Prisma client is not initialized");
      return [];
    }

    // Model'in varlığını kontrol et
    if (!('faq' in prisma)) {
      console.error("FAQ model not found in Prisma client. Available models:", Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));
      return [];
    }

    const faqs = await prisma.faq.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });
    return faqs;
  } catch (error) {
    console.error("Error fetching all FAQs:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

export async function createFAQ(formData: FormData) {
  try {
    const data = {
      question: formData.get("question") as string,
      answer: formData.get("answer") as string,
      pagePath: formData.get("pagePath") as string || undefined,
      order: parseInt(formData.get("order") as string || "0"),
      isActive: formData.get("isActive") === "on",
    };

    const validated = faqSchema.parse(data);

    const faq = await prisma.faq.create({
      data: validated,
    });

    revalidatePath("/admin/seo");
    revalidatePath("/");
    
    return { success: true, data: faq };
  } catch (error) {
    console.error("Error creating FAQ:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "FAQ oluşturulurken bir hata oluştu" };
  }
}

export async function updateFAQ(id: string, formData: FormData) {
  try {
    const data = {
      question: formData.get("question") as string,
      answer: formData.get("answer") as string,
      pagePath: formData.get("pagePath") as string || undefined,
      order: parseInt(formData.get("order") as string || "0"),
      isActive: formData.get("isActive") === "on",
    };

    const validated = faqSchema.parse(data);

    const faq = await prisma.faq.update({
      where: { id },
      data: validated,
    });

    revalidatePath("/admin/seo");
    revalidatePath("/");
    
    return { success: true, data: faq };
  } catch (error) {
    console.error("Error updating FAQ:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "FAQ güncellenirken bir hata oluştu" };
  }
}

export async function deleteFAQ(id: string) {
  try {
    await prisma.faq.delete({
      where: { id },
    });

    revalidatePath("/admin/seo");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return { success: false, error: "FAQ silinirken bir hata oluştu" };
  }
}

