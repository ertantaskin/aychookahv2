import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCart } from "@/lib/actions/cart";
import { getOrder } from "@/lib/actions/orders";
import { getAddresses } from "@/lib/actions/addresses";
import { prisma } from "@/lib/prisma";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { getTaxSettings } from "@/lib/utils/tax-calculator";
import { getShippingSettings, calculateShippingCost } from "@/lib/utils/shipping-calculator";
import { calculateTaxForCartWithShipping } from "@/lib/utils/tax-calculator";

export const metadata: Metadata = {
  title: "Ödeme",
  description: "Siparişinizi tamamlayın",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CheckoutPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/giris?error=login_required&callbackUrl=/odeme");
  }

  const params = await searchParams;
  const retryOrderId = params.retry as string | undefined;

  // Eğer retry parametresi varsa, mevcut PENDING siparişi getir
  let retryOrder = null;
  if (retryOrderId) {
    try {
      retryOrder = await prisma.order.findUnique({
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

      // Sipariş kontrolü
      if (!retryOrder || retryOrder.userId !== session.user.id) {
        redirect("/sepet?error=order_not_found");
      }

      if (retryOrder.paymentStatus !== "PENDING" && retryOrder.paymentStatus !== "FAILED") {
        redirect("/sepet?error=order_not_retryable");
      }
    } catch (error) {
      console.error("Error fetching retry order:", error);
      redirect("/sepet?error=order_not_found");
    }
  }

  // Kullanıcının kayıtlı adreslerini getir
  const addresses = await getAddresses();

  // Ayarları getir
  const taxSettings = await getTaxSettings();
  const shippingSettings = await getShippingSettings();

  // Retry durumunda sepet kontrolü yapmıyoruz, mevcut siparişi kullanıyoruz
  // Normal durumda sepet kontrolü yapıyoruz
  if (!retryOrderId) {
    const cart = await getCart();

    if (!cart || cart.items.length === 0) {
      redirect("/sepet");
    }

    // Hesaplamaları yap
    const cartSubtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const shippingCost = calculateShippingCost(cartSubtotal, shippingSettings);
    const taxCalculation = calculateTaxForCartWithShipping(
      cartSubtotal,
      shippingCost,
      taxSettings.defaultTaxRate,
      taxSettings.taxIncluded
    );
    const total = taxCalculation.total;

    return (
      <CheckoutClient
        cart={cart}
        retryOrder={null}
        addresses={addresses}
        userEmail={session.user.email || ""}
        calculatedSubtotal={taxCalculation.subtotal}
        calculatedTax={taxCalculation.tax}
        calculatedShipping={taxCalculation.shippingCost}
        calculatedTotal={total}
        taxSettings={taxSettings}
        shippingSettings={shippingSettings}
      />
    );
  }

  // Retry durumunda - güncel sepetten hesaplama yap (kargo ücreti veya vergi değişmiş olabilir)
  const cart = await getCart();
  
  if (!cart || cart.items.length === 0) {
    redirect("/sepet");
  }

  // Güncel hesaplamaları yap
  const cartSubtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCost = calculateShippingCost(cartSubtotal, shippingSettings);
  const taxCalculation = calculateTaxForCartWithShipping(
    cartSubtotal,
    shippingCost,
    taxSettings.defaultTaxRate,
    taxSettings.taxIncluded
  );
  const total = taxCalculation.total;

  return (
    <CheckoutClient
      cart={cart}
      retryOrder={retryOrder}
      addresses={addresses}
      userEmail={session.user.email || ""}
      calculatedSubtotal={taxCalculation.subtotal}
      calculatedTax={taxCalculation.tax}
      calculatedShipping={taxCalculation.shippingCost}
      calculatedTotal={total}
      taxSettings={taxSettings}
      shippingSettings={shippingSettings}
    />
  );
}

