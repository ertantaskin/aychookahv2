"use client";

import { useState } from "react";
import { updateShippingSettings, ShippingSettings } from "@/lib/actions/admin/store-settings";
import { toast } from "sonner";

interface ShippingSettingsClientProps {
  initialSettings: ShippingSettings;
}

export default function ShippingSettingsClient({
  initialSettings,
}: ShippingSettingsClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<ShippingSettings>(initialSettings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateShippingSettings(settings);
      toast.success("Kargo ayarları başarıyla güncellendi");
    } catch (error: any) {
      toast.error(error.message || "Ayarlar güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          {/* Varsayılan Kargo Ücreti */}
          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
              Varsayılan Kargo Ücreti (₺)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.defaultShippingCost}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultShippingCost: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-32 px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              <span className="text-sm font-sans text-gray-600">₺</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ücretsiz kargo eşiğini geçmeyen siparişler için uygulanacak kargo ücreti
            </p>
          </div>

          {/* Ücretsiz Kargo Eşiği */}
          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
              Ücretsiz Kargo Eşiği (₺)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.freeShippingThreshold || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    freeShippingThreshold:
                      e.target.value === "" ? null : parseFloat(e.target.value) || 0,
                  })
                }
                className="w-32 px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Boş bırakabilirsiniz"
              />
              <span className="text-sm font-sans text-gray-600">₺</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Bu tutarın üzerindeki siparişlerde kargo ücretsiz olacaktır. Boş bırakılırsa ücretsiz
              kargo eşiği olmayacaktır.
            </p>
          </div>

          {/* Tahmini Teslimat Süresi */}
          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
              Tahmini Teslimat Süresi (Gün)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="1"
                step="1"
                value={settings.estimatedDeliveryDays}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    estimatedDeliveryDays: parseInt(e.target.value) || 1,
                  })
                }
                className="w-32 px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="3"
              />
              <span className="text-sm font-sans text-gray-600">gün</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Siparişlerin tahmini teslimat süresi (örn: 3-5 gün)
            </p>
          </div>

          {/* Bilgi Kutusu */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-sans font-semibold text-blue-900 mb-2">
              Kargo Hesaplama Mantığı
            </h3>
            <ul className="text-xs font-sans text-blue-800 space-y-1 list-disc list-inside">
              <li>
                Sipariş tutarı ücretsiz kargo eşiğini geçiyorsa, kargo ücretsiz olur.
              </li>
              <li>
                Aksi halde varsayılan kargo ücreti uygulanır.
              </li>
              <li>
                Gelecekte bölge bazlı veya ağırlık bazlı kargo kuralları eklenebilir.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-sans font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}

