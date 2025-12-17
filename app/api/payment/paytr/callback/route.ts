import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// PayTR callback için timeout süresini artır (30 saniye)
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();

    const merchant_oid = body.get("merchant_oid") as string;
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

    if (!merchant_oid) {
      console.error("PayTR callback: merchant_oid eksik");
      // PayTR'ye "OK" döndür (PayTR tekrar deneyecek)
      return new NextResponse("OK", { status: 200 });
    }

    // Siparişi bul - Optimize edilmiş sorgu
    // merchant_oid PayTR'ye gönderilirken temizlenmiş (özel karakterler kaldırılmış) olabilir
    // Önce direkt orderNumber ile dene
    let order = await prisma.order.findFirst({
      where: {
        orderNumber: merchant_oid, // Direkt eşleşme
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                stock: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    // Eğer direkt bulunamadıysa, temizlenmiş orderNumber ile dene
    // Sadece son 100 siparişi kontrol et (performans için)
    if (!order) {
      const recentOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Son 24 saat
          },
        },
        select: {
          id: true,
          orderNumber: true,
        },
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
      });

      // merchant_oid ile eşleşen siparişi bul (orderNumber'ı temizleyip karşılaştır)
      const matchedOrder = recentOrders.find((o) => {
        const cleanOrderNumber = o.orderNumber.replace(/[^a-zA-Z0-9]/g, "");
        return cleanOrderNumber === merchant_oid;
      });

      if (matchedOrder) {
        // Eşleşen siparişi tam detaylarıyla getir
        order = await prisma.order.findUnique({
          where: { id: matchedOrder.id },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    stock: true,
                  },
                },
              },
            },
            user: {
              select: {
                id: true,
              },
            },
          },
        });
      }
    }

    if (!order) {
      console.error("PayTR callback: Order not found", merchant_oid);
      // PayTR'ye "OK" döndür (PayTR tekrar deneyecek)
      return new NextResponse("OK", { status: 200 });
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
      return new NextResponse("OK", { status: 200 });
    }

    const config = gateway.config as any;
    const merchant_key = config?.merchant_key || process.env.PAYTR_MERCHANT_KEY;
    const merchant_salt = config?.merchant_salt || process.env.PAYTR_MERCHANT_SALT;

    if (!merchant_key || !merchant_salt) {
      console.error("PayTR callback: Config missing");
      // PayTR'ye "OK" döndür (PayTR tekrar deneyecek)
      return new NextResponse("OK", { status: 200 });
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
      // PayTR'ye "OK" döndür (PayTR tekrar deneyecek)
      return new NextResponse("OK", { status: 200 });
    }

    // Ödeme başarılı
    if (status === "success") {
      // Duplicate kontrolü - eğer sipariş zaten ödendiyse tekrar işlem yapma
      if (order.paymentStatus === "COMPLETED") {
        console.log("PayTR callback: Order already completed", order.id);
        // PayTR'ye sadece "OK" string'i döndür
        return new NextResponse("OK", { status: 200 });
      }

      // ÖNEMLİ: PayTR'ye hızlı yanıt ver, sonra işlemleri yap
      // Önce "OK" döndür, sonra arka planda işlemleri tamamla
      // Ancak bu güvenli değil, bu yüzden kritik işlemleri önce yapalım

      // Transaction içinde tüm işlemleri yap (daha hızlı ve güvenli)
      await prisma.$transaction(async (tx) => {
        // 1. Stokları düşür (paralel güncellemeler için Promise.all kullan)
        const stockUpdates = order.items
          .filter((item) => item.productId)
          .map((item) =>
            tx.product.update({
              where: { id: item.productId! },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
          );
        await Promise.all(stockUpdates);

        // 2. Siparişi güncelle
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentId: merchant_oid,
            paymentStatus: "COMPLETED",
            status: "PROCESSING",
            notes: `Ödeme tamamlandı. PayTR Payment ID: ${merchant_oid}. Tutar: ${total_amount} ${currency}. Taksit: ${installment_count || "1"}. Ödeme Tipi: ${payment_type || "N/A"}. Test Modu: ${test_mode || "0"}. Callback time: ${new Date().toISOString()}`,
          },
        });

        // 3. Sepeti temizle (eğer kullanıcı varsa)
        if (order.userId) {
          await tx.cartItem.deleteMany({
            where: {
              cart: {
                userId: order.userId,
              },
            },
          });
        }

        // 4. Kupon kullanımını kaydet (eğer varsa)
        if (order.couponCode) {
          const coupon = await tx.coupon.findUnique({
            where: { code: order.couponCode.toUpperCase() },
          });

          if (coupon) {
            const existingUsage = await tx.couponUsage.findFirst({
              where: {
                couponId: coupon.id,
                orderId: order.id,
              },
            });

            if (!existingUsage) {
              await Promise.all([
                tx.couponUsage.create({
                  data: {
                    couponId: coupon.id,
                    userId: order.userId || undefined,
                    orderId: order.id,
                  },
                }),
                tx.coupon.update({
                  where: { id: coupon.id },
                  data: {
                    usedCount: {
                      increment: 1,
                    },
                  },
                }),
              ]);
            }
          }
        }
      });

      console.log("PayTR callback: Payment completed successfully", order.id);
      // PayTR'ye sadece "OK" string'i döndür (JSON değil)
      return new NextResponse("OK", { status: 200 });
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
      // PayTR'ye sadece "OK" string'i döndür (JSON değil)
      return new NextResponse("OK", { status: 200 });
    }
  } catch (error: any) {
    console.error("PayTR callback error:", error);
    // PayTR'ye "OK" döndür (PayTR tekrar deneyecek)
    // Hata logları zaten console'a yazıldı
    return new NextResponse("OK", { status: 200 });
  }
}

