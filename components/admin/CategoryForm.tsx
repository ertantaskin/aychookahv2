"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/lib/actions/admin/categories";
import { toast } from "sonner";
import MediaSelector from "./MediaSelector";
import Image from "next/image";
import { X } from "lucide-react";

interface CategoryFormProps {
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    metaKeywords: string | null;
    ogImage: string | null;
  };
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string } | null>(
    category?.image ? { url: category.image } : null
  );

  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    image: category?.image || "",
    seoTitle: category?.seoTitle || "",
    seoDescription: category?.seoDescription || "",
    metaKeywords: category?.metaKeywords || "",
    ogImage: category?.ogImage || "",
  });

  // İsimden slug oluştur
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    // Slug boşsa veya otomatik oluşturulmuşsa güncelle
    if (!category || formData.slug === generateSlug(category.name)) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(name) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const data = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        image: selectedImage?.url || undefined,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        metaKeywords: formData.metaKeywords || undefined,
        ogImage: formData.ogImage || undefined,
      };

      if (category) {
        await updateCategory(category.id, data);
        toast.success("Kategori güncellendi");
      } else {
        await createCategory(data);
        toast.success("Kategori oluşturuldu");
      }

      router.push("/admin/urunler/kategoriler");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-full">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sol Taraf - Ana İçerik Alanı */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Kategori Adı */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-2 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Kategori Adı *</h2>
            </div>
            <div className="p-4">
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 text-xl font-sans font-semibold text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Kategori adını girin"
              />
            </div>
          </div>

          {/* Slug */}
          <div className="bg-white border border-gray-300 rounded-sm p-4">
            <div className="flex items-center gap-2 text-sm font-sans text-gray-600">
              <span className="font-medium">Slug:</span>
              <span className="text-blue-600">/kategori/</span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-2 py-1 text-sm font-sans border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="kategori-slug"
              />
            </div>
          </div>

          {/* Açıklama */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-2 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Açıklama</h2>
            </div>
            <div className="p-4">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder="Kategori açıklaması"
              />
            </div>
          </div>

          {/* SEO Ayarları */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">SEO</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                  SEO Başlığı
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Arama motorları için başlık"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                  SEO Açıklaması
                </label>
                <textarea
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
                  placeholder="Arama motorları için açıklama (150-160 karakter)"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.seoDescription.length}/160</p>
              </div>
              <div>
                <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                  Anahtar Kelimeler
                </label>
                <input
                  type="text"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="kelime1, kelime2, kelime3"
                />
              </div>
              <div>
                <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                  OG Görseli
                </label>
                <input
                  type="url"
                  value={formData.ogImage}
                  onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/og-image.jpg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Taraf - Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Yayınla Kutusu */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Yayınla</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-sans font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Kaydediliyor..." : category ? "Güncelle" : "Yayınla"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-sans font-medium rounded hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>

          {/* Kategori Görseli */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Kategori Görseli</h2>
            </div>
            <div className="p-4 space-y-3">
              {selectedImage ? (
                <div className="relative group">
                  <div className="relative aspect-square w-full bg-gray-100 rounded border border-gray-300 overflow-hidden">
                    <Image
                      src={selectedImage.url}
                      alt={formData.name}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <span className="text-sm font-sans text-gray-400">Görsel yok</span>
                </div>
              )}
              <MediaSelector
                onSelect={(media) => {
                  if (media.length > 0) {
                    setSelectedImage({ url: media[0].url });
                  }
                }}
                multiple={false}
                currentSelection={selectedImage ? [{
                  id: "",
                  name: "",
                  url: selectedImage.url,
                  type: "image",
                  size: 0,
                  mimeType: "image/jpeg",
                  alt: formData.name,
                  createdAt: new Date(),
                  usageCount: 0,
                }] : []}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

