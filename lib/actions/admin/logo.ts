"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface LogoSettings {
  headerLogo?: string | null;
  footerLogo?: string | null;
}

// Get logo settings (raw - null/empty values preserved)
export async function getLogoSettings(): Promise<LogoSettings> {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { key: "logo_settings" },
    });

    if (settings && settings.config) {
      return settings.config as LogoSettings;
    }

    return {
      headerLogo: null,
      footerLogo: null,
    };
  } catch (error) {
    console.error("Error getting logo settings:", error);
    return {
      headerLogo: null,
      footerLogo: null,
    };
  }
}

// Get logo settings with fallback (for frontend use)
export async function getLogoSettingsWithFallback(): Promise<LogoSettings> {
  try {
    const settings = await getLogoSettings();
    return {
      headerLogo: settings.headerLogo && settings.headerLogo.trim() !== "" 
        ? settings.headerLogo 
        : "/images/logo/ayc-hookah-logo.png",
      footerLogo: settings.footerLogo && settings.footerLogo.trim() !== "" 
        ? settings.footerLogo 
        : "/images/logo/ayc-hookah-logo.png",
    };
  } catch (error) {
    console.error("Error getting logo settings with fallback:", error);
    return {
      headerLogo: "/images/logo/ayc-hookah-logo.png",
      footerLogo: "/images/logo/ayc-hookah-logo.png",
    };
  }
}

// Update logo settings
export async function updateLogoSettings(data: LogoSettings) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Bu işlem için admin yetkisi gereklidir");
    }

    await prisma.storeSettings.upsert({
      where: { key: "logo_settings" },
      update: {
        config: data,
      },
      create: {
        key: "logo_settings",
        config: data,
      },
    });

    revalidatePath("/admin/magaza-ayarlari/logo");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating logo settings:", error);
    throw new Error(error.message || "Logo ayarları güncellenirken bir hata oluştu");
  }
}

