"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Kullanıcının adreslerini getir
export const getAddresses = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return addresses;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw new Error("Adresler yüklenirken bir hata oluştu");
  }
};

// Adres oluştur
export const createAddress = async (data: {
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault?: boolean;
}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    // Eğer varsayılan adres olarak işaretleniyorsa, diğer adreslerin varsayılan durumunu kaldır
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: session.user.id,
        isDefault: data.isDefault ?? false,
      },
    });

    revalidatePath("/hesabim/adresler");
    return { success: true, address };
  } catch (error) {
    console.error("Error creating address:", error);
    throw new Error("Adres oluşturulurken bir hata oluştu");
  }
};

// Adres güncelle
export const updateAddress = async (
  addressId: string,
  data: {
    title?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    isDefault?: boolean;
  }
) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    // Adresin kullanıcıya ait olduğunu kontrol et
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      throw new Error("Adres bulunamadı veya yetkiniz yok");
    }

    // Eğer varsayılan adres olarak işaretleniyorsa, diğer adreslerin varsayılan durumunu kaldır
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          id: { not: addressId },
        },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data,
    });

    revalidatePath("/hesabim/adresler");
    return { success: true, address };
  } catch (error) {
    console.error("Error updating address:", error);
    throw new Error("Adres güncellenirken bir hata oluştu");
  }
};

// Adres sil
export const deleteAddress = async (addressId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    // Adresin kullanıcıya ait olduğunu kontrol et
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      throw new Error("Adres bulunamadı veya yetkiniz yok");
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    revalidatePath("/hesabim/adresler");
    return { success: true };
  } catch (error) {
    console.error("Error deleting address:", error);
    throw new Error("Adres silinirken bir hata oluştu");
  }
};

