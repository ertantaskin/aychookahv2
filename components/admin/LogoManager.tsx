"use client";

import { useState, useEffect } from "react";
import { getLogoSettings, updateLogoSettings } from "@/lib/actions/admin/logo";
import MediaSelector from "./MediaSelector";
import Image from "next/image";
import { Save, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface LogoSettings {
  headerLogo?: string | null;
  footerLogo?: string | null;
}

export default function LogoManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<LogoSettings>({
    headerLogo: null,
    footerLogo: null,
  });
  const [selectedHeaderLogo, setSelectedHeaderLogo] = useState<{ url: string } | null>(null);
  const [selectedFooterLogo, setSelectedFooterLogo] = useState<{ url: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getLogoSettings();
      setSettings(data);
      // Sadece null olmayan ve boş olmayan logoları yükle
      if (data.headerLogo && data.headerLogo.trim() !== "") {
        setSelectedHeaderLogo({ url: data.headerLogo });
      } else {
        setSelectedHeaderLogo(null);
      }
      if (data.footerLogo && data.footerLogo.trim() !== "") {
        setSelectedFooterLogo({ url: data.footerLogo });
      } else {
        setSelectedFooterLogo(null);
      }
    } catch (error) {
      console.error("Error loading logo settings:", error);
      toast.error("Logo ayarları yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const dataToSave: LogoSettings = {
        headerLogo: selectedHeaderLogo?.url || null,
        footerLogo: selectedFooterLogo?.url || null,
      };
      await updateLogoSettings(dataToSave);
      // Ayarları yeniden yükle (null değerleri doğru şekilde yüklemek için)
      await loadSettings();
      toast.success("Logo ayarları başarıyla güncellendi");
    } catch (error: any) {
      toast.error(error.message || "Logo ayarları güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div className="text-gray-500 font-sans">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-8">
        {/* Header Logo */}
        <div>
          <h2 className="text-lg font-sans font-semibold text-gray-900 mb-4">
            Header Logo
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-sans font-medium text-gray-700">
                Logo Görseli
              </label>
              {selectedHeaderLogo ? (
                <div className="relative group">
                  <div className="relative aspect-[3/1] bg-gray-50 border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                    <Image
                      src={selectedHeaderLogo.url}
                      alt="Header Logo"
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHeaderLogo(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-[3/1] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                  <span className="text-sm font-sans text-gray-400">Logo seçilmedi</span>
                </div>
              )}
              <MediaSelector
                onSelect={(media) => {
                  if (media.length > 0) {
                    setSelectedHeaderLogo({ url: media[0].url });
                  }
                }}
                multiple={false}
                currentSelection={selectedHeaderLogo ? [{
                  id: "",
                  name: "",
                  url: selectedHeaderLogo.url,
                  type: "image",
                  size: 0,
                  mimeType: "image/png",
                  alt: "Header Logo",
                  createdAt: new Date(),
                  usageCount: 0,
                }] : []}
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-sans font-medium text-gray-700">
                Önizleme
              </label>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center">
                  {selectedHeaderLogo ? (
                    <Image
                      src={selectedHeaderLogo.url}
                      alt="Header Logo Preview"
                      width={200}
                      height={64}
                      className="h-12 w-auto"
                    />
                  ) : (
                    <div className="h-12 w-48 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-400">Logo önizlemesi</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Header menüde görünecek logo. Önerilen boyut: 200x64px veya benzer oran.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Logo */}
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-lg font-sans font-semibold text-gray-900 mb-4">
            Footer Logo
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-sans font-medium text-gray-700">
                Logo Görseli
              </label>
              {selectedFooterLogo ? (
                <div className="relative group">
                  <div className="relative aspect-[3/1] bg-gray-50 border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm flex items-center justify-center">
                    <Image
                      src={selectedFooterLogo.url}
                      alt="Footer Logo"
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFooterLogo(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-[3/1] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                  <span className="text-sm font-sans text-gray-400">Logo seçilmedi</span>
                </div>
              )}
              <MediaSelector
                onSelect={(media) => {
                  if (media.length > 0) {
                    setSelectedFooterLogo({ url: media[0].url });
                  }
                }}
                multiple={false}
                currentSelection={selectedFooterLogo ? [{
                  id: "",
                  name: "",
                  url: selectedFooterLogo.url,
                  type: "image",
                  size: 0,
                  mimeType: "image/png",
                  alt: "Footer Logo",
                  createdAt: new Date(),
                  usageCount: 0,
                }] : []}
              />
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-sans font-medium text-gray-700">
                Önizleme
              </label>
              <div className="bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center">
                  {selectedFooterLogo ? (
                    <Image
                      src={selectedFooterLogo.url}
                      alt="Footer Logo Preview"
                      width={200}
                      height={64}
                      className="h-12 w-auto"
                    />
                  ) : (
                    <div className="h-12 w-48 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-400">Logo önizlemesi</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Footer'da görünecek logo. Önerilen boyut: 200x64px veya benzer oran.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-sans font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}

