import { getStoreSettings } from "@/lib/actions/admin/store-settings";
import TaxSettingsClient from "@/components/admin/store-settings/TaxSettingsClient";

export default async function TaxSettingsPage() {
  const settings = await getStoreSettings("tax");
  const taxSettings = settings.config as any;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-sans font-bold text-gray-900">Vergi Ayarları</h1>
        <p className="text-sm font-sans text-gray-600 mt-2">
          Sistem genelinde KDV oranı ve fiyat gösterim ayarlarını yönetin.
        </p>
      </div>

      <TaxSettingsClient initialSettings={taxSettings} />
    </div>
  );
}

