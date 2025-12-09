"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Kullanıcı bilgilerini güncelle
export const updateUserProfile = async (data: {
  name?: string;
  phone?: string;
  email?: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) {
      // Email değişikliği için kontrol
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser && existingUser.id !== session.user.id) {
        throw new Error("Bu email adresi zaten kullanılıyor");
      }
      updateData.email = data.email;
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    revalidatePath("/hesabim");
    revalidatePath("/hesabim/profil");
    return { success: true, user };
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    throw new Error(error.message || "Profil güncellenirken bir hata oluştu");
  }
};

// Şifre değiştir
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      throw new Error("Kullanıcı bulunamadı");
    }

    // Mevcut şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Mevcut şifre yanlış");
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    revalidatePath("/hesabim/profil");
    return { success: true };
  } catch (error: any) {
    console.error("Error changing password:", error);
    throw new Error(error.message || "Şifre değiştirilirken bir hata oluştu");
  }
};

