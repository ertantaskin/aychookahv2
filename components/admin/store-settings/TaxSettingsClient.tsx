"use client";

import { useState } from "react";
import { updateTaxSettings, TaxSettings } from "@/lib/actions/admin/store-settings";
import { toast } from "sonner";

interface TaxSettingsClientProps {
  initialSettings: TaxSettings;
}

export default function TaxSettingsClient({ initialSettings }: TaxSettingsClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<TaxSettings>(initialSettings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateTaxSettings(settings);
      toast.success("Vergi ayarları başarıyla güncellendi");
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
          {/* KDV Oranı */}
          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
              KDV Oranı (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.defaultTaxRate * 100}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultTaxRate: parseFloat(e.target.value) / 100 || 0,
                  })
                }
                className="w-32 px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="20"
              />
              <span className="text-sm font-sans text-gray-600">
                Örnek: 20 = %20 KDV (0.20)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sistem genelinde kullanılacak varsayılan KDV oranı
            </p>
          </div>

          {/* Fiyata Dahil/Hariç */}
          <div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="taxIncluded"
                checked={settings.taxIncluded}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    taxIncluded: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="taxIncluded"
                className="text-sm font-sans font-medium text-gray-700 cursor-pointer"
              >
                Fiyatlar KDV dahil gösterilsin
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 ml-7">
              {settings.taxIncluded
                ? "Ürün fiyatları KDV dahil olarak gösterilecek ve hesaplanacak. Sepet ve checkout'ta fiyatlar KDV dahil olarak görünecek."
                : "Ürün fiyatları KDV hariç olarak gösterilecek. Sepet ve checkout'ta KDV ayrıca eklenecek."}
            </p>
          </div>

          {/* Bilgi Kutusu */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-sans font-semibold text-blue-900 mb-2">
              Önemli Bilgiler
            </h3>
            <ul className="text-xs font-sans text-blue-800 space-y-1 list-disc list-inside">
              <li>
                KDV dahil seçeneği aktifken, ürün fiyatları KDV dahil olarak girilir ve gösterilir.
              </li>
              <li>
                Sepet ve checkout hesaplamalarında KDV, fiyattan çıkarılarak ara toplam hesaplanır.
              </li>
              <li>
                KDV hariç seçeneğinde, ürün fiyatlarına KDV ayrıca eklenir.
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

