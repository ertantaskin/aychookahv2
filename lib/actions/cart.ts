"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Sepeti getir
export const getCart = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return cart;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
};

// Sepete ürün ekle
export const addToCart = async (productId: string, quantity: number = 1) => {
  try {
    const session = await auth();

    // Ürünü kontrol et
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw new Error("Ürün bulunamadı veya aktif değil");
    }

    if (product.stock < quantity) {
      throw new Error("Yeterli stok bulunmuyor");
    }

    // Kullanıcı giriş yapmışsa veritabanına kaydet
    if (session?.user?.id) {
      // User tablosunda kullanıcı var mı kontrol et
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        // Kullanıcı veritabanında yoksa guest olarak işle
        return { success: true, isGuest: true };
    }

    // Sepeti bul veya oluştur
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Sepet kalemini kontrol et
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    // Toplam miktarı hesapla (mevcut + yeni)
    const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    // Stok kontrolü - toplam miktar stoktan fazla olamaz
    if (product.stock < totalQuantity) {
      throw new Error(
        existingItem
          ? `Stokta sadece ${product.stock} adet ürün bulunmaktadır. Sepetinizde ${existingItem.quantity} adet var.`
          : `Stokta sadece ${product.stock} adet ürün bulunmaktadır.`
      );
    }

    if (existingItem) {
      // Mevcut kalemi güncelle
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: totalQuantity,
        },
      });
    } else {
      // Yeni kalem ekle
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    revalidatePath("/sepet");
      return { success: true, isGuest: false };
    }
    
    // Guest kullanıcılar için client-side localStorage kullanılacak
    return { success: true, isGuest: true };
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

// Sepetten ürün çıkar
export const removeFromCart = async (cartItemId: string) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== session.user.id) {
      throw new Error("Sepet kalemi bulunamadı");
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    revalidatePath("/sepet");
    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

// Sepet kalemi miktarını güncelle
export const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        product: true,
      },
    });

    if (!cartItem || cartItem.cart.userId !== session.user.id) {
      throw new Error("Sepet kalemi bulunamadı");
    }

    if (cartItem.product.stock < quantity) {
      throw new Error("Yeterli stok bulunmuyor");
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    revalidatePath("/sepet");
    return { success: true };
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

// Sepeti temizle
export const clearCart = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    revalidatePath("/sepet");
    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

