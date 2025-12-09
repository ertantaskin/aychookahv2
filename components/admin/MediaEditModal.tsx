"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Media {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  mimeType: string;
  alt?: string | null;
  description?: string | null;
  createdAt: Date;
  usageCount: number;
}

interface MediaEditModalProps {
  media: Media | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function MediaEditModal({
  media,
  isOpen,
  onClose,
  onUpdate,
}: MediaEditModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    alt: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (media) {
      setFormData({
        name: media.name || "",
        url: media.url || "",
        alt: media.alt || "",
        description: media.description || "",
      });
    }
  }, [media]);

  if (!isOpen || !media) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/media/${media.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name ? formData.name.trim() : "",
          url: formData.url ? formData.url.trim() : "",
          alt: formData.alt ? formData.alt.trim() : null,
          description: formData.description ? formData.description.trim() : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Medya güncellenemedi");
      }

      toast.success("Medya başarıyla güncellendi");
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Medya güncellenirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h2 className="font-sans text-xl font-bold text-gray-900">
            Medya Düzenle
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {media.type === "image" ? (
                <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  <Image
                    src={media.url}
                    alt={media.alt || media.name}
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <span className="text-4xl">📄</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-4">
              {/* File Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Dosya Boyutu:</span>
                  <span className="font-medium text-gray-900">
                    {formatFileSize(media.size)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">MIME Tipi:</span>
                  <span className="font-medium text-gray-900">
                    {media.mimeType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Yüklenme Tarihi:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(media.createdAt).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {media.usageCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Kullanım Sayısı:</span>
                    <span className="font-medium text-luxury-goldLight">
                      {media.usageCount} yerde kullanılıyor
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block font-sans text-sm font-medium text-gray-700 mb-2"
              >
                Görsel Adı
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight/50 focus:border-luxury-goldLight font-sans text-gray-900 placeholder:text-gray-400"
                placeholder="Örn: ayc-hookah-logo.png"
                required
              />
            </div>

            {/* URL */}
            <div>
              <label
                htmlFor="url"
                className="block font-sans text-sm font-medium text-gray-700 mb-2"
              >
                Görsel URL
              </label>
              <input
                type="url"
                id="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight/50 focus:border-luxury-goldLight font-sans text-gray-900 placeholder:text-gray-400"
                placeholder="https://cdn.aychookah.com/..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Görselin tam URL adresini girin
              </p>
            </div>

            {/* Alt Text */}
            <div>
              <label
                htmlFor="alt"
                className="block font-sans text-sm font-medium text-gray-700 mb-2"
              >
                Alt Metin (SEO)
              </label>
              <input
                type="text"
                id="alt"
                value={formData.alt}
                onChange={(e) =>
                  setFormData({ ...formData, alt: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight/50 focus:border-luxury-goldLight font-sans text-gray-900 placeholder:text-gray-400"
                placeholder="Görsel için açıklayıcı metin"
              />
              <p className="mt-1 text-xs text-gray-500">
                SEO ve erişilebilirlik için görsel açıklaması
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block font-sans text-sm font-medium text-gray-700 mb-2"
              >
                Açıklama
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight/50 focus:border-luxury-goldLight font-sans resize-none text-gray-900 placeholder:text-gray-400"
                placeholder="Görsel hakkında ek bilgiler"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-sans font-medium text-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-luxury-goldLight text-luxury-black font-semibold rounded-lg hover:bg-luxury-gold transition-colors font-sans flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

