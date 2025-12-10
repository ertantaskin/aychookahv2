"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getTaxSettings } from "@/lib/utils/tax-calculator";
import { getShippingSettings, calculateShippingCost } from "@/lib/utils/shipping-calculator";
import { calculateTaxForCartWithShipping } from "@/lib/utils/tax-calculator";

// Sipariş oluştur
export const createOrder = async (shippingAddress: any, paymentId?: string) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    // Sepeti getir
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Sepetiniz boş");
    }

    // Stok kontrolü
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`${item.product.name} için yeterli stok bulunmuyor`);
      }
    }

    // Ayarları getir
    const taxSettings = await getTaxSettings();
    const shippingSettings = await getShippingSettings();

    // Toplam hesapla (ürün fiyatları KDV dahil olarak saklanıyor)
    const cartSubtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Kargo hesapla
    const shippingCost = calculateShippingCost(cartSubtotal, shippingSettings);

    // Vergi hesapla (ürünler + kargo üzerinden)
    const taxCalculation = calculateTaxForCartWithShipping(
      cartSubtotal,
      shippingCost,
      taxSettings.defaultTaxRate,
      taxSettings.taxIncluded
    );

    // Toplam
    const total = taxCalculation.total;

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Sipariş oluştur
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        total,
        subtotal: taxCalculation.subtotal,
        shippingCost: taxCalculation.shippingCost,
        tax: taxCalculation.tax,
        shippingAddress,
        paymentId,
        paymentStatus: paymentId ? "COMPLETED" : "PENDING",
        status: "PENDING",
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            productName: item.product.name,
            productImageUrl: (item.product as any).images?.find((img: any) => img.isPrimary)?.url || (item.product as any).images?.[0]?.url || null,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Stokları güncelle
    for (const item of cart.items) {
      if (item.productId) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
      }
    }

    // Sepeti temizle
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidatePath("/hesabim");
    revalidatePath("/hesabim/siparisler");
    return { success: true, order };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Siparişleri getir
export const getOrders = async (userId: string) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Siparişler yüklenirken bir hata oluştu");
  }
};

// Tek sipariş getir
export const getOrder = async (orderId: string) => {
  try {
    // auth() çağrısını güvenli şekilde yap
    let session;
    try {
      session = await auth();
    } catch (authError: any) {
      console.error("Error getting session in getOrder:", authError);
      throw new Error("Giriş yapmanız gerekiyor");
    }

    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
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

    if (!order || order.userId !== session.user.id) {
      throw new Error("Sipariş bulunamadı");
    }

    return order;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw new Error("Sipariş yüklenirken bir hata oluştu");
  }
};

// Ödeme sonrası sipariş oluştur
export const createOrderFromPayment = async (
  shippingAddress: any,
  paymentId: string,
  total?: number,
  conversationId?: string,
  userId?: string // Opsiyonel: Eğer session yoksa, userId'yi direkt al
) => {
  try {
    // Güvenlik: Aynı paymentId ile daha önce sipariş oluşturulmuş mu kontrol et
    const existingOrder = await prisma.order.findFirst({
      where: { paymentId: paymentId },
      include: { items: true },
    });

    if (existingOrder) {
      console.log("Order already exists for paymentId:", paymentId);
      return { 
        success: true, 
        id: existingOrder.id, 
        order: existingOrder,
        isDuplicate: true 
      };
    }

    let finalUserId = userId;
    
    // Eğer userId verilmemişse, session'dan al
    if (!finalUserId) {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
      }
      finalUserId = session.user.id;
    }

    // Sepeti getir
    const cart = await prisma.cart.findUnique({
      where: { userId: finalUserId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Sepetiniz boş");
    }

    // Stok kontrolü
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`${item.product.name} için yeterli stok bulunmuyor`);
      }
    }

    // Ayarları getir
    const taxSettings = await getTaxSettings();
    const shippingSettings = await getShippingSettings();

    // Toplam hesapla (ürün fiyatları KDV dahil olarak saklanıyor)
    const cartSubtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Kargo hesapla
    const shippingCost = calculateShippingCost(cartSubtotal, shippingSettings);

    // Vergi hesapla (ürünler + kargo üzerinden)
    const taxCalculation = calculateTaxForCartWithShipping(
      cartSubtotal,
      shippingCost,
      taxSettings.defaultTaxRate,
      taxSettings.taxIncluded
    );

    // Toplam - eğer total parametresi verilmişse onu kullan
    const calculatedTotal = total || taxCalculation.total;

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Sipariş oluştur
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: finalUserId,
        total: calculatedTotal,
        subtotal: taxCalculation.subtotal,
        shippingCost: taxCalculation.shippingCost,
        tax: taxCalculation.tax,
        shippingAddress,
        paymentId,
        paymentMethod: "iyzico", // iyzico ödeme yöntemi
        paymentStatus: "COMPLETED",
        status: "PROCESSING", // Hazırlanıyor durumu
        notes: conversationId ? `iyzico Conversation ID: ${conversationId}` : null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            productName: item.product.name,
            productImageUrl: (item.product as any).images?.find((img: any) => img.isPrimary)?.url || (item.product as any).images?.[0]?.url || null,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Stokları güncelle
    for (const item of cart.items) {
      if (item.productId) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
      }
    }

    // Sepeti temizle
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidatePath("/hesabim");
    revalidatePath("/hesabim/siparisler");
    revalidatePath("/odeme/basarili");
    return { success: true, id: order.id, order };
  } catch (error) {
    console.error("Error creating order from payment:", error);
    throw error;
  }
};

// EFT/Havale için sipariş oluştur
export const createOrderForEftHavale = async (
  shippingAddress: any,
  paymentMethod: string = "EFT/Havale"
) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    // Sepeti getir
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Sepetiniz boş");
    }

    // Stok kontrolü
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new Error(`${item.product.name} için yeterli stok bulunmuyor`);
      }
    }

    // Ayarları getir
    const taxSettings = await getTaxSettings();
    const shippingSettings = await getShippingSettings();

    // Toplam hesapla (ürün fiyatları KDV dahil olarak saklanıyor)
    const cartSubtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Kargo hesapla
    const shippingCost = calculateShippingCost(cartSubtotal, shippingSettings);

    // Vergi hesapla (ürünler + kargo üzerinden)
    const taxCalculation = calculateTaxForCartWithShipping(
      cartSubtotal,
      shippingCost,
      taxSettings.defaultTaxRate,
      taxSettings.taxIncluded
    );

    // Toplam
    const total = taxCalculation.total;

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Sipariş oluştur (ödeme bekleniyor durumunda)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        total,
        subtotal: taxCalculation.subtotal,
        shippingCost: taxCalculation.shippingCost,
        tax: taxCalculation.tax,
        shippingAddress,
        paymentMethod,
        paymentStatus: "PENDING", // Ödeme bekleniyor
        status: "PENDING", // Onay bekleniyor
        notes: `Ödeme yöntemi: ${paymentMethod}. Ödeme onayı bekleniyor.`,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            productName: item.product.name,
            productImageUrl: (item.product as any).images?.find((img: any) => img.isPrimary)?.url || (item.product as any).images?.[0]?.url || null,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Stokları güncelle (rezerve et)
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Sepeti temizle
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidatePath("/hesabim");
    revalidatePath("/hesabim/siparisler");
    return { success: true, id: order.id, order, orderNumber };
  } catch (error) {
    console.error("Error creating order for EFT/Havale:", error);
    throw error;
  }
};

