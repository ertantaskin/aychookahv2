import { getStoreSettings } from "@/lib/actions/admin/store-settings";
import ShippingSettingsClient from "@/components/admin/store-settings/ShippingSettingsClient";

export default async function ShippingSettingsPage() {
  const settings = await getStoreSettings("shipping");
  const shippingSettings = settings.config as any;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-sans font-bold text-gray-900">Kargo Ayarları</h1>
        <p className="text-sm font-sans text-gray-600 mt-2">
          Kargo ücretleri, ücretsiz kargo eşiği ve teslimat sürelerini yönetin.
        </p>
      </div>

      <ShippingSettingsClient initialSettings={shippingSettings} />
    </div>
  );
}

