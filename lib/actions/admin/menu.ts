"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod schemas
const menuItemSchema = z.object({
  label: z.string().min(1, "Label gereklidir"),
  href: z.string().nullable().optional(),
  location: z.string().min(1, "Location gereklidir"),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isSectionTitle: z.boolean().default(false),
  icon: z.string().nullable().optional(),
});

const updateMenuItemSchema = menuItemSchema.partial().extend({
  id: z.string().min(1),
});

// Get menu items by location
export async function getMenuItems(location: string) {
  try {
    const items = await prisma.menuItem.findMany({
      where: {
        location,
        isSectionTitle: false,
      },
      orderBy: {
        order: "asc",
      },
    });

    return items;
  } catch (error) {
    console.error("Error getting menu items:", error);
    throw new Error("Menü öğeleri yüklenirken bir hata oluştu");
  }
}

// Get section title
export async function getSectionTitle(location: string) {
  try {
    const title = await prisma.menuItem.findFirst({
      where: {
        location: `${location}-title`,
        isSectionTitle: true,
      },
    });

    return title;
  } catch (error) {
    console.error("Error getting section title:", error);
    return null;
  }
}

// Get all menu items (for admin)
export async function getAllMenuItems() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    const items = await prisma.menuItem.findMany({
      orderBy: [
        { location: "asc" },
        { order: "asc" },
      ],
    });

    return items;
  } catch (error) {
    console.error("Error getting all menu items:", error);
    throw new Error("Menü öğeleri yüklenirken bir hata oluştu");
  }
}

// Create menu item
export async function createMenuItem(data: z.infer<typeof menuItemSchema>) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    const validatedData = menuItemSchema.parse(data);

    const item = await prisma.menuItem.create({
      data: validatedData,
    });

    revalidatePath("/admin/menu");
    revalidatePath("/", "layout");
    return item;
  } catch (error: any) {
    console.error("Error creating menu item:", error);
    throw new Error(error.message || "Menü öğesi oluşturulurken bir hata oluştu");
  }
}

// Update menu item
export async function updateMenuItem(data: z.infer<typeof updateMenuItemSchema>) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    const { id, ...updateData } = updateMenuItemSchema.parse(data);

    const item = await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/menu");
    revalidatePath("/", "layout");
    return item;
  } catch (error: any) {
    console.error("Error updating menu item:", error);
    throw new Error(error.message || "Menü öğesi güncellenirken bir hata oluştu");
  }
}

// Update section title
export async function updateSectionTitle(location: string, title: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    const titleLocation = `${location}-title`;

    // Find existing section title
    const existing = await prisma.menuItem.findFirst({
      where: {
        location: titleLocation,
        isSectionTitle: true,
      },
    });

    const item = existing
      ? await prisma.menuItem.update({
          where: { id: existing.id },
          data: {
            label: title,
          },
        })
      : await prisma.menuItem.create({
          data: {
            label: title,
            location: titleLocation,
            isSectionTitle: true,
            href: null,
            order: 0,
            isActive: true,
          },
        });

    revalidatePath("/admin/menu");
    revalidatePath("/", "layout");
    return item;
  } catch (error: any) {
    console.error("Error updating section title:", error);
    throw new Error(error.message || "Bölüm başlığı güncellenirken bir hata oluştu");
  }
}

// Delete menu item
export async function deleteMenuItem(id: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    revalidatePath("/admin/menu");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting menu item:", error);
    throw new Error(error.message || "Menü öğesi silinirken bir hata oluştu");
  }
}

// Reorder menu items
export async function reorderMenuItems(location: string, items: { id: string; order: number }[]) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    revalidatePath("/admin/menu");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error reordering menu items:", error);
    throw new Error(error.message || "Menü sıralaması güncellenirken bir hata oluştu");
  }
}

const DEFAULT_CONTACT_INFO = {
  email: "info@aychookah.com",
  phone: "+90 XXX XXX XX XX",
  address: "İstanbul, Türkiye",
  workingHours: "Pzt - Cum: 09:00 - 18:00",
  footerDescription:
    "Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın buluştuğu profesyonel nargile deneyimi.",
} as const;

// Get contact info (contact_info tablosundan)
export async function getContactInfo() {
  try {
    const row = await prisma.contactInfo.findFirst();

    if (!row) {
      return { ...DEFAULT_CONTACT_INFO };
    }

    return {
      email: row.email,
      phone: row.phone,
      address: row.address ?? DEFAULT_CONTACT_INFO.address,
      workingHours: row.workingHours ?? DEFAULT_CONTACT_INFO.workingHours,
      footerDescription: row.footerDescription ?? DEFAULT_CONTACT_INFO.footerDescription,
    };
  } catch (error) {
    console.error("Error getting contact info:", error);
    return { ...DEFAULT_CONTACT_INFO };
  }
}

// Update contact info (contact_info tablosu)
export async function updateContactInfo(data: {
  email: string;
  phone: string;
  address?: string;
  workingHours?: string;
  footerDescription: string;
}) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    const existing = await prisma.contactInfo.findFirst();

    const payload = {
      email: data.email,
      phone: data.phone,
      address: data.address ?? null,
      workingHours: data.workingHours ?? null,
      footerDescription: data.footerDescription,
    };

    const contact =
      existing
        ? await prisma.contactInfo.update({
            where: { id: existing.id },
            data: payload,
          })
        : await prisma.contactInfo.create({
            data: payload,
          });

    revalidatePath("/admin/menu");
    revalidatePath("/");
    revalidatePath("/iletisim");
    return contact;
  } catch (error: any) {
    console.error("Error updating contact info:", error);
    throw new Error(error.message || "İletişim bilgileri güncellenirken bir hata oluştu");
  }
}

