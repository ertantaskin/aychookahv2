"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface TaxSettings {
  defaultTaxRate: number; // 0.20 = %20
  taxIncluded: boolean; // Fiyata dahil mi?
  rules?: Array<{
    type: "category" | "product";
    id: string;
    taxRate: number;
  }>;
}

export interface ShippingSettings {
  defaultShippingCost: number;
  freeShippingThreshold?: number | null; // Bu tutarın üzerinde ücretsiz kargo
  estimatedDeliveryDays: number;
  rules?: Array<{
    type: "region" | "weight" | "price";
    condition: any;
    cost: number;
  }>;
}

// Mağaza ayarlarını getir
export async function getStoreSettings(key: "tax" | "shipping") {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { key },
    });

    if (!settings) {
      // Varsayılan ayarları döndür
      if (key === "tax") {
        return {
          key: "tax",
          config: {
            defaultTaxRate: 0.20,
            taxIncluded: true,
            rules: [],
          } as TaxSettings,
        };
      } else {
        return {
          key: "shipping",
          config: {
            defaultShippingCost: 0,
            freeShippingThreshold: null,
            estimatedDeliveryDays: 3,
            rules: [],
          } as ShippingSettings,
        };
      }
    }

    return settings;
  } catch (error) {
    console.error("Error getting store settings:", error);
    throw new Error("Ayarlar yüklenirken bir hata oluştu");
  }
}

// Vergi ayarlarını güncelle
export async function updateTaxSettings(config: TaxSettings) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    // Validasyon
    if (config.defaultTaxRate < 0 || config.defaultTaxRate > 1) {
      throw new Error("KDV oranı 0 ile 1 arasında olmalıdır (örn: 0.20 = %20)");
    }

    const settings = await prisma.storeSettings.upsert({
      where: { key: "tax" },
      update: {
        config: config as any,
      },
      create: {
        key: "tax",
        config: config as any,
      },
    });

    revalidatePath("/admin/magaza-ayarlari/vergi");
    return settings;
  } catch (error: any) {
    console.error("Error updating tax settings:", error);
    throw new Error(error.message || "Vergi ayarları güncellenirken bir hata oluştu");
  }
}

// Kargo ayarlarını güncelle
export async function updateShippingSettings(config: ShippingSettings) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    // Validasyon
    if (config.defaultShippingCost < 0) {
      throw new Error("Kargo ücreti negatif olamaz");
    }

    if (
      config.freeShippingThreshold !== null &&
      config.freeShippingThreshold !== undefined &&
      config.freeShippingThreshold < 0
    ) {
      throw new Error("Ücretsiz kargo eşiği negatif olamaz");
    }

    if (config.estimatedDeliveryDays < 1) {
      throw new Error("Tahmini teslimat süresi en az 1 gün olmalıdır");
    }

    const settings = await prisma.storeSettings.upsert({
      where: { key: "shipping" },
      update: {
        config: config as any,
      },
      create: {
        key: "shipping",
        config: config as any,
      },
    });

    revalidatePath("/admin/magaza-ayarlari/kargo");
    return settings;
  } catch (error: any) {
    console.error("Error updating shipping settings:", error);
    throw new Error(error.message || "Kargo ayarları güncellenirken bir hata oluştu");
  }
}

