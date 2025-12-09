"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/actions/admin/products";
import { toast } from "sonner";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import MediaSelector from "./MediaSelector";
import Image from "next/image";
import { X } from "lucide-react";

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    stock: number;
    categoryId: string;
    material?: string | null;
    height?: string | null;
    equipmentType?: string | null;
    isNew: boolean;
    isBestseller: boolean;
    isActive: boolean;
    images: Array<{ url: string; alt: string | null; isPrimary: boolean }>;
    features: Array<{ name: string }>;
    seoTitle?: string | null;
    seoDescription?: string | null;
    metaKeywords?: string | null;
    ogImage?: string | null;
    brand?: string | null;
  };
  categories: Array<{ id: string; name: string }>;
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ana görsel ve galeri görselleri için ayrı state'ler
  const primaryImage = product?.images.find(img => img.isPrimary) || product?.images[0] || null;
  const galleryImages = product?.images.filter(img => !img.isPrimary) || [];
  
  const [selectedPrimaryImage, setSelectedPrimaryImage] = useState<{ url: string; alt: string | null } | null>(
    primaryImage ? { url: primaryImage.url, alt: primaryImage.alt } : null
  );
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<Array<{ url: string; alt: string | null }>>(
    galleryImages.map(img => ({ url: img.url, alt: img.alt }))
  );

  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    price: product?.price || 0,
    stock: product?.stock || 0,
    categoryId: product?.categoryId || categories[0]?.id || "",
    material: product?.material || "",
    height: product?.height || "",
    equipmentType: product?.equipmentType || "",
    isNew: product?.isNew || false,
    isBestseller: product?.isBestseller || false,
    isActive: product?.isActive ?? true,
    features: product?.features.map(f => f.name).join(", ") || "",
    images: "", // Artık kullanılmıyor, ana görsel ve galeri ayrı yönetiliyor
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
    metaKeywords: product?.metaKeywords || "",
    ogImage: product?.ogImage || "",
    brand: product?.brand || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ana görsel zorunlu kontrolü
    if (!selectedPrimaryImage) {
      toast.error("Lütfen bir ana görsel seçin");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const features = formData.features
        .split(",")
        .map(f => f.trim())
        .filter(f => f.length > 0);

      // Ana görsel ve galeri görsellerini birleştir
      const images: Array<{ url: string; alt: string; isPrimary: boolean }> = [];
      
      // Ana görsel ekle (zorunlu)
      images.push({
        url: selectedPrimaryImage.url,
        alt: selectedPrimaryImage.alt || formData.name,
        isPrimary: true,
      });
      
      // Galeri görsellerini ekle
      selectedGalleryImages.forEach((img) => {
        images.push({
          url: img.url,
          alt: img.alt || formData.name,
          isPrimary: false,
        });
      });

      if (product) {
        await updateProduct(product.id, {
          ...formData,
          features,
          images,
        });
        toast.success("Ürün güncellendi");
      } else {
        await createProduct({
          ...formData,
          features,
          images,
        });
        toast.success("Ürün oluşturuldu");
      }

      router.push("/admin/urunler");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Ürün Adı *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Slug *
          </label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
            placeholder="urun-adi"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Açıklama *
          </label>
          <SimpleEditor
            content={formData.description}
            onChange={(content) => setFormData({ ...formData, description: content })}
            placeholder="Ürün açıklamasını buraya yazın. Başlıklar, listeler, linkler ve görseller ekleyebilirsiniz..."
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Zengin metin editörü ile içeriğinizi formatlayabilir, başlıklar, listeler, linkler ve görseller ekleyebilirsiniz. 
            SEO için başlık yapısını (H1, H2, H3) kullanmayı unutmayın.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Kısa Açıklama
          </label>
          <textarea
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            rows={2}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all resize-y"
            placeholder="Miktar ve sepete ekle butonunun üstünde gösterilecek kısa açıklama"
          />
          <p className="text-xs text-gray-500 mt-1">Bu açıklama ürün detay sayfasında miktar ve sepete ekle butonunun üstünde gösterilir</p>
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Fiyat (₺) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Stok *
          </label>
          <input
            type="number"
            required
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Kategori *
          </label>
          <select
            required
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight transition-all bg-white"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Ekipman Tipi
          </label>
          <input
            type="text"
            value={formData.equipmentType}
            onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Malzeme
          </label>
          <input
            type="text"
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Yükseklik
          </label>
          <input
            type="text"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Özellikler (virgülle ayırın)
          </label>
          <input
            type="text"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
            placeholder="Özellik 1, Özellik 2, Özellik 3"
          />
        </div>

        {/* Ana Görsel */}
        <div className="md:col-span-2">
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Ana Görsel (Öne Çıkarılan Görsel) *
          </label>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MediaSelector
                onSelect={(media) => {
                  if (media.length > 0) {
                    const primaryImg = {
                      url: media[0].url,
                      alt: media[0].alt || formData.name,
                    };
                    setSelectedPrimaryImage(primaryImg);
                  }
                }}
                multiple={false}
                currentSelection={selectedPrimaryImage ? [{
                  id: "",
                  name: "",
                  url: selectedPrimaryImage.url,
                  type: "image",
                  size: 0,
                  mimeType: "image/jpeg",
                  alt: selectedPrimaryImage.alt,
                  createdAt: new Date(),
                  usageCount: 0,
                }] : []}
              />
              <span className="font-sans text-sm text-gray-500">
                Ürün sayfasında öne çıkarılan görsel
              </span>
            </div>

            {/* Ana Görsel Preview */}
            {selectedPrimaryImage && (
              <div className="relative inline-block group">
                <div className="relative aspect-square w-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-luxury-goldLight">
                  <Image
                    src={selectedPrimaryImage.url}
                    alt={selectedPrimaryImage.alt || formData.name}
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                  <div className="absolute top-2 left-2 bg-luxury-goldLight text-luxury-black text-xs font-bold px-2 py-1 rounded">
                    Ana Görsel
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPrimaryImage(null)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Ana Görsel Manuel URL Input */}
            <div>
              <input
                type="url"
                value={selectedPrimaryImage?.url || ""}
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    setSelectedPrimaryImage({
                      url: e.target.value.trim(),
                      alt: formData.name,
                    });
                  } else {
                    setSelectedPrimaryImage(null);
                  }
                }}
                className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                placeholder="https://example.com/primary-image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Medya kütüphanesinden seçin veya URL girin
              </p>
            </div>
          </div>
        </div>

        {/* Galeri Görselleri */}
        <div className="md:col-span-2">
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Galeri Görselleri
          </label>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MediaSelector
                onSelect={(media) => {
                  const newGalleryImages = media.map((m) => ({
                    url: m.url,
                    alt: m.alt || formData.name,
                  }));
                  setSelectedGalleryImages(newGalleryImages);
                }}
                multiple={true}
                currentSelection={selectedGalleryImages.map((img) => ({
                  id: "",
                  name: "",
                  url: img.url,
                  type: "image",
                  size: 0,
                  mimeType: "image/jpeg",
                  alt: img.alt,
                  createdAt: new Date(),
                  usageCount: 0,
                }))}
              />
              <span className="font-sans text-sm text-gray-500">
                Ürün sayfasında sol tarafta gösterilecek galeri görselleri
              </span>
            </div>

            {/* Galeri Görselleri Preview */}
            {selectedGalleryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedGalleryImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={img.url}
                        alt={img.alt || formData.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Galeri
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = selectedGalleryImages.filter((_, i) => i !== index);
                        setSelectedGalleryImages(newImages);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isNew}
              onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-luxury-goldLight focus:ring-luxury-goldLight cursor-pointer"
            />
            <span className="text-sm font-sans text-gray-700">Yeni Ürün</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isBestseller}
              onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-luxury-goldLight focus:ring-luxury-goldLight cursor-pointer"
            />
            <span className="text-sm font-sans text-gray-700">Çok Satan</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-luxury-goldLight focus:ring-luxury-goldLight cursor-pointer"
            />
            <span className="text-sm font-sans text-gray-700">Aktif</span>
          </label>
        </div>
      </div>

      {/* SEO Section */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-sans font-semibold text-gray-900 mb-4">SEO Ayarları</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
              SEO Başlığı
            </label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
              placeholder="Arama motorları için özel başlık"
            />
            <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa ürün adı kullanılır</p>
          </div>

          <div>
            <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
              Marka
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
              placeholder="Ürün markası"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
              SEO Açıklaması
            </label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all resize-y"
              placeholder="Arama motorları için özel açıklama (150-160 karakter önerilir)"
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.seoDescription.length}/160 karakter</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
              Anahtar Kelimeler
            </label>
            <input
              type="text"
              value={formData.metaKeywords}
              onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
              className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
              placeholder="kelime1, kelime2, kelime3"
            />
            <p className="text-xs text-gray-500 mt-1">Virgülle ayırın</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
              Open Graph Görseli (OG Image)
            </label>
            <input
              type="url"
              value={formData.ogImage}
              onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
              className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Sosyal medya paylaşımları için görsel (1200x630 önerilir)</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 font-sans bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Kaydediliyor..." : product ? "Güncelle" : "Oluştur"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 font-sans border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
        >
          İptal
        </button>
      </div>
    </form>
  );
}

