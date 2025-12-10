import { NextRequest, NextResponse } from "next/server";
import { handlePaymentCallback } from "@/lib/actions/payment";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Güvenli URL oluşturma helper fonksiyonu
// Next.js NextResponse.redirect() relative path'leri de kabul eder, bu yüzden direkt path döndürebiliriz
const createRedirectUrl = (path: string, request: NextRequest): string => {
  // Path'in başında / olup olmadığını kontrol et
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  // Next.js NextResponse.redirect() relative path'leri kabul eder
  // Ama absolute URL oluşturmak daha güvenli
  try {
    // request.nextUrl üzerinden origin al
    const origin = request.nextUrl.origin;
    
    // Origin geçerli mi kontrol et
    if (origin && origin !== "null" && origin !== "" && origin.startsWith("http")) {
      try {
        const url = new URL(cleanPath, origin);
        return url.toString();
      } catch (urlError) {
        // URL oluşturma hatası - relative path döndür
        console.warn("Error creating absolute URL, using relative path:", urlError);
        return cleanPath;
      }
    }
    
    // Origin geçersizse, environment variable'dan al
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cleanBase = base.trim();
    
    if (cleanBase && cleanBase !== "" && cleanBase !== "null" && cleanBase.startsWith("http")) {
      try {
        const url = new URL(cleanPath, cleanBase);
        return url.toString();
      } catch (urlError) {
        // URL oluşturma hatası - relative path döndür
        console.warn("Error creating absolute URL from env, using relative path:", urlError);
        return cleanPath;
      }
    }
    
    // Son çare: relative path döndür
    return cleanPath;
  } catch (error) {
    // Herhangi bir hata durumunda relative path döndür
    console.error("Error in createRedirectUrl, using relative path:", error);
    return cleanPath;
  }
};

// iyzico callback'i POST request olarak gelir
export async function POST(request: NextRequest) {
  try {
    // POST body'den token'ı al
    const formData = await request.formData();
    const token = formData.get("token") as string;

    // Eğer formData'da yoksa, URL search params'tan al
    const searchParams = request.nextUrl.searchParams;
    const tokenFromUrl = searchParams.get("token");
    const finalToken = token || tokenFromUrl;

    if (!finalToken || finalToken.trim() === "") {
      return NextResponse.redirect(new URL("/sepet?error=payment_failed&reason=missing_token", request.url), { status: 307 });
    }

    // Ödeme doğrulama - iyzico CF Sorgulama
    let paymentResult: any = null;
    try {
      paymentResult = await handlePaymentCallback(finalToken) as any;
    } catch (error: any) {
      // Ödeme başarısız - hata yakalandı
      console.error("Payment callback failed:", error);
      
      // Hata detaylarını al
      const errorCode = error?.errorCode || error?.code || "UNKNOWN";
      const errorMessage = error?.errorMessage || error?.message || "Ödeme başarısız";
      const conversationId = error?.conversationId || null;
      const basketId = error?.basketId || null;
      
      // OrderId'yi bulmaya çalış
      let orderId: string | null = null;
        
      // ConversationId'den orderId çıkar
      if (conversationId) {
        const convMatch = conversationId.match(/^CONV-([^-]+)-/);
        if (convMatch && convMatch[1]) {
          orderId = convMatch[1];
          }
        }
        
      // BasketId'den orderId al
      if (!orderId && basketId) {
        const orderById = await prisma.order.findUnique({
          where: { id: basketId },
        });
        if (orderById) {
          orderId = basketId;
        }
      }
      
      // Siparişi güncelle ve stokları geri ver (eğer bulunduysa)
      if (orderId) {
        try {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          });
          
          if (order) {
            // Stokları geri ver (rezerve edilmiş stokları geri ekle)
            for (const item of order.items) {
              if (item.productId) {
              await prisma.product.update({
                where: { id: item.productId },
                data: {
                  stock: {
                    increment: item.quantity,
                  },
              },
            });
              }
          }
          
            // Siparişi güncelle - PENDING olarak bırak (kullanıcı tekrar deneyebilir)
            await prisma.order.update({
              where: { id: orderId },
              data: {
                notes: `Ödeme başarısız. Hata: ${errorMessage} (Kod: ${errorCode}). Stoklar geri verildi, sepet korundu.`,
                paymentStatus: "FAILED",
                status: "PENDING", // PENDING olarak bırak - kullanıcı tekrar deneyebilir
              },
            });
            
            // Cache'i yenile
            revalidatePath("/hesabim");
            revalidatePath("/hesabim/siparisler");
            revalidatePath(`/hesabim/siparisler/${orderId}`);
          }
        } catch (updateError) {
          console.error("Error updating order and restoring stock:", updateError);
            }
      }
      
      // Başarısız sayfasına yönlendir
      const params = new URLSearchParams({
        errorCode: errorCode,
        errorMessage: encodeURIComponent(errorMessage),
      });
      if (orderId) {
        params.append("orderId", orderId);
      }
      
      const redirectPath = `/odeme/basarisiz?${params.toString()}`;
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta http-equiv="refresh" content="0;url=${redirectPath}">
            <script>
              window.location.href = "${redirectPath}";
            </script>
          </head>
          <body>
            <p>Ödeme başarısız. Yönlendiriliyorsunuz... <a href="${redirectPath}">Buraya tıklayın</a></p>
          </body>
        </html>
      `;
      
      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    console.log("Payment callback result:", JSON.stringify(paymentResult, null, 2));
    console.log("Payment callback - conversationId:", paymentResult?.conversationId);
    console.log("Payment callback - basketId:", paymentResult?.basketId);
    console.log("Payment callback - paymentId:", paymentResult?.paymentId);

    // Ödeme başarılı mı kontrol et
    if (
      !paymentResult ||
      typeof paymentResult !== "object" ||
      !("success" in paymentResult) ||
      paymentResult.success !== true ||
      !paymentResult.paymentId
    ) {
      // Ödeme başarısız - başarısız sayfasına yönlendir
      console.error("Payment failed - invalid payment result:", paymentResult);
      
      // OrderId'yi bulmaya çalış
      let orderId: string | null = null;
      if (paymentResult?.conversationId) {
        const convMatch = paymentResult.conversationId.match(/^CONV-([^-]+)-/);
        if (convMatch && convMatch[1]) {
          orderId = convMatch[1];
        }
      }
      if (!orderId && paymentResult?.basketId) {
        orderId = paymentResult.basketId;
      }
      
      const params = new URLSearchParams({
        errorCode: paymentResult?.errorCode || "INVALID_RESULT",
        errorMessage: encodeURIComponent(paymentResult?.errorMessage || "Ödeme sonucu geçersiz"),
      });
      if (orderId) {
        params.append("orderId", orderId);
      }
      
      const redirectPath = `/odeme/basarisiz?${params.toString()}`;
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta http-equiv="refresh" content="0;url=${redirectPath}">
            <script>
              window.location.href = "${redirectPath}";
            </script>
          </head>
          <body>
            <p>Ödeme başarısız. Yönlendiriliyorsunuz... <a href="${redirectPath}">Buraya tıklayın</a></p>
          </body>
        </html>
      `;
      
      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    // Ödeme başarılı - devam et
    // OrderId'yi bul - öncelik sırası:
      // 1. ConversationId'den (CONV-{orderId}-{timestamp} formatı)
      // 2. BasketId'den (orderId olarak kullanıyoruz)
      // 3. PaymentId ile mevcut sipariş kontrolü
      let orderId: string | null = null;
        
      // 1. ConversationId'den orderId çıkar
      if (paymentResult.conversationId) {
        const convMatch = paymentResult.conversationId.match(/^CONV-([^-]+)-/);
        if (convMatch && convMatch[1]) {
          orderId = convMatch[1];
          console.log("Order ID from conversationId:", orderId);
          }
        }
        
      // 2. BasketId'den orderId al (eğer conversationId'den bulunamadıysa)
      if (!orderId && paymentResult.basketId) {
        // BasketId olarak orderId kullanıyoruz
        const orderById = await prisma.order.findUnique({
          where: { id: paymentResult.basketId },
            });
        if (orderById) {
          orderId = paymentResult.basketId;
          console.log("Order ID from basketId:", orderId);
        }
      }

      // 3. PaymentId ile mevcut sipariş kontrolü (duplicate ödeme kontrolü)
      if (!orderId) {
        const orderByPaymentId = await prisma.order.findFirst({
          where: { paymentId: paymentResult.paymentId },
        });
        if (orderByPaymentId) {
          orderId = orderByPaymentId.id;
          console.log("Order ID from paymentId (duplicate check):", orderId);
            }
      }

      if (!orderId) {
        console.error("Order not found for payment. ConversationId:", paymentResult.conversationId, "PaymentId:", paymentResult.paymentId);
        // Debug: Tüm pending siparişleri listele
        const pendingOrders = await prisma.order.findMany({
          where: {
            paymentStatus: "PENDING",
            paymentMethod: "iyzico",
          },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            notes: true,
            createdAt: true,
          },
        });
        console.log("Recent pending orders:", pendingOrders);
        
        return NextResponse.redirect(new URL("/sepet?error=order_not_found", request.url), { status: 307 });
        }
        
      // Siparişi bul
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        console.error("Order not found in database:", orderId);
        // Debug: OrderId formatını kontrol et
        console.error("OrderId format check:", {
          orderId,
          length: orderId?.length,
          type: typeof orderId,
        });
        
        return NextResponse.redirect(new URL("/sepet?error=order_not_found", request.url), { status: 307 });
      }

      // Duplicate ödeme kontrolü - eğer sipariş zaten tamamlanmışsa
      if (order.paymentStatus === "COMPLETED" && order.paymentId === paymentResult.paymentId) {
        console.log("Order already completed, redirecting to success page");
        
        // Cache'i yenile
        revalidatePath("/hesabim");
        revalidatePath("/hesabim/siparisler");
        revalidatePath(`/hesabim/siparisler/${order.id}`);
        
        const redirectPath = `/odeme/basarili?orderId=${encodeURIComponent(order.id)}&paymentMethod=iyzico`;
        
        // HTML response döndür - client-side'da redirect yap
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta http-equiv="refresh" content="0;url=${redirectPath}">
              <script>
                window.location.href = "${redirectPath}";
              </script>
            </head>
            <body>
              <p>Yönlendiriliyorsunuz... <a href="${redirectPath}">Buraya tıklayın</a></p>
            </body>
          </html>
        `;
        
        return new NextResponse(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
              },
        });
      }
          
      // Siparişi güncelle - ödeme başarılı
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentId: paymentResult.paymentId,
          paymentStatus: "COMPLETED",
          status: "PROCESSING", // Hazırlanıyor durumu
          notes: `Ödeme tamamlandı. iyzico Payment ID: ${paymentResult.paymentId}. Conversation ID: ${paymentResult.conversationId}`,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true, // Kullanıcı bilgisini al (sepeti temizlemek için)
        },
      });

      console.log("Order updated successfully:", updatedOrder.id);

      // Cache'i yenile - siparişler sayfasının güncel veriyi göstermesi için
      revalidatePath("/hesabim");
      revalidatePath("/hesabim/siparisler");
      revalidatePath(`/hesabim/siparisler/${updatedOrder.id}`);

      // Ödeme başarılı olduğunda sepeti temizle
      if (updatedOrder.userId) {
        try {
          const cart = await prisma.cart.findUnique({
            where: { userId: updatedOrder.userId },
          });

          if (cart) {
            await prisma.cartItem.deleteMany({
              where: { cartId: cart.id },
            });
            console.log("Cart cleared after successful payment");
          }
        } catch (cartError) {
          console.error("Error clearing cart after payment:", cartError);
          // Sepet temizleme hatası ödeme başarısını etkilemez
        }
      }

      // Başarılı sayfasına yönlendir - HTML response ile client-side redirect
      const redirectPath = `/odeme/basarili?orderId=${encodeURIComponent(updatedOrder.id)}&paymentMethod=iyzico`;
      
      // HTML response döndür - client-side'da redirect yap
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta http-equiv="refresh" content="0;url=${redirectPath}">
            <script>
              window.location.href = "${redirectPath}";
            </script>
          </head>
          <body>
            <p>Yönlendiriliyorsunuz... <a href="${redirectPath}">Buraya tıklayın</a></p>
          </body>
        </html>
      `;
      
      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
  } catch (error: any) {
    console.error("Payment callback error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      requestUrl: request.url,
    });
    
    try {
      return NextResponse.redirect(new URL("/sepet?error=payment_failed", request.url), { status: 307 });
    } catch (redirectError) {
      console.error("Error creating redirect URL:", redirectError);
      // Son çare: basit string redirect
      return NextResponse.redirect("/sepet?error=payment_failed", { status: 307 });
    }
  }
}

// GET request için de destek (fallback)
export async function GET(request: NextRequest) {
  try {
    // GET request'i POST handler'a yönlendir
    return POST(request);
  } catch (error: any) {
    console.error("GET handler error:", error);
    // Hata durumunda güvenli redirect
    try {
      return NextResponse.redirect(new URL("/sepet?error=payment_failed", request.url), { status: 307 });
    } catch {
      // Son çare: basit redirect
      return NextResponse.redirect("/sepet?error=payment_failed", { status: 307 });
    }
  }
}

