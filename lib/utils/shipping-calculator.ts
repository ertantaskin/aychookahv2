import { getStoreSettings, ShippingSettings } from "@/lib/actions/admin/store-settings";

/**
 * Kargo hesaplama yardımcı fonksiyonları
 */

/**
 * Kargo ayarlarını getir
 */
export async function getShippingSettings(): Promise<ShippingSettings> {
  const settings = await getStoreSettings("shipping");
  return settings.config as ShippingSettings;
}

/**
 * Kargo ücretini hesapla
 * @param subtotal Ara toplam (sipariş tutarı)
 * @param settings Kargo ayarları
 * @returns Kargo ücreti
 */
export function calculateShippingCost(
  subtotal: number,
  settings: ShippingSettings
): number {
  // Ücretsiz kargo eşiği varsa ve sipariş tutarı eşiği geçiyorsa
  if (
    settings.freeShippingThreshold !== null &&
    settings.freeShippingThreshold !== undefined &&
    subtotal >= settings.freeShippingThreshold
  ) {
    return 0;
  }

  // Varsayılan kargo ücreti
  return settings.defaultShippingCost;
}

/**
 * Tahmini teslimat süresini getir
 * @param settings Kargo ayarları
 * @returns Tahmini teslimat süresi (gün)
 */
export function getEstimatedDeliveryDays(settings: ShippingSettings): number {
  return settings.estimatedDeliveryDays;
}

/**
 * Kargo ücretini formatla
 * @param cost Kargo ücreti
 * @returns Formatlanmış kargo ücreti string'i
 */
export function formatShippingCost(cost: number): string {
  if (cost === 0) {
    return "Ücretsiz";
  }
  return `${cost.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
}

