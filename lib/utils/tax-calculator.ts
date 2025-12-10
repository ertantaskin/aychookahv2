import { getStoreSettings, TaxSettings } from "@/lib/actions/admin/store-settings";

/**
 * Vergi hesaplama yardımcı fonksiyonları
 */

/**
 * Vergi ayarlarını getir
 */
export async function getTaxSettings(): Promise<TaxSettings> {
  const settings = await getStoreSettings("tax");
  return settings.config as TaxSettings;
}

/**
 * Fiyat KDV dahil ise, KDV hariç fiyatı hesapla
 * @param priceWithTax KDV dahil fiyat
 * @param taxRate KDV oranı (örn: 0.20 = %20)
 * @returns KDV hariç fiyat
 */
export function calculatePriceWithoutTax(priceWithTax: number, taxRate: number): number {
  // KDV dahil fiyattan KDV hariç fiyat: priceWithTax / (1 + taxRate)
  return priceWithTax / (1 + taxRate);
}

/**
 * Fiyat KDV hariç ise, KDV dahil fiyatı hesapla
 * @param priceWithoutTax KDV hariç fiyat
 * @param taxRate KDV oranı (örn: 0.20 = %20)
 * @returns KDV dahil fiyat
 */
export function calculatePriceWithTax(priceWithoutTax: number, taxRate: number): number {
  // KDV hariç fiyata KDV ekle: priceWithoutTax * (1 + taxRate)
  return priceWithoutTax * (1 + taxRate);
}

/**
 * KDV tutarını hesapla
 * @param price Fiyat (KDV dahil veya hariç)
 * @param taxRate KDV oranı (örn: 0.20 = %20)
 * @param taxIncluded Fiyat KDV dahil mi?
 * @returns KDV tutarı
 */
export function calculateTaxAmount(
  price: number,
  taxRate: number,
  taxIncluded: boolean
): number {
  if (taxIncluded) {
    // KDV dahil fiyattan KDV tutarı: price - (price / (1 + taxRate))
    return price - calculatePriceWithoutTax(price, taxRate);
  } else {
    // KDV hariç fiyattan KDV tutarı: price * taxRate
    return price * taxRate;
  }
}

/**
 * Sepet toplamı için vergi hesapla
 * @param subtotal Ara toplam (KDV hariç)
 * @param taxRate KDV oranı (örn: 0.20 = %20)
 * @param taxIncluded Fiyatlar KDV dahil mi? (Eğer true ise, subtotal aslında KDV dahil toplam)
 * @returns { subtotal: number, tax: number, total: number }
 */
export function calculateTaxForCart(
  subtotal: number,
  taxRate: number,
  taxIncluded: boolean
): {
  subtotal: number; // KDV hariç toplam
  tax: number; // KDV tutarı
  total: number; // KDV dahil toplam
} {
  if (taxIncluded) {
    // Fiyatlar KDV dahil ise, subtotal'den KDV'yi çıkar
    const subtotalWithoutTax = calculatePriceWithoutTax(subtotal, taxRate);
    const tax = subtotal - subtotalWithoutTax;
    return {
      subtotal: subtotalWithoutTax,
      tax,
      total: subtotal,
    };
  } else {
    // Fiyatlar KDV hariç ise, subtotal'e KDV ekle
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return {
      subtotal,
      tax,
      total,
    };
  }
}

/**
 * Sepet toplamı ve kargo ücreti için vergi hesapla (kargo ücretine de vergi eklenir)
 * @param cartSubtotal Ara toplam (ürünler)
 * @param shippingCost Kargo ücreti (KDV hariç)
 * @param taxRate KDV oranı (örn: 0.20 = %20)
 * @param taxIncluded Fiyatlar KDV dahil mi? (Eğer true ise, cartSubtotal aslında KDV dahil toplam)
 * @returns { subtotal: number, shippingCost: number, tax: number, total: number }
 */
export function calculateTaxForCartWithShipping(
  cartSubtotal: number,
  shippingCost: number,
  taxRate: number,
  taxIncluded: boolean
): {
  subtotal: number; // KDV hariç ara toplam
  shippingCost: number; // KDV hariç kargo ücreti
  tax: number; // Toplam KDV tutarı (ürünler + kargo)
  total: number; // KDV dahil toplam
} {
  if (taxIncluded) {
    // Fiyatlar KDV dahil ise, cartSubtotal'den KDV'yi çıkar
    const subtotalWithoutTax = calculatePriceWithoutTax(cartSubtotal, taxRate);
    const productTax = cartSubtotal - subtotalWithoutTax;
    
    // Kargo ücretine KDV ekle
    const shippingTax = shippingCost * taxRate;
    const shippingWithTax = shippingCost + shippingTax;
    
    // Toplam KDV
    const totalTax = productTax + shippingTax;
    
    // Toplam
    const total = cartSubtotal + shippingWithTax;
    
    return {
      subtotal: subtotalWithoutTax,
      shippingCost: shippingCost,
      tax: totalTax,
      total: total,
    };
  } else {
    // Fiyatlar KDV hariç ise
    const productTax = cartSubtotal * taxRate;
    const shippingTax = shippingCost * taxRate;
    const totalTax = productTax + shippingTax;
    
    const total = cartSubtotal + shippingCost + totalTax;
    
    return {
      subtotal: cartSubtotal,
      shippingCost: shippingCost,
      tax: totalTax,
      total: total,
    };
  }
}

/**
 * Ürün fiyatını gösterim için formatla
 * @param price Ürün fiyatı (veritabanından gelen)
 * @param taxIncluded Fiyat KDV dahil mi?
 * @returns Gösterilecek fiyat bilgisi
 */
export function formatProductPrice(price: number, taxIncluded: boolean): string {
  if (taxIncluded) {
    return `${price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺ (KDV Dahil)`;
  } else {
    return `${price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺ (KDV Hariç)`;
  }
}

