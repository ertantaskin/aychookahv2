import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

// PayTR callback route - PayTR'den POST request gelir
export async function POST(request: NextRequest) {
  let merchant_oid: string | null = null;
  
  try {
    // PayTR form-data olarak gönderir
    const body = await request.formData();

    merchant_oid = body.get("merchant_oid") as string;
    const status = body.get("status") as string;
    const total_amount = body.get("total_amount") as string;
    const hash = body.get("hash") as string;
    const failed_reason_code = body.get("failed_reason_code") as string;
    const failed_reason_msg = body.get("failed_reason_msg") as string;
    const test_mode = body.get("test_mode") as string;
    const payment_type = body.get("payment_type") as string;
    const currency = body.get("currency") as string;
    const payment_amount = body.get("payment_amount") as string;
    const installment_count = body.get("installment_count") as string;

    // Log callback (production'da sadece hata durumlarında)
    console.log("PayTR callback received:", {
      merchant_oid,
      status,
      total_amount,
      test_mode,
    });

    if (!merchant_oid) {
      console.error("PayTR callback: merchant_oid eksik");
      // PayTR'ye "OK" döndür (PayTR tekrar deneyecek)
      return new NextResponse("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // Siparişi bul
    // merchant_oid PayTR'ye gönderilirken temizlenmiş (özel karakterler kaldırılmış) olabilir
    // Önce direkt orderNumber ile dene, sonra temizlenmiş halini dene
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: merchant_oid }, // Direkt eşleşme
          // Prisma'da regex desteği yok, bu yüzden contains kullanıyoruz
          // Ama daha iyi bir çözüm için tüm siparişleri çekip filtreleyebiliriz
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    // Eğer direkt bulunamadıysa, tüm siparişleri çekip temizlenmiş orderNumber ile karşılaştır
    if (!order) {
      const orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      });

      // merchant_oid ile eşleşen siparişi bul (orderNumber'ı temizleyip karşılaştır)
      order = orders.find((o) => {
        const cleanOrderNumber = o.orderNumber.replace(/[^a-zA-Z0-9]/g, "");
        return cleanOrderNumber === merchant_oid;
      }) || null;
    }

    if (!order) {
      console.error("PayTR callback: Order not found", merchant_oid);
      // PayTR'ye "OK" döndür (PayTR tekrar deneyecek)
      return new NextResponse("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // PayTR gateway'ini bul
    const gateway = await prisma.paymentGateway.findFirst({
      where: {
        name: "paytr",
        isActive: true,
      },
    });

    if (!gateway) {
      console.error("PayTR callback: Gateway not found");
      // PayTR'ye "OK" döndür (PayTR tekrar deneyecek)
      return new NextResponse("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    const config = gateway.config as any;
    const merchant_key = config?.merchant_key || process.env.PAYTR_MERCHANT_KEY;
    const merchant_salt = config?.merchant_salt || process.env.PAYTR_MERCHANT_SALT;

    if (!merchant_key || !merchant_salt) {
      console.error("PayTR callback: Config missing");
      // PayTR'ye "OK" döndür (PayTR tekrar deneyecek)
      return new NextResponse("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // Hash kontrolü
    const hash_str = merchant_oid + merchant_salt + status + total_amount;
    const calculated_hash = crypto
      .createHmac("sha256", merchant_key)
      .update(hash_str)
      .digest("base64");

    if (calculated_hash !== hash) {
      console.error("PayTR callback: Hash mismatch", {
        calculated: calculated_hash,
        received: hash,
        merchant_oid,
        status,
        total_amount,
      });
      // Güvenlik: Hash uyuşmazlığında bile "OK" döndür (PayTR tekrar deneyecek)
      // Ama işlem yapma
      return new NextResponse("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // Ödeme başarılı
    if (status === "success") {
      // Duplicate kontrolü - eğer sipariş zaten ödendiyse tekrar işlem yapma
      if (order.paymentStatus === "COMPLETED") {
        console.log("PayTR callback: Order already completed", order.id);
        // PayTR'ye sadece "OK" string'i döndür
        return new NextResponse("OK", {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      }

      // Stokları düşür
      for (const item of order.items) {
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

      // Siparişi güncelle
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentId: merchant_oid,
          paymentStatus: "COMPLETED",
          status: "PROCESSING",
          notes: `Ödeme tamamlandı. PayTR Payment ID: ${merchant_oid}. Tutar: ${total_amount} ${currency}. Taksit: ${installment_count || "1"}. Ödeme Tipi: ${payment_type || "N/A"}. Test Modu: ${test_mode || "0"}. Callback time: ${new Date().toISOString()}`,
        },
      });

      // Cache'i yenile
      revalidatePath("/hesabim");
      revalidatePath("/hesabim/siparisler");
      revalidatePath(`/hesabim/siparisler/${order.id}`);

      // Sepeti temizle
      if (order.userId) {
        await prisma.cartItem.deleteMany({
          where: {
            cart: {
              userId: order.userId,
            },
          },
        });
      }

      // Kupon kullanımını kaydet
      if (order.couponCode) {
        // Kuponu bul
        const coupon = await prisma.coupon.findUnique({
          where: { code: order.couponCode.toUpperCase() },
        });

        if (coupon) {
          // Aynı sipariş için daha önce kayıt yapılmış mı kontrol et
          const existingUsage = await prisma.couponUsage.findFirst({
            where: {
              couponId: coupon.id,
              orderId: order.id,
            },
          });

          if (!existingUsage) {
            await prisma.couponUsage.create({
              data: {
                couponId: coupon.id,
                userId: order.userId || undefined,
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
      }

      console.log("PayTR callback: Payment completed successfully", order.id);
      // PayTR'ye sadece "OK" string'i döndür (JSON değil)
      // PayTR dokümantasyonuna göre sadece "OK" text response bekliyor
      return new NextResponse("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } else {
      // Ödeme başarısız
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          notes: `Ödeme başarısız. PayTR Hata Kodu: ${failed_reason_code || "N/A"}. Hata Mesajı: ${failed_reason_msg || "N/A"}. Callback time: ${new Date().toISOString()}`,
        },
      });

      console.log("PayTR callback: Payment failed", {
        orderId: order.id,
        reason: failed_reason_msg,
        code: failed_reason_code,
      });
      
      // Cache'i yenile
      revalidatePath("/hesabim");
      revalidatePath("/hesabim/siparisler");
      
      // PayTR'ye sadece "OK" string'i döndür (JSON değil)
      return new NextResponse("OK", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }
  } catch (error: any) {
    console.error("PayTR callback error:", {
      error: error.message,
      stack: error.stack,
      merchant_oid,
    });
    
    // PayTR'ye "OK" döndür (PayTR tekrar deneyecek)
    // Hata logları zaten console'a yazıldı
    return new NextResponse("OK", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}

