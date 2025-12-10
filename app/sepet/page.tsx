import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getCart } from "@/lib/actions/cart";
import CartClient from "@/components/cart/CartClient";
import { getTaxSettings } from "@/lib/utils/tax-calculator";
import { getShippingSettings, calculateShippingCost } from "@/lib/utils/shipping-calculator";
import { calculateTaxForCart } from "@/lib/utils/tax-calculator";

// Cache'i devre dışı bırak - her istekte yeniden oluştur
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Sepetim",
  description: "Sepetinizdeki ürünleri görüntüleyin ve düzenleyin",
};

export default async function CartPage() {
  const session = await auth();
  const cart = session?.user ? await getCart() : null;

  // Ayarları getir
  const taxSettings = await getTaxSettings();
  const shippingSettings = await getShippingSettings();

  // Hesaplamaları yap
  let calculatedSubtotal = 0;
  let calculatedTax = 0;
  let calculatedShipping = 0;
  let calculatedTotal = 0;

  if (cart && cart.items.length > 0) {
    const cartSubtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const taxCalculation = calculateTaxForCart(
      cartSubtotal,
      taxSettings.defaultTaxRate,
      taxSettings.taxIncluded
    );
    calculatedSubtotal = taxCalculation.subtotal;
    calculatedTax = taxCalculation.tax;
    calculatedShipping = calculateShippingCost(taxCalculation.subtotal, shippingSettings);
    calculatedTotal = taxCalculation.total + calculatedShipping;
  }

  return (
    <CartClient
      cart={cart}
      calculatedSubtotal={calculatedSubtotal}
      calculatedTax={calculatedTax}
      calculatedShipping={calculatedShipping}
      calculatedTotal={calculatedTotal}
      taxSettings={taxSettings}
    />
  );
}

