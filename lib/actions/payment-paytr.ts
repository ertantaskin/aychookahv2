"use server";

import { auth } from "@/lib/auth";
import { getCart } from "./cart";
import { prisma } from "@/lib/prisma";
import { getTaxSettings } from "@/lib/utils/tax-calculator";
import { getShippingSettings, calculateShippingCost } from "@/lib/utils/shipping-calculator";
import { calculateTaxForCartWithShipping } from "@/lib/utils/tax-calculator";
import crypto from "crypto";

// PayTR token oluştur
export const createPayTRToken = async (
  shippingAddress: any,
  orderId: string,
  paymentGatewayId?: string,
  couponCode?: string,
  couponDiscountAmount?: number
) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    // Gateway'i getir
    let gateway = null;
    if (paymentGatewayId) {
      gateway = await prisma.paymentGateway.findUnique({
        where: { id: paymentGatewayId },
      });
    }

    if (!gateway || gateway.name !== "paytr" || !gateway.isActive) {
      // Aktif PayTR gateway'ini bul
      gateway = await prisma.paymentGateway.findFirst({
        where: {
          name: "paytr",
          isActive: true,
        },
      });
    }

    if (!gateway) {
      throw new Error("PayTR ödeme sistemi yapılandırılmamış");
    }

    const config = gateway.config as any;
    const merchant_id = config?.merchant_id || process.env.PAYTR_MERCHANT_ID;
    const merchant_key = config?.merchant_key || process.env.PAYTR_MERCHANT_KEY;
    const merchant_salt = config?.merchant_salt || process.env.PAYTR_MERCHANT_SALT;
    const test_mode = gateway.isTestMode ? "1" : "0";
    const iframe_v2_dark = config?.iframe_v2_dark || "0";

    if (!merchant_id || !merchant_key || !merchant_salt) {
      throw new Error("PayTR yapılandırması eksik");
    }

    // Siparişi getir
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order || order.userId !== session.user.id) {
      throw new Error("Sipariş bulunamadı");
    }

    if (order.paymentStatus === "COMPLETED") {
      throw new Error("Bu sipariş zaten ödendi");
    }

    // Kullanıcı IP'sini al (server-side)
    const user_ip = 
      (shippingAddress as any).user_ip || 
      process.env.NEXT_PUBLIC_SERVER_IP || 
      "127.0.0.1";

    // Email
    const email = order.user?.email || session.user.email || "";

    // Ödeme tutarı (kuruş cinsinden)
    const payment_amount = Math.round(order.total * 100);

    // Sipariş numarası - PayTR sadece alfanumerik kabul ediyor, özel karakterleri temizle
    const merchant_oid = order.orderNumber.replace(/[^a-zA-Z0-9]/g, "").substring(0, 64) || `ORD${Date.now()}`;

    // Sepet içeriği (base64 encoded JSON)
    // PayTR formatı: [["Ürün Adı", "birim_fiyat_TL", "miktar"]]
    // Basket'te birim fiyat TL cinsinden gönderilmeli (payment_amount kuruş cinsinden ama basket'te TL)
    // Örnek: 4999 TL → basket'te "4999.00" veya "4999", payment_amount'da 499900
    const basket = order.items.map((item) => [
      item.productName || item.product?.name || "Ürün",
      item.price.toFixed(2), // TL cinsinden birim fiyat (ondalık kısmı ile)
      item.quantity.toString(),
    ]);

    const user_basket = Buffer.from(JSON.stringify(basket)).toString("base64");

    // Diğer parametreler
    const no_installment = config?.no_installment || "0"; // Taksit yapılmasını istemiyorsanız 1
    const max_installment = config?.max_installment || "0"; // Maksimum taksit sayısı (0 = sınırsız)
    const currency = config?.currency || "TL";
    const timeout_limit = config?.timeout_limit || "30";
    const lang = config?.lang || "tr";
    const debug_on = config?.debug_on || (process.env.NODE_ENV === "development" ? "1" : "0"); // Hata mesajlarının ekrana basılması için

    // Kullanıcı bilgileri
    const user_name = shippingAddress.firstName
      ? `${shippingAddress.firstName} ${shippingAddress.lastName || ""}`.trim()
      : order.user?.name || "";
    const user_address = shippingAddress.address || "";
    
    // Telefon numarasını PayTR formatına uygun hale getir
    // PayTR gereksinimleri: Sadece rakamlar, en az 10 hane
    let user_phone = shippingAddress.phone || "";
    if (user_phone) {
      // Tüm boşluk, tire, parantez, + gibi karakterleri kaldır, sadece rakamları al
      user_phone = user_phone.replace(/\D/g, "");
      
      // Eğer "+90" ile başlıyorsa (90 rakamları), "+90"ı kaldır
      // Türkiye numaraları için 10 hane yeterli (5XX XXX XX XX)
      if (user_phone.startsWith("90") && user_phone.length > 10) {
        user_phone = user_phone.substring(2);
      }
      
      // En az 10 hane kontrolü - PayTR gereksinimi
      if (user_phone.length < 10) {
        console.warn(`PayTR: Telefon numarası 10 haneden az: ${user_phone.length} hane. Boş gönderiliyor.`);
        user_phone = ""; // PayTR'ye boş gönder (PayTR boş telefon numarasını kabul eder)
      }
    }

    // Callback URL'leri - Production URL'i kullan
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    // Base URL'den trailing slash'i temizle
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    
    // PayTR callback URL'i - PayTR'den POST request gelecek
    // PayTR dokümantasyonuna göre callback URL'i merchant_ok_url ve merchant_fail_url'den farklı
    // Callback URL'i PayTR panelinden ayarlanır, ama burada da belirtilebilir
    // Şimdilik merchant_ok_url ve merchant_fail_url kullanıyoruz
    const merchant_ok_url = `${cleanBaseUrl}/odeme/paytr/basarili?orderId=${orderId}`;
    const merchant_fail_url = `${cleanBaseUrl}/odeme/paytr/basarisiz?orderId=${orderId}`;
    
    // PayTR callback URL'i (PayTR panelinden ayarlanmalı, burada sadece referans)
    // PayTR callback'i: POST /api/payment/paytr/callback
    const callback_url = `${cleanBaseUrl}/api/payment/paytr/callback`;

    // Hash oluştur
    const hash_str = `${merchant_id}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`;
    const paytr_token = crypto
      .createHmac("sha256", merchant_key)
      .update(hash_str + merchant_salt)
      .digest("base64");

    // PayTR API'ye istek gönder
    const formData = new URLSearchParams();
    formData.append("merchant_id", merchant_id);
    formData.append("merchant_key", merchant_key);
    formData.append("merchant_salt", merchant_salt);
    formData.append("email", email);
    formData.append("payment_amount", payment_amount.toString());
    formData.append("merchant_oid", merchant_oid);
    formData.append("user_name", user_name);
    formData.append("user_address", user_address);
    formData.append("user_phone", user_phone);
    formData.append("merchant_ok_url", merchant_ok_url);
    formData.append("merchant_fail_url", merchant_fail_url);
    formData.append("user_basket", user_basket);
    formData.append("user_ip", user_ip);
    formData.append("timeout_limit", timeout_limit);
    formData.append("debug_on", debug_on);
    formData.append("test_mode", test_mode);
    formData.append("lang", lang);
    formData.append("no_installment", no_installment);
    formData.append("max_installment", max_installment);
    formData.append("currency", currency);
    formData.append("paytr_token", paytr_token);
    formData.append("iframe_v2", "1");
    formData.append("iframe_v2_dark", iframe_v2_dark);

    const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const result = await response.json();

    if (result.status === "success") {
      return {
        success: true,
        token: result.token,
        orderId: order.id,
        orderNumber: order.orderNumber,
      };
    } else {
      throw new Error(result.reason || "PayTR token oluşturulamadı");
    }
  } catch (error: any) {
    console.error("PayTR token error:", error);
    throw new Error(error.message || "PayTR ödeme başlatılamadı");
  }
};

