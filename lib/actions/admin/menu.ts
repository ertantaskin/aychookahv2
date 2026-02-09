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
  whatsapp: "905XXXXXXXXX",
  address: "İstanbul, Türkiye",
  workingHours: "Pzt - Cum: 09:00 - 18:00",
  footerDescription:
    "Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları. Kalite ve geleneksel zanaatın buluştuğu profesyonel nargile deneyimi.",
} as const;

// Get contact info (contact_info tablosundan). Tablo yoksa veya hata olursa varsayılan döner; hiçbir zaman throw etmez.
export async function getContactInfo() {
  try {
    const rows = await prisma.$queryRaw<
      { id: string; email: string; phone: string; whatsapp: string | null; address: string | null; workingHours: string | null; footerDescription: string | null }[]
    >`SELECT id, email, phone, whatsapp, address, "workingHours", "footerDescription" FROM contact_info LIMIT 1`;
    const row = Array.isArray(rows) ? rows[0] : null;

    if (!row) {
      return { ...DEFAULT_CONTACT_INFO };
    }

    return {
      email: typeof row.email === "string" ? row.email : DEFAULT_CONTACT_INFO.email,
      phone: typeof row.phone === "string" ? row.phone : DEFAULT_CONTACT_INFO.phone,
      whatsapp: row.whatsapp != null && row.whatsapp !== "" ? row.whatsapp : DEFAULT_CONTACT_INFO.whatsapp,
      address: row.address != null && row.address !== "" ? row.address : DEFAULT_CONTACT_INFO.address,
      workingHours: row.workingHours != null && row.workingHours !== "" ? row.workingHours : DEFAULT_CONTACT_INFO.workingHours,
      footerDescription: typeof row.footerDescription === "string" ? row.footerDescription : DEFAULT_CONTACT_INFO.footerDescription,
    };
  } catch (_error) {
    return { ...DEFAULT_CONTACT_INFO };
  }
}

// Update contact info (contact_info tablosu)
export async function updateContactInfo(data: {
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  workingHours?: string;
  footerDescription: string;
}) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    const contactInfoModel = (prisma as { contactInfo?: { findFirst: () => Promise<{ id: string } | null>; update: (arg: unknown) => Promise<unknown>; create: (arg: unknown) => Promise<unknown> } }).contactInfo;
    if (!contactInfoModel) {
      throw new Error("İletişim bilgileri modülü yüklü değil. Lütfen 'npx prisma generate' çalıştırın.");
    }

    const existing = await contactInfoModel.findFirst();

    const payload = {
      email: String(data.email ?? "").trim() || "info@aychookah.com",
      phone: String(data.phone ?? "").trim() || "+90 XXX XXX XX XX",
      whatsapp: data.whatsapp != null && String(data.whatsapp).trim() !== "" ? String(data.whatsapp).trim() : null,
      address: data.address != null && data.address !== "" ? data.address : null,
      workingHours: data.workingHours != null && data.workingHours !== "" ? data.workingHours : null,
      footerDescription: String(data.footerDescription ?? "").trim() || "Lüks el işçiliği nargile takımları.",
    };

    if (existing) {
      await contactInfoModel.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await contactInfoModel.create({ data: payload });
    }

    revalidatePath("/admin/menu");
    revalidatePath("/");
    revalidatePath("/iletisim");
    return { success: true };
  } catch (error: unknown) {
    const isTableMissing =
      error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2021";
    const message = isTableMissing
      ? "contact_info tablosu veritabanında yok. Lütfen proje kökünde 'npx prisma migrate deploy' çalıştırın."
      : error instanceof Error
        ? error.message
        : "İletişim bilgileri güncellenirken bir hata oluştu";
    console.error("Error updating contact info:", error);
    throw new Error(message);
  }
}

