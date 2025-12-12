"use server";

import { auth } from "@/lib/auth";
import { getCart } from "./cart";
import { getActivePaymentGateway } from "./admin/payment-gateways";
import { prisma } from "@/lib/prisma";
import { getTaxSettings } from "@/lib/utils/tax-calculator";
import { getShippingSettings, calculateShippingCost } from "@/lib/utils/shipping-calculator";
import { calculateTaxForCartWithShipping } from "@/lib/utils/tax-calculator";

// iyzico için tarih formatı: yyyy-MM-dd HH:mm:ss
const formatDateForIyzipay = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// iyzico'yu dynamic import ile yükle (Next.js build sorunlarını önlemek için)
let IyzipayClass: any = null;
const loadIyzipay = async () => {
  if (IyzipayClass) {
    return IyzipayClass;
  }
  
  try {
    // Server-side'da require kullan (Next.js build sorunlarını önlemek için)
    if (typeof window === "undefined") {
      // eslint-disable-next-line
      const iyzicoModule = require("iyzipay");
      IyzipayClass = iyzicoModule.default || iyzicoModule;
      return IyzipayClass;
    } else {
      throw new Error("iyzico sadece server-side kullanılabilir");
    }
  } catch (error: any) {
    console.error("Error loading iyzico module with require:", error);
    // Fallback: Dynamic import dene
    try {
      const iyzicoModule = await import("iyzipay");
      IyzipayClass = iyzicoModule.default || iyzicoModule;
      return IyzipayClass;
    } catch (importError: any) {
      console.error("Error loading iyzico module with import:", importError);
      throw new Error(`iyzico kütüphanesi yüklenemedi: ${error.message || importError.message}`);
    }
  }
};

// iyzico yapılandırması
const getIyzipay = async (gatewayId?: string) => {
  try {
    // iyzico kütüphanesini yükle
    const IyzipayClass = await loadIyzipay();
    
    // Önce seçilen gateway'i kontrol et (eğer gatewayId verilmişse)
    if (gatewayId) {
      const selectedGateway = await prisma.paymentGateway.findUnique({
        where: { id: gatewayId },
      });
      
      if (selectedGateway && selectedGateway.name === "iyzico" && selectedGateway.isActive) {
        const config = selectedGateway.config as any;
        if (config?.apiKey && config?.secretKey) {
          return new IyzipayClass({
            apiKey: config.apiKey,
            secretKey: config.secretKey,
            uri: config.uri || "https://sandbox-api.iyzipay.com",
          });
        }
      }
    }
    
    // Önce veritabanından aktif gateway'i kontrol et
    const gateway = await getActivePaymentGateway();
    
    if (gateway && gateway.name === "iyzico") {
      const config = gateway.config as any;
      if (config?.apiKey && config?.secretKey) {
        return new IyzipayClass({
          apiKey: config.apiKey,
          secretKey: config.secretKey,
          uri: config.uri || "https://sandbox-api.iyzipay.com",
        });
      }
    }
    
    // Fallback: Environment variables
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  
  if (!apiKey || !secretKey) {
      throw new Error("Ödeme sistemi yapılandırılmamış. Lütfen admin panelinden ödeme sistemini yapılandırın.");
  }
  
    return new IyzipayClass({
    apiKey,
    secretKey,
    uri: process.env.IYZICO_URI || "https://sandbox-api.iyzipay.com",
  });
  } catch (error: any) {
    console.error("Error initializing iyzico:", error);
    throw new Error(`Ödeme sistemi başlatılamadı: ${error.message}`);
  }
};

// Ödeme formu oluştur
export const createPayment = async (shippingAddress: any, paymentMethod?: string, retryOrderId?: string, couponCode?: string, couponDiscountAmount?: number) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    // userId'yi shippingAddress'e ekle (callback'te kullanılacak)
    const shippingAddressWithUserId = {
      ...shippingAddress,
      userId: session.user.id, // Callback'te kullanıcıyı bulmak için
    };

    // EFT/Havale seçildiyse, özel işlem yap
    if (paymentMethod === "eft-havale") {
      const { createOrderForEftHavale } = await import("./orders");
      const result = await createOrderForEftHavale(shippingAddress, "EFT/Havale", couponCode, couponDiscountAmount);
      return {
        type: "eft-havale",
        orderId: result.id,
        orderNumber: result.orderNumber,
        total: result.order.total,
      };
    }

    // Sepeti getir (önce sepet kontrolü yap)
    const cart = await getCart();

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

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Seçilen gateway'i kontrol et (eğer paymentMethod bir gateway ID'si ise)
    let selectedGateway = null;
    if (paymentMethod && paymentMethod !== "eft-havale") {
      try {
        selectedGateway = await prisma.paymentGateway.findUnique({
          where: { id: paymentMethod },
        });
        // Gateway aktif değilse veya bulunamazsa hata ver
        if (!selectedGateway || !selectedGateway.isActive) {
          throw new Error("Seçilen ödeme yöntemi aktif değil");
        }
      } catch (error) {
        // Gateway bulunamazsa, aktif gateway'i kullan
        console.warn("Selected gateway not found, using active gateway");
      }
    }

    // Sepet içeriğini normalize et (karşılaştırma için)
    const normalizeCartItems = (items: any[]) => {
      return items
        .map((item) => ({
          productId: item.productId || item.product?.id,
          quantity: item.quantity,
        }))
        .sort((a, b) => a.productId.localeCompare(b.productId));
    };

    const currentCartItems = normalizeCartItems(cart.items);

    // Eğer retryOrderId varsa, mevcut PENDING siparişi kullan
    // Yoksa, sepet ile eşleşen mevcut PENDING/FAILED siparişi ara
    let pendingOrder;
    let total: number;
    let finalShippingCost: number;
    let taxCalculation: ReturnType<typeof calculateTaxForCartWithShipping>;
    
    // Kargo hesapla
    const shippingCost = calculateShippingCost(cartSubtotal, shippingSettings);

    // Vergi hesapla (ürünler + kargo üzerinden)
    taxCalculation = calculateTaxForCartWithShipping(
      cartSubtotal,
      shippingCost,
      taxSettings.defaultTaxRate,
      taxSettings.taxIncluded
    );
    
    // Kupon indirimi varsa toplamı güncelle
    const discountAmount = couponDiscountAmount || 0;
    
    // Ücretsiz kargo kuponu kontrolü
    let couponForTotal: any = null;
    if (couponCode && discountAmount > 0) {
      couponForTotal = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
    }
    const isFreeShippingForTotal = couponForTotal?.discountType === "FREE_SHIPPING";
    
    // Ücretsiz kargo kuponu varsa shippingCost 0, değilse orijinal kargo ücreti
    const shippingCostForCalculation = isFreeShippingForTotal ? 0 : taxCalculation.shippingCost;
    
    const { calculateTotalWithCoupon } = await import("@/lib/utils/coupon-calculator");
    const totalCalculation = discountAmount > 0
      ? calculateTotalWithCoupon(
          cartSubtotal, // KDV dahil sepet toplamı
          shippingCostForCalculation,
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
    total = totalCalculation.total;
    finalShippingCost = isFreeShippingForTotal ? 0 : taxCalculation.shippingCost;
    
    if (retryOrderId) {
      // Mevcut PENDING siparişi getir
      pendingOrder = await prisma.order.findUnique({
        where: { id: retryOrderId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      if (!pendingOrder || pendingOrder.userId !== session.user.id) {
        throw new Error("Sipariş bulunamadı veya size ait değil");
      }

      if (pendingOrder.paymentStatus !== "PENDING" && pendingOrder.paymentStatus !== "FAILED") {
        throw new Error("Bu sipariş için tekrar ödeme yapılamaz");
      }

      // Güncel sepetten hesaplama yap (kargo ücreti veya vergi değişmiş olabilir)
      const retryCartSubtotal = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const retryShippingCost = calculateShippingCost(retryCartSubtotal, shippingSettings);
      const retryTaxCalculation = calculateTaxForCartWithShipping(
        retryCartSubtotal,
        retryShippingCost,
        taxSettings.defaultTaxRate,
        taxSettings.taxIncluded
      );

      // Kupon indirimi varsa toplamı güncelle
      const discountAmount = couponDiscountAmount || 0;
      
      // Ücretsiz kargo kuponu kontrolü
      let couponForRetry: any = null;
      if (couponCode && discountAmount > 0) {
        couponForRetry = await prisma.coupon.findUnique({
          where: { code: couponCode.toUpperCase() },
        });
      }
      const isFreeShippingForRetry = couponForRetry?.discountType === "FREE_SHIPPING";
      
      // Ücretsiz kargo kuponu varsa shippingCost 0, değilse orijinal kargo ücreti
      const retryShippingCostForCalculation = isFreeShippingForRetry ? 0 : retryShippingCost;
      
      const { calculateTotalWithCoupon } = await import("@/lib/utils/coupon-calculator");
      const retryTotalCalculation = discountAmount > 0
        ? calculateTotalWithCoupon(
            retryCartSubtotal, // KDV dahil sepet toplamı
            retryShippingCostForCalculation,
            discountAmount,
            taxSettings.defaultTaxRate,
            taxSettings.taxIncluded
          )
        : {
            subtotal: retryTaxCalculation.subtotal,
            tax: retryTaxCalculation.tax,
            shippingCost: retryTaxCalculation.shippingCost,
            shippingTax: 0,
            total: retryTaxCalculation.total,
          };
      const retryTotal = retryTotalCalculation.total;

      // Mevcut siparişi güncelle (yeni shipping address ve güncel tutarlar ile)
      pendingOrder = await prisma.order.update({
        where: { id: retryOrderId },
        data: {
          shippingAddress,
          subtotal: retryTotalCalculation.subtotal,
          shippingCost: retryTotalCalculation.shippingCost,
          tax: retryTotalCalculation.tax,
          total: retryTotal,
          couponCode: couponCode || null,
          discountAmount,
          notes: `Tekrar ödeme denemesi - ${new Date().toISOString()}`,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Güncel hesaplanan değerleri kullan
      finalShippingCost = isFreeShippingForRetry ? 0 : retryTaxCalculation.shippingCost;
      total = retryTotal;
      taxCalculation = retryTaxCalculation;

      // Retry durumunda stok kontrolü yap
      // Eğer sipariş zaten oluşturulmuşsa, stok zaten düşürülmüştür
      // Stok düşürme işlemi sadece ödeme başarılı olduğunda yapılacak (callback'te)
      // Burada stok düşürmüyoruz - ödeme başarılı olursa callback'te düşülecek
    } else {
      // retryOrderId yoksa, sepet ile eşleşen mevcut PENDING/FAILED siparişi ara
      const existingOrders = await prisma.order.findMany({
        where: {
          userId: session.user.id,
          paymentStatus: {
            in: ["PENDING", "FAILED"],
          },
          paymentMethod: "iyzico",
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10, // Son 10 siparişi kontrol et
      });

      // Sepet ile eşleşen siparişi bul
      for (const order of existingOrders) {
        const orderItems = normalizeCartItems(order.items);
        
        // Aynı sayıda item ve aynı içerik kontrolü
        if (
          orderItems.length === currentCartItems.length &&
          orderItems.every(
            (orderItem, index) =>
              orderItem.productId === currentCartItems[index].productId &&
              orderItem.quantity === currentCartItems[index].quantity
          )
        ) {
          // Eşleşen sipariş bulundu, onu kullan
          console.log("Mevcut sipariş bulundu, yeniden kullanılıyor:", order.id);
          
          // Güncel sepetten hesaplama yap (kargo ücreti veya vergi değişmiş olabilir)
          const existingCartSubtotal = cart.items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          const existingShippingCost = calculateShippingCost(existingCartSubtotal, shippingSettings);
          const existingTaxCalculation = calculateTaxForCartWithShipping(
            existingCartSubtotal,
            existingShippingCost,
            taxSettings.defaultTaxRate,
            taxSettings.taxIncluded
          );
          
          // Kupon indirimi varsa toplamı güncelle
          const discountAmount = couponDiscountAmount || 0;
          const { calculateTotalWithCoupon } = await import("@/lib/utils/coupon-calculator");
          const existingTotalCalculation = discountAmount > 0
            ? calculateTotalWithCoupon(
                existingCartSubtotal, // KDV dahil sepet toplamı
                existingShippingCost,
                discountAmount,
                taxSettings.defaultTaxRate,
                taxSettings.taxIncluded
              )
            : {
                subtotal: existingTaxCalculation.subtotal,
                tax: existingTaxCalculation.tax,
                shippingCost: existingTaxCalculation.shippingCost,
                shippingTax: 0,
                total: existingTaxCalculation.total,
              };
          const existingTotal = existingTotalCalculation.total;
          
          // Siparişi güncelle (yeni shipping address ve güncel tutarlar ile)
          pendingOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
              shippingAddress,
              subtotal: existingTotalCalculation.subtotal,
              shippingCost: existingTotalCalculation.shippingCost,
              tax: existingTotalCalculation.tax,
              total: existingTotal,
              couponCode: couponCode || null,
              discountAmount,
              notes: `Tekrar ödeme denemesi - ${new Date().toISOString()}`,
              paymentStatus: "PENDING", // PENDING'e geri al
            },
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          });

          // Güncel hesaplanan değerleri kullan
          finalShippingCost = existingTaxCalculation.shippingCost;
          total = existingTotal;
          taxCalculation = existingTaxCalculation;
          
          // totalCalculation'ı güncelle (yeni sipariş oluşturma için)
          const totalCalculation = existingTotalCalculation;

          // Stokları tekrar rezerve et (eğer daha önce geri verildiyse)
          for (const item of pendingOrder.items) {
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
          
          break; // Eşleşen sipariş bulundu, döngüden çık
        }
      }

      // Eğer eşleşen sipariş bulunamadıysa, yeni sipariş oluştur
      if (!pendingOrder) {
        // Kupon indirimi varsa toplamı güncelle
        const discountAmount = couponDiscountAmount || 0;
        
        // Ücretsiz kargo kuponu kontrolü
        let couponForNewOrder: any = null;
        let couponDiscountType: string | null = null;
        if (couponCode && discountAmount > 0) {
          couponForNewOrder = await prisma.coupon.findUnique({
            where: { code: couponCode.toUpperCase() },
          });
          if (couponForNewOrder) {
            couponDiscountType = couponForNewOrder.discountType;
          }
        }
        const isFreeShippingForNewOrder = couponForNewOrder?.discountType === "FREE_SHIPPING";
        
        // Ücretsiz kargo kuponu varsa shippingCost 0, değilse orijinal kargo ücreti
        const shippingCostForNewOrder = isFreeShippingForNewOrder ? 0 : taxCalculation.shippingCost;
        
        const { calculateTotalWithCoupon } = await import("@/lib/utils/coupon-calculator");
        const totalCalculation = discountAmount > 0
          ? calculateTotalWithCoupon(
              cartSubtotal, // KDV dahil sepet toplamı
              shippingCostForNewOrder,
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
        total = totalCalculation.total;
        finalShippingCost = isFreeShippingForNewOrder ? 0 : taxCalculation.shippingCost;
        // Kupon bilgisini al (indirim tipini kontrol etmek için) - zaten yukarıda alındı
        // couponForNewOrder ve couponDiscountType zaten tanımlı

        // Bedava ürünleri tespit et (BUY_X_GET_Y kuponu için)
        let freeItems: Array<{ productId: string; quantity: number; price: number; productName: string; productImageUrl: string | null }> = [];
        if (couponForNewOrder && couponForNewOrder.discountType === "BUY_X_GET_Y") {
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

          const { getFreeItemsFromCoupon } = await import("@/lib/utils/coupon-calculator");
          const freeItemsData = getFreeItemsFromCoupon(couponForNewOrder, cartItemsForCoupon, cartSubtotal);
          
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

        // Yeni sipariş oluştur
        // Ödeme başlatılmadan önce PENDING durumunda sipariş oluştur (veritabanına kaydet)
        // Bu sayede callback'te userId ve tüm bilgileri veritabanından alabiliriz
        pendingOrder = await prisma.order.create({
          data: {
            orderNumber,
            userId: session.user.id,
            total,
            subtotal: totalCalculation.subtotal,
            shippingCost: finalShippingCost,
            tax: totalCalculation.tax,
            couponCode: couponCode || null,
            discountAmount,
            couponDiscountType: couponForNewOrder?.discountType || null,
            shippingAddress,
            paymentMethod: "iyzico",
            paymentStatus: "PENDING",
            status: "PENDING",
            notes: `Ödeme başlatıldı. Token bekleniyor.`,
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

        // Stok düşürme işlemi SADECE ödeme başarılı olduğunda yapılacak (callback'te)
        // Ödeme başarısız olursa stok zaten düşürülmemiş olacak, geri vermeye gerek yok
        // Burada stok düşürmüyoruz - ödeme başarılı olursa callback'te sipariş güncellenirken düşülecek
      }
    }

    // Sepeti TEMİZLEME - sadece ödeme başarılı olduğunda temizlenecek (callback'te)
    // Ödeme başarısız olursa sepet korunacak, kullanıcı tekrar deneyebilecek

    // BasketItems oluştur - retry durumunda mevcut siparişten, yeni siparişte sepetten
    // Ürün fiyatları KDV dahil olarak saklanıyor, iyzico'ya da KDV dahil gönderiyoruz
    // NOT: Bedava ürünler (price: 0) basketItems'a eklenmemeli, iyzico 0 fiyat kabul etmez
    let basketItems;
    if (retryOrderId && pendingOrder) {
      // Mevcut siparişten basketItems oluştur (bedava ürünleri hariç tut)
      basketItems = pendingOrder.items
        .filter((item: any) => item.price > 0) // Bedava ürünleri filtrele
        .map((item: any) => {
        // item.price zaten KDV dahil, quantity ile çarpıyoruz
        const itemTotalWithTax = item.price * item.quantity;
        
        return {
          id: item.productId,
          name: item.product?.name || "Ürün",
          category1: (item.product as any)?.category?.name || "Genel",
          itemType: "PHYSICAL",
          price: parseFloat(itemTotalWithTax.toFixed(2)).toFixed(2),
        };
      });
    } else {
      // Sepetten basketItems oluştur
      // NOT: Sepette bedava ürünler olabilir, ama bunlar normal fiyatla gösterilir
      // Bedava ürünler sipariş oluşturulurken price: 0 olarak kaydedilir, ama basketItems'da normal fiyat gösterilir
      basketItems = cart.items.map((item) => {
        // item.product.price zaten KDV dahil, quantity ile çarpıyoruz
        const itemTotalWithTax = item.product.price * item.quantity;
      
        return {
          id: item.productId,
          name: item.product.name,
          category1: (item.product as any).category?.name || "Genel",
          itemType: "PHYSICAL",
          price: parseFloat(itemTotalWithTax.toFixed(2)).toFixed(2), // Yuvarlama için
        };
      });
    }

    // Kupon bilgisini kontrol et (ücretsiz kargo için)
    let couponForPayment: any = null;
    if (couponCode && discountAmount > 0) {
      couponForPayment = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
    }
    
    const isFreeShippingCoupon = couponForPayment?.discountType === "FREE_SHIPPING";

    // Kargo ücretine KDV ekle (iyzico'ya KDV dahil gönderilmeli)
    // Kargo ücreti KDV hariç, KDV ekleyerek KDV dahil halini hesapla
    // Ücretsiz kargo kuponu varsa kargo ücreti 0 olmalı
    // finalShippingCost kullanılmalı (ücretsiz kargo kuponu durumunda 0)
    const finalShippingCostForBasket = isFreeShippingCoupon ? 0 : finalShippingCost;
    
    if (finalShippingCostForBasket > 0) {
      const shippingWithTax = finalShippingCostForBasket * (1 + taxSettings.defaultTaxRate);
      
      basketItems.push({
        id: "SHIPPING",
        name: "Kargo Ücreti",
        category1: "Kargo",
        itemType: "PHYSICAL",
        price: parseFloat(shippingWithTax.toFixed(2)).toFixed(2),
      });
    }

    // BasketItems toplamını hesapla
    let basketItemsSum = parseFloat(
      basketItems.reduce(
        (sum: number, item: any) => sum + parseFloat(item.price),
        0
      ).toFixed(2)
    );

    // İyzico, price ve paidPrice'ın basketItems toplamına tam olarak eşit olmasını bekliyor
    // Sepette zaten tüm hesaplamalar (kupon indirimi dahil) yapılmış
    // basketItems toplamını total'e eşitle (indirim ve yuvarlama hatalarını düzelt)
    const targetTotal = parseFloat(total.toFixed(2));
    const difference = targetTotal - basketItemsSum;
    
    // Fark varsa (indirim veya yuvarlama hatası), tüm item'lara orantılı dağıt
    if (Math.abs(difference) > 0.01 && basketItems.length > 0 && basketItemsSum > 0) {
      // Orantılı dağıtım için oran hesapla
      const adjustmentRatio = targetTotal / basketItemsSum;
      let adjustedSum = 0;
      
      // Tüm item'ları güncelle (son item'da kalan farkı ekle)
      basketItems = basketItems.map((item: any, index: number) => {
        const originalPrice = parseFloat(item.price);
        const adjustedPrice = originalPrice * adjustmentRatio;
        
        // Son item'da kalan farkı ekle (tam eşitlik için)
        const finalPrice = index === basketItems.length - 1 
          ? Math.max(0.01, parseFloat((targetTotal - adjustedSum).toFixed(2))) // Minimum 0.01
          : parseFloat(adjustedPrice.toFixed(2));
        
        adjustedSum += finalPrice;
        
        return {
          ...item,
          price: finalPrice.toFixed(2),
        };
      });
      
      // Güncellenmiş toplamı hesapla
      basketItemsSum = parseFloat(
        basketItems.reduce(
          (sum: number, item: any) => sum + parseFloat(item.price),
          0
        ).toFixed(2)
      );
    }
    
    // İyzico'ya gönderilecek tutar - basketItems toplamı (iyzico bunu bekliyor)
    const totalAmount = parseFloat(basketItemsSum.toFixed(2));
    
    // pendingOrder kontrolü
    if (!pendingOrder) {
      throw new Error("Sipariş oluşturulamadı");
    }

    // iyzico ödeme isteği
    const request = {
      locale: "tr",
      conversationId: `CONV-${pendingOrder.id}-${Date.now()}`, // Order ID'yi conversationId'ye ekle
      price: totalAmount.toFixed(2),
      paidPrice: totalAmount.toFixed(2),
      currency: "TRY",
      basketId: pendingOrder.id, // Order ID'yi basketId olarak kullan
      paymentGroup: "PRODUCT",
      callbackUrl: (() => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        try {
          // Base URL'in geçerli olup olmadığını kontrol et
          const base = baseUrl.trim();
          if (!base || base === "") {
            throw new Error("Base URL is empty");
          }
          // URL oluştur
          const url = new URL("/odeme/callback", base);
          return url.toString();
        } catch (error) {
          // URL geçersizse, basit string birleştirme kullan
          console.error("Error creating callback URL:", error);
          const base = baseUrl.trim() || "http://localhost:3000";
          const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
          return `${cleanBase}/odeme/callback`;
        }
      })(),
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: session.user.id,
        name: shippingAddress.firstName,
        surname: shippingAddress.lastName,
        gsmNumber: shippingAddress.phone,
        email: shippingAddress.email || session.user.email || "", // Checkout form'daki email'i kullan
        identityNumber: "11111111111", // TC Kimlik numarası
        lastLoginDate: formatDateForIyzipay(new Date()),
        registrationDate: formatDateForIyzipay(new Date()),
        registrationAddress: shippingAddress.address,
        ip: "127.0.0.1",
        city: shippingAddress.city,
        country: "Turkey",
        zipCode: shippingAddress.postalCode,
      },
      shippingAddress: {
        contactName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        city: shippingAddress.city,
        country: "Turkey",
        address: shippingAddress.address,
        zipCode: shippingAddress.postalCode,
      },
      billingAddress: {
        contactName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        city: shippingAddress.city,
        country: "Turkey",
        address: shippingAddress.address,
        zipCode: shippingAddress.postalCode,
      },
      basketItems: basketItems,
    };

    const iyzipay = await getIyzipay(selectedGateway?.id);
    
    // Debug: Request detaylarını logla
    const basketItemsTotal = request.basketItems.reduce((sum: number, item: any) => sum + parseFloat(item.price), 0);
    const priceValue = parseFloat(request.price);
    const priceDifference = Math.abs(priceValue - basketItemsTotal);
    
    console.log("İyzico Request Detayları:", {
      price: request.price,
      paidPrice: request.paidPrice,
      basketItemsCount: request.basketItems.length,
      basketItemsTotal: basketItemsTotal.toFixed(2),
      priceDifference: priceDifference.toFixed(2),
      basketItems: request.basketItems.map((item: any) => ({ name: item.name, price: item.price })),
      total: total.toFixed(2),
      targetTotal: targetTotal.toFixed(2),
      couponCode: couponCode || "Yok",
      discountAmount: discountAmount || 0,
      discountType: couponForPayment?.discountType || "Yok",
    });
    
    // Kritik kontrol: price ve basketItemsTotal eşit olmalı
    if (priceDifference > 0.01) {
      console.error("❌ İyzico Request Hatası: price ile basketItemsTotal eşit değil!", {
        price: request.price,
        basketItemsTotal: basketItemsTotal.toFixed(2),
        priceDifference: priceDifference.toFixed(2),
      });
      // Hata durumunda siparişi iptal et
      prisma.order.delete({ where: { id: pendingOrder.id } }).catch(console.error);
      throw new Error(`Ödeme tutarı uyumsuz: price (${request.price}) ≠ basketItemsTotal (${basketItemsTotal.toFixed(2)})`);
    }
    
    return new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
        if (err) {
          console.error("İyzico API Hatası:", {
            error: err,
            errorMessage: err?.errorMessage,
            errorCode: err?.errorCode,
            status: err?.status,
            request: {
              price: request.price,
              paidPrice: request.paidPrice,
              basketItemsTotal: basketItemsTotal.toFixed(2),
            },
          });
          // Hata durumunda siparişi iptal et
          prisma.order.delete({ where: { id: pendingOrder.id } }).catch(console.error);
          reject(new Error(err?.errorMessage || "Ödeme formu oluşturulamadı"));
          return;
        }

        console.log("İyzico API Yanıtı:", {
          status: result.status,
          errorMessage: result.errorMessage,
          errorCode: result.errorCode,
          token: result.token ? "Var" : "Yok",
          checkoutFormContent: result.checkoutFormContent ? "Var" : "Yok",
          checkoutFormContentLength: result.checkoutFormContent?.length || 0,
          checkoutFormContentPreview: result.checkoutFormContent?.substring(0, 200) || "Yok",
        });

        if (result.status === "success") {
          if (!result.token) {
            console.error("İyzico token bulunamadı:", result);
            prisma.order.delete({ where: { id: pendingOrder.id } }).catch(console.error);
            reject(new Error("Ödeme token'ı alınamadı"));
            return;
          }
          
          // Token'ı siparişe kaydet (notes'a ekle)
          prisma.order.update({
            where: { id: pendingOrder.id },
            data: {
              notes: `Ödeme başlatıldı. Token: ${result.token}`,
            },
          }).catch(console.error);

          resolve({
            checkoutFormContent: result.checkoutFormContent,
            paymentPageUrl: result.paymentPageUrl,
            token: result.token,
            orderId: pendingOrder.id, // Order ID'yi döndür
          });
        } else {
          console.error("İyzico API Başarısız:", {
            status: result.status,
            errorMessage: result.errorMessage,
            errorCode: result.errorCode,
            errorGroup: result.errorGroup,
            request: {
              price: request.price,
              paidPrice: request.paidPrice,
              basketItemsTotal: basketItemsTotal.toFixed(2),
            },
          });
          // Hata durumunda siparişi iptal et
          prisma.order.delete({ where: { id: pendingOrder.id } }).catch(console.error);
          reject(new Error(result.errorMessage || "Ödeme formu oluşturulamadı"));
        }
      });
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// Ödeme callback'i işle - iyzico CF Sorgulama
export const handlePaymentCallback = async (token: string) => {
  try {
    const iyzipay = await getIyzipay();
    
    return new Promise((resolve, reject) => {
      // iyzico CF Sorgulama API çağrısı
      iyzipay.checkoutForm.retrieve(
        {
          locale: "tr",
          token: token,
          conversationId: `CONV-${Date.now()}`, // Optional, iyzico otomatik oluşturur
        },
        (err: any, result: any) => {
          if (err) {
            console.error("iyzico callback error:", err);
            // Hata detaylarını döndür
            reject({
              error: true,
              errorMessage: err.errorMessage || "Ödeme doğrulanamadı",
              errorCode: err.errorCode || err.status || "UNKNOWN",
              conversationId: err.conversationId || null,
            });
            return;
          }

          // iyzico dokümantasyonuna göre kontrol
          if (result.status === "success" && result.paymentStatus === "SUCCESS") {
            console.log("iyzico callback result - basketId:", result.basketId);
            console.log("iyzico callback result - conversationId:", result.conversationId);
            
            resolve({
              success: true,
              paymentId: result.paymentId,
              conversationId: result.conversationId,
              price: result.paidPrice || result.price,
              currency: result.currency,
              // Buyer bilgileri
              buyerName: result.buyer?.name || "",
              buyerSurname: result.buyer?.surname || "",
              buyerPhone: result.buyer?.gsmNumber || "",
              buyerEmail: result.buyer?.email || "",
              // Shipping bilgileri
              shippingAddress: result.shippingAddress?.address || "",
              shippingCity: result.shippingAddress?.city || "",
              shippingDistrict: result.shippingAddress?.district || "",
              shippingZipCode: result.shippingAddress?.zipCode || "",
              // Payment bilgileri
              paymentMethod: result.cardType || "CREDIT_CARD",
              installment: result.installment || 1,
              basketId: result.basketId, // Order ID'yi basketId olarak kullanıyoruz
            });
          } else {
            // Ödeme başarısız veya bekleniyor - hata detaylarını döndür
            // iyzico result objesinden hata bilgilerini al
            const errorMsg = result.errorMessage || result.errorMessage || result.errorCode || "Ödeme başarısız";
            const errorCode = result.errorCode || result.errorGroup || result.status || "UNKNOWN";
            
            console.error("iyzico payment failed:", {
              status: result.status,
              paymentStatus: result.paymentStatus,
              errorCode: result.errorCode,
              errorMessage: result.errorMessage,
              errorGroup: result.errorGroup,
            });
            
            reject({
              error: true,
              errorMessage: errorMsg,
              errorCode: errorCode,
              conversationId: result.conversationId || null,
              basketId: result.basketId || null,
            });
          }
        }
      );
    });
  } catch (error: any) {
    console.error("Error handling payment callback:", error);
    throw error;
  }
};

