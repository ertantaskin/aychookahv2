"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getTaxSettings } from "@/lib/utils/tax-calculator";
import { getShippingSettings, calculateShippingCost } from "@/lib/utils/shipping-calculator";
import { calculateTaxForCartWithShipping } from "@/lib/utils/tax-calculator";
import { calculateTotalWithCoupon, getFreeItemsFromCoupon } from "@/lib/utils/coupon-calculator";

// Sipariş oluştur
export const createOrder = async (shippingAddress: any, paymentId?: string, couponCode?: string, couponDiscountAmount?: number) => {
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

    // Kupon indirimi varsa toplamı güncelle
    const discountAmount = couponDiscountAmount || 0;
    const totalCalculation = discountAmount > 0
      ? calculateTotalWithCoupon(
          cartSubtotal, // KDV dahil sepet toplamı
          shippingCost,
          discountAmount,
          taxSettings.defaultTaxRate,
          taxSettings.taxIncluded
        )
      : {
          subtotal: taxCalculation.subtotal,
          tax: taxCalculation.tax,
          shippingCost: taxCalculation.shippingCost,
          shippingTax: 0,
          total: taxCalculation.total,
        };
    const total = totalCalculation.total;

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Kupon bilgisini al (indirim tipini kontrol etmek için)
    let coupon: any = null;
    let couponDiscountType: string | null = null;
    if (couponCode && discountAmount > 0) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon) {
        couponDiscountType = coupon.discountType;
      }
    }

    // Bedava ürünleri tespit et (BUY_X_GET_Y kuponu için)
    let freeItems: Array<{ productId: string; quantity: number; price: number; productName: string; productImageUrl: string | null }> = [];
    if (coupon && coupon.discountType === "BUY_X_GET_Y") {
        // Cart items'ı CartItem formatına çevir
        const cartItemsForCoupon = cart.items.map((item) => ({
          productId: item.productId || "",
          quantity: item.quantity,
          product: {
            id: item.product.id,
            price: item.product.price,
            categoryId: (item.product as any).categoryId || null,
          },
        }));

        const freeItemsData = getFreeItemsFromCoupon(coupon, cartItemsForCoupon, cartSubtotal);
        
        // Bedava ürünleri sipariş item formatına çevir
        for (const freeItem of freeItemsData) {
          const product = cart.items.find((item) => item.productId === freeItem.productId)?.product;
          if (product) {
            freeItems.push({
              productId: freeItem.productId,
              quantity: freeItem.quantity,
              price: 0, // Bedava ürünler için fiyat 0
              productName: product.name,
              productImageUrl: (product as any).images?.find((img: any) => img.isPrimary)?.url || (product as any).images?.[0]?.url || null,
            });
          }
        }
    }

    // Bedava ürünlerin miktarını normal ürünlerden çıkar
    const freeItemsMap = new Map<string, number>();
    freeItems.forEach((freeItem) => {
      const existing = freeItemsMap.get(freeItem.productId) || 0;
      freeItemsMap.set(freeItem.productId, existing + freeItem.quantity);
    });

    // Normal ürünler (bedava miktarı çıkarılmış) + bedava ürünler
    const allOrderItems = [
      ...cart.items.map((item) => {
        const freeQty = freeItemsMap.get(item.productId) || 0;
        const normalQty = item.quantity - freeQty;
        
        // Eğer tüm ürün bedava ise, normal item ekleme
        if (normalQty <= 0) {
          return null;
        }
        
        return {
          productId: item.productId,
          quantity: normalQty,
          price: item.product.price,
          productName: item.product.name,
          productImageUrl: (item.product as any).images?.find((img: any) => img.isPrimary)?.url || (item.product as any).images?.[0]?.url || null,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null),
      ...freeItems,
    ];

    // Sipariş oluştur
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        total,
        subtotal: totalCalculation.subtotal,
        shippingCost: totalCalculation.shippingCost,
        tax: totalCalculation.tax,
        couponCode: couponCode || null,
        discountAmount,
        couponDiscountType,
        shippingAddress,
        paymentId,
        paymentStatus: paymentId ? "COMPLETED" : "PENDING",
        status: "PENDING",
        items: {
          create: allOrderItems,
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

    // Kupon kullanımını kaydet
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon) {
        await prisma.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: session.user.id,
            orderId: order.id,
          },
        });

        // Kupon kullanım sayısını artır
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }
    }

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
  userId?: string, // Opsiyonel: Eğer session yoksa, userId'yi direkt al
  couponCode?: string,
  couponDiscountAmount?: number
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

    // Kupon indirimi varsa toplamı güncelle
    const discountAmount = couponDiscountAmount || 0;
    const totalCalculation = discountAmount > 0
      ? calculateTotalWithCoupon(
          cartSubtotal, // KDV dahil sepet toplamı
          shippingCost,
          discountAmount,
          taxSettings.defaultTaxRate,
          taxSettings.taxIncluded
        )
      : {
          subtotal: taxCalculation.subtotal,
          tax: taxCalculation.tax,
          shippingCost: taxCalculation.shippingCost,
          shippingTax: 0,
          total: taxCalculation.total,
        };
    const calculatedTotal = total || totalCalculation.total;

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Kupon bilgisini al (indirim tipini kontrol etmek için)
    let coupon: any = null;
    let couponDiscountType: string | null = null;
    if (couponCode && discountAmount > 0) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon) {
        couponDiscountType = coupon.discountType;
      }
    }

    // Bedava ürünleri tespit et (BUY_X_GET_Y kuponu için)
    let freeItems: Array<{ productId: string; quantity: number; price: number; productName: string; productImageUrl: string | null }> = [];
    if (coupon && coupon.discountType === "BUY_X_GET_Y") {
        // Cart items'ı CartItem formatına çevir
        const cartItemsForCoupon = cart.items.map((item) => ({
          productId: item.productId || "",
          quantity: item.quantity,
          product: {
            id: item.product.id,
            price: item.product.price,
            categoryId: (item.product as any).categoryId || null,
          },
        }));

        const freeItemsData = getFreeItemsFromCoupon(coupon, cartItemsForCoupon, cartSubtotal);
        
        // Bedava ürünleri sipariş item formatına çevir
        for (const freeItem of freeItemsData) {
          const product = cart.items.find((item) => item.productId === freeItem.productId)?.product;
          if (product) {
            freeItems.push({
              productId: freeItem.productId,
              quantity: freeItem.quantity,
              price: 0, // Bedava ürünler için fiyat 0
              productName: product.name,
              productImageUrl: (product as any).images?.find((img: any) => img.isPrimary)?.url || (product as any).images?.[0]?.url || null,
            });
          }
        }
    }

    // Bedava ürünlerin miktarını normal ürünlerden çıkar
    const freeItemsMap = new Map<string, number>();
    freeItems.forEach((freeItem) => {
      const existing = freeItemsMap.get(freeItem.productId) || 0;
      freeItemsMap.set(freeItem.productId, existing + freeItem.quantity);
    });

    // Normal ürünler (bedava miktarı çıkarılmış) + bedava ürünler
    const allOrderItems = [
      ...cart.items.map((item) => {
        const freeQty = freeItemsMap.get(item.productId) || 0;
        const normalQty = item.quantity - freeQty;
        
        // Eğer tüm ürün bedava ise, normal item ekleme
        if (normalQty <= 0) {
          return null;
        }
        
        return {
          productId: item.productId,
          quantity: normalQty,
          price: item.product.price,
          productName: item.product.name,
          productImageUrl: (item.product as any).images?.find((img: any) => img.isPrimary)?.url || (item.product as any).images?.[0]?.url || null,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null),
      ...freeItems,
    ];

    // Sipariş oluştur
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: finalUserId,
        total: calculatedTotal,
        subtotal: totalCalculation.subtotal,
        shippingCost: totalCalculation.shippingCost,
        tax: totalCalculation.tax,
        couponCode: couponCode || null,
        discountAmount,
        couponDiscountType,
        shippingAddress,
        paymentId,
        paymentMethod: "iyzico", // iyzico ödeme yöntemi
        paymentStatus: "COMPLETED",
        status: "PROCESSING", // Hazırlanıyor durumu
        notes: conversationId ? `iyzico Conversation ID: ${conversationId}` : null,
        items: {
          create: allOrderItems,
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

    // Kupon kullanımını kaydet
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon) {
        await prisma.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: finalUserId,
            orderId: order.id,
          },
        });

        // Kupon kullanım sayısını artır
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }
    }

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
  paymentMethod: string = "EFT/Havale",
  couponCode?: string,
  couponDiscountAmount?: number
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

    // Kupon indirimi varsa toplamı güncelle
    const discountAmount = couponDiscountAmount || 0;
    const totalCalculation = discountAmount > 0
      ? calculateTotalWithCoupon(
          cartSubtotal, // KDV dahil sepet toplamı
          shippingCost,
          discountAmount,
          taxSettings.defaultTaxRate,
          taxSettings.taxIncluded
        )
      : {
          subtotal: taxCalculation.subtotal,
          tax: taxCalculation.tax,
          shippingCost: taxCalculation.shippingCost,
          shippingTax: 0,
          total: taxCalculation.total,
        };
    const total = totalCalculation.total;

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Kupon bilgisini al (indirim tipini kontrol etmek için)
    let coupon: any = null;
    let couponDiscountType: string | null = null;
    if (couponCode && discountAmount > 0) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon) {
        couponDiscountType = coupon.discountType;
      }
    }

    // Bedava ürünleri tespit et (BUY_X_GET_Y kuponu için)
    let freeItems: Array<{ productId: string; quantity: number; price: number; productName: string; productImageUrl: string | null }> = [];
    if (coupon && coupon.discountType === "BUY_X_GET_Y") {
        // Cart items'ı CartItem formatına çevir
        const cartItemsForCoupon = cart.items.map((item) => ({
          productId: item.productId || "",
          quantity: item.quantity,
          product: {
            id: item.product.id,
            price: item.product.price,
            categoryId: (item.product as any).categoryId || null,
          },
        }));

        const freeItemsData = getFreeItemsFromCoupon(coupon, cartItemsForCoupon, cartSubtotal);
        
        // Bedava ürünleri sipariş item formatına çevir
        for (const freeItem of freeItemsData) {
          const product = cart.items.find((item) => item.productId === freeItem.productId)?.product;
          if (product) {
            freeItems.push({
              productId: freeItem.productId,
              quantity: freeItem.quantity,
              price: 0, // Bedava ürünler için fiyat 0
              productName: product.name,
              productImageUrl: (product as any).images?.find((img: any) => img.isPrimary)?.url || (product as any).images?.[0]?.url || null,
            });
          }
        }
    }

    // Bedava ürünlerin miktarını normal ürünlerden çıkar
    const freeItemsMap = new Map<string, number>();
    freeItems.forEach((freeItem) => {
      const existing = freeItemsMap.get(freeItem.productId) || 0;
      freeItemsMap.set(freeItem.productId, existing + freeItem.quantity);
    });

    // Normal ürünler (bedava miktarı çıkarılmış) + bedava ürünler
    const allOrderItems = [
      ...cart.items.map((item) => {
        const freeQty = freeItemsMap.get(item.productId) || 0;
        const normalQty = item.quantity - freeQty;
        
        // Eğer tüm ürün bedava ise, normal item ekleme
        if (normalQty <= 0) {
          return null;
        }
        
        return {
          productId: item.productId,
          quantity: normalQty,
          price: item.product.price,
          productName: item.product.name,
          productImageUrl: (item.product as any).images?.find((img: any) => img.isPrimary)?.url || (item.product as any).images?.[0]?.url || null,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null),
      ...freeItems,
    ];

    // Sipariş oluştur (ödeme bekleniyor durumunda)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        total,
        subtotal: totalCalculation.subtotal,
        shippingCost: totalCalculation.shippingCost,
        tax: totalCalculation.tax,
        couponCode: couponCode || null,
        discountAmount,
        couponDiscountType,
        shippingAddress,
        paymentMethod,
        paymentStatus: "PENDING", // Ödeme bekleniyor
        status: "PENDING", // Onay bekleniyor
        notes: `Ödeme yöntemi: ${paymentMethod}. Ödeme onayı bekleniyor.`,
        items: {
          create: allOrderItems,
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

    // Stok düşürme işlemi SADECE ödeme durumu "COMPLETED" olduğunda yapılacak
    // Admin panelden ödeme onaylandığında stok düşürülecek
    // Burada stok düşürmüyoruz - ödeme onaylandığında updatePaymentStatus içinde düşülecek

    // Sepeti temizle
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Kupon kullanımını kaydet
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon) {
        await prisma.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: session.user.id,
            orderId: order.id,
          },
        });

        // Kupon kullanım sayısını artır
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }
    }

    revalidatePath("/hesabim");
    revalidatePath("/hesabim/siparisler");
    return { success: true, id: order.id, order, orderNumber };
  } catch (error) {
    console.error("Error creating order for EFT/Havale:", error);
    throw error;
  }
};

