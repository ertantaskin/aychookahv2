"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/actions/admin/products";
import { toast } from "sonner";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import MediaSelector from "./MediaSelector";
import Image from "next/image";
import { X, Search } from "lucide-react";

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
  const [categorySearch, setCategorySearch] = useState("");

  // Filtrelenmiş kategoriler
  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);
  
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
    <form onSubmit={handleSubmit} className="max-w-full">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sol Taraf - Ana İçerik Alanı (WordPress benzeri) */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Başlık Alanı */}
          <div className="bg-white border border-gray-300 rounded-sm">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 text-2xl font-sans font-semibold text-gray-900 border-0 focus:outline-none focus:ring-0 placeholder:text-gray-400"
              placeholder="Ürün adını girin"
          />
        </div>

          {/* Permalink (Slug) */}
          <div className="bg-white border border-gray-300 rounded-sm p-4">
            <div className="flex items-center gap-2 text-sm font-sans text-gray-600">
              <span className="font-medium">Permalink:</span>
              <span className="text-blue-600">/urun/</span>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-2 py-1 text-sm font-sans border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="urun-adi"
          />
            </div>
        </div>

          {/* Ana İçerik Editörü */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-2 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">İçerik</h2>
            </div>
            <div className="p-4">
          <SimpleEditor
            content={formData.description}
            onChange={(content) => setFormData({ ...formData, description: content })}
                placeholder="Ürün açıklamasını buraya yazın..."
          />
            </div>
        </div>

          {/* Kısa Açıklama (Excerpt) */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-2 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Kısa Açıklama</h2>
            </div>
            <div className="p-4">
          <textarea
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
                placeholder="Ürünün kısa açıklaması (opsiyonel)"
          />
              <p className="text-xs text-gray-500 mt-2">
                Bu açıklama ürün detay sayfasında miktar ve sepete ekle butonunun üstünde gösterilir.
              </p>
            </div>
        </div>

          {/* Ürün Ayarları */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Ürün Ayarları</h2>
            </div>
            <div className="p-4 space-y-4">
        <div>
                <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
            Fiyat (₺) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Fiyat KDV dahil olarak girilir ve gösterilir.
          </p>
        </div>
        <div>
                <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
            Stok *
          </label>
          <input
            type="number"
            required
            min="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
                <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
                  Marka
          </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ürün markası"
                />
        </div>
        <div>
                <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
            Ekipman Tipi
          </label>
          <input
            type="text"
            value={formData.equipmentType}
            onChange={(e) => setFormData({ ...formData, equipmentType: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
                <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
            Malzeme
          </label>
          <input
            type="text"
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
                <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
            Yükseklik
          </label>
          <input
            type="text"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
              </div>
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

        {/* Sağ Taraf - Sidebar (WordPress benzeri) */}
        <div className="w-full lg:w-80 space-y-6">
          {/* Yayınla Kutusu */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Yayınla</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-sans text-gray-700">Aktif</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-sans text-gray-700">Yeni Ürün</label>
              </div>
            <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isBestseller}
                  onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm font-sans text-gray-700">Çok Satan</label>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-sans font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Kaydediliyor..." : product ? "Güncelle" : "Yayınla"}
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

          {/* Öne Çıkarılan Görsel */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Öne Çıkarılan Görsel</h2>
            </div>
            <div className="p-4 space-y-3">
              {selectedPrimaryImage ? (
                <div className="relative group">
                  <div className="relative aspect-square w-full bg-gray-100 rounded border border-gray-300 overflow-hidden">
                    <Image
                      src={selectedPrimaryImage.url}
                      alt={selectedPrimaryImage.alt || formData.name}
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPrimaryImage(null)}
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
          </div>
        </div>

        {/* Galeri Görselleri */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Galeri Görselleri</h2>
            </div>
            <div className="p-4 space-y-4">
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
            {selectedGalleryImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                {selectedGalleryImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className="relative w-full h-full bg-gray-100 rounded border border-gray-300 overflow-hidden">
                      <Image
                        src={img.url}
                        alt={img.alt || formData.name}
                        fill
                        className="object-cover"
                          sizes="(max-width: 768px) 50vw, 150px"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = selectedGalleryImages.filter((_, i) => i !== index);
                        setSelectedGalleryImages(newImages);
                      }}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

          {/* Kategori */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Kategori *</h2>
        </div>
            <div className="p-4 space-y-3">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Kategori ara..."
                  className="w-full pl-10 pr-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

              {/* Kategori Listesi */}
              <div className="border border-gray-300 rounded max-h-64 overflow-y-auto">
                {filteredCategories.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500 font-sans">
                    Kategori bulunamadı
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredCategories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.id}
                          checked={formData.categoryId === category.id}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          required
                        />
                        <span className="text-sm font-sans text-gray-700 flex-1">
                          {category.name}
                        </span>
            </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Özellikler */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
              <h2 className="text-sm font-sans font-semibold text-gray-700">Özellikler</h2>
            </div>
            <div className="p-4">
            <input
              type="text"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Özellik 1, Özellik 2, Özellik 3"
            />
              <p className="text-xs text-gray-500 mt-2">Virgülle ayırın</p>
          </div>
          </div>
        </div>
      </div>
    </form>
  );
}

