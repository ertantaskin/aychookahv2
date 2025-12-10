"use server";

import { auth } from "@/lib/auth";
import { getCart } from "./cart";
import { getActivePaymentGateway } from "./admin/payment-gateways";
import { prisma } from "@/lib/prisma";

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
export const createPayment = async (shippingAddress: any, paymentMethod?: string, retryOrderId?: string) => {
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
      const result = await createOrderForEftHavale(shippingAddress, "EFT/Havale");
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

    // Toplam hesapla
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const shippingCost = 0;
    const tax = subtotal * 0.20;
    const total = subtotal + shippingCost + tax;

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

      // Mevcut siparişi güncelle (yeni shipping address ile)
      pendingOrder = await prisma.order.update({
        where: { id: retryOrderId },
        data: {
          shippingAddress,
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
          
          // Siparişi güncelle (yeni shipping address ile)
          pendingOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
              shippingAddress,
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
        // Yeni sipariş oluştur
        // Ödeme başlatılmadan önce PENDING durumunda sipariş oluştur (veritabanına kaydet)
        // Bu sayede callback'te userId ve tüm bilgileri veritabanından alabiliriz
        pendingOrder = await prisma.order.create({
          data: {
            orderNumber,
            userId: session.user.id,
            total,
            subtotal,
            shippingCost,
            tax,
            shippingAddress,
            paymentMethod: "iyzico",
            paymentStatus: "PENDING",
            status: "PENDING",
            notes: `Ödeme başlatıldı. Token bekleniyor.`,
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

        // Stokları rezerve et (azalt) - ödeme başarılı olursa kalıcı olacak
        // Ödeme başarısız olursa callback'te geri verilecek
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
      }
    }

    // Sepeti TEMİZLEME - sadece ödeme başarılı olduğunda temizlenecek (callback'te)
    // Ödeme başarısız olursa sepet korunacak, kullanıcı tekrar deneyebilecek

    // BasketItems oluştur - retry durumunda mevcut siparişten, yeni siparişte sepetten
    let basketItems;
    if (retryOrderId && pendingOrder) {
      // Mevcut siparişten basketItems oluştur
      basketItems = pendingOrder.items.map((item) => {
        const itemPrice = item.price * item.quantity;
        const itemTax = itemPrice * 0.20; // %20 KDV
        const itemTotalWithTax = itemPrice + itemTax;
        
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
      basketItems = cart.items.map((item) => {
      const itemPrice = item.product.price * item.quantity;
      const itemTax = itemPrice * 0.20; // %20 KDV
      const itemTotalWithTax = itemPrice + itemTax;
      
      return {
        id: item.productId,
        name: item.product.name,
          category1: (item.product as any).category?.name || "Genel",
        itemType: "PHYSICAL",
        price: parseFloat(itemTotalWithTax.toFixed(2)).toFixed(2), // Yuvarlama için
      };
    });
    }

    // BasketItems toplamını hesapla (price ve paidPrice ile eşleşmeli)
    const basketItemsSum = parseFloat(
      basketItems.reduce(
        (sum, item) => sum + parseFloat(item.price),
        0
      ).toFixed(2)
    );

    // iyzico ödeme isteği
    const request = {
      locale: "tr",
      conversationId: `CONV-${pendingOrder.id}-${Date.now()}`, // Order ID'yi conversationId'ye ekle
      price: basketItemsSum.toFixed(2),
      paidPrice: basketItemsSum.toFixed(2),
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
    
    return new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
        if (err) {
          console.error("iyzico error:", err);
          // Hata durumunda siparişi iptal et
          prisma.order.delete({ where: { id: pendingOrder.id } }).catch(console.error);
          reject(new Error("Ödeme formu oluşturulamadı"));
          return;
        }

        if (result.status === "success") {
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

