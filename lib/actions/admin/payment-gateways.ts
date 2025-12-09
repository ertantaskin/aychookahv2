"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Ödeme gateway'lerini getir
export const getPaymentGateways = async () => {
  try {
    // EFT/Havale yoksa otomatik oluştur
    const eftHavale = await prisma.paymentGateway.findUnique({
      where: { name: "eft-havale" },
    });

    if (!eftHavale) {
      await prisma.paymentGateway.create({
        data: {
          name: "eft-havale",
          displayName: "EFT/Havale",
          isActive: true,
          isTestMode: false,
          config: {
            bankName: "Ziraat Bankası",
            accountName: "AYC HOOKAH",
            iban: "TR00 0000 0000 0000 0000 0000 00",
            branch: "Şube Adı",
            accountNumber: "00000000",
          },
        },
      });
    }

    return await prisma.paymentGateway.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching payment gateways:", error);
    throw new Error("Ödeme sistemleri yüklenirken bir hata oluştu");
  }
};

// Aktif ödeme gateway'ini getir
export const getActivePaymentGateway = async () => {
  try {
    return await prisma.paymentGateway.findFirst({
      where: { isActive: true },
    });
  } catch (error) {
    console.error("Error fetching active payment gateway:", error);
    return null;
  }
};

// Ödeme gateway oluştur veya güncelle
export const upsertPaymentGateway = async (data: {
  name: string;
  displayName: string;
  isActive: boolean;
  isTestMode: boolean;
  config: {
    apiKey?: string;
    secretKey?: string;
    uri?: string;
    // EFT/Havale için banka bilgileri
    bankName?: string;
    accountName?: string;
    iban?: string;
    branch?: string;
    accountNumber?: string;
  };
}) => {
  try {
    // EFT/Havale için özel kontrol - aktif edilirken diğer gateway'leri devre dışı bırakma
    if (data.name !== "eft-havale" && data.isActive) {
      await prisma.paymentGateway.updateMany({
        where: { 
          isActive: true,
          name: { not: "eft-havale" } // EFT/Havale'yi etkileme
        },
        data: { isActive: false },
      });
    }

    const gateway = await prisma.paymentGateway.upsert({
      where: { name: data.name },
      update: {
        displayName: data.displayName,
        isActive: data.isActive,
        isTestMode: data.isTestMode,
        config: data.config,
      },
      create: {
        name: data.name,
        displayName: data.displayName,
        isActive: data.isActive,
        isTestMode: data.isTestMode,
        config: data.config,
      },
    });

    revalidatePath("/admin/odeme-sistemleri");
    return gateway;
  } catch (error) {
    console.error("Error upserting payment gateway:", error);
    throw new Error("Ödeme sistemi kaydedilirken bir hata oluştu");
  }
};

// Ödeme gateway'i aktif/devre dışı yap
export const togglePaymentGateway = async (id: string, isActive: boolean) => {
  try {
    // Gateway'i getir
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id },
    });

    if (!gateway) {
      throw new Error("Ödeme sistemi bulunamadı");
    }

    // EFT/Havale değilse ve aktif ediliyorsa, diğer gateway'leri (EFT/Havale hariç) devre dışı bırak
    if (isActive && gateway.name !== "eft-havale") {
      await prisma.paymentGateway.updateMany({
        where: { 
          isActive: true,
          name: { not: "eft-havale" } // EFT/Havale'yi etkileme
        },
        data: { isActive: false },
      });
    }

    await prisma.paymentGateway.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/odeme-sistemleri");
    return { success: true };
  } catch (error) {
    console.error("Error toggling payment gateway:", error);
    throw new Error("Ödeme sistemi güncellenirken bir hata oluştu");
  }
};

// Ödeme gateway'i sil
export const deletePaymentGateway = async (id: string) => {
  try {
    // EFT/Havale silinemez
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id },
    });

    if (gateway?.name === "eft-havale") {
      throw new Error("EFT/Havale ödeme yöntemi silinemez");
    }

    await prisma.paymentGateway.delete({
      where: { id },
    });

    revalidatePath("/admin/odeme-sistemleri");
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment gateway:", error);
    throw new Error("Ödeme sistemi silinirken bir hata oluştu");
  }
};

// Aktif ödeme yöntemlerini getir (kullanıcı tarafı için)
export const getAvailablePaymentMethods = async () => {
  try {
    // EFT/Havale'yi getir veya oluştur
    let eftHavale = await prisma.paymentGateway.findUnique({
      where: { name: "eft-havale" },
    });

    if (!eftHavale) {
      eftHavale = await prisma.paymentGateway.create({
        data: {
          name: "eft-havale",
          displayName: "EFT/Havale",
          isActive: true,
          isTestMode: false,
          config: {
            bankName: "Ziraat Bankası",
            accountName: "AYC HOOKAH",
            iban: "TR00 0000 0000 0000 0000 0000 00",
            branch: "Şube Adı",
            accountNumber: "00000000",
          },
        },
      });
    }

    // Veritabanından aktif gateway'leri getir (EFT/Havale hariç)
    const activeGateways = await prisma.paymentGateway.findMany({
      where: { 
        isActive: true,
        name: { not: "eft-havale" }
      },
      orderBy: { createdAt: "asc" },
    });

    const methods = [];

    // EFT/Havale aktifse ekle
    if (eftHavale.isActive) {
      methods.push({
        id: "eft-havale",
        name: "eft-havale",
        displayName: eftHavale.displayName,
        type: "manual" as const,
        isActive: eftHavale.isActive,
      });
    }

    // Aktif gateway'leri ekle
    methods.push(
      ...activeGateways.map((gateway) => ({
        id: gateway.id,
        name: gateway.name,
        displayName: gateway.displayName,
        type: "gateway" as const,
        isActive: gateway.isActive,
      }))
    );

    return methods;
  } catch (error) {
    console.error("Error fetching available payment methods:", error);
    // Hata durumunda sadece EFT/Havale döndür
    return [
      {
        id: "eft-havale",
        name: "eft-havale",
        displayName: "EFT/Havale",
        type: "manual" as const,
        isActive: true,
      },
    ];
  }
};

