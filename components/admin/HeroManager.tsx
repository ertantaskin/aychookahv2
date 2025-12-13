"use client";

import { useState, useEffect } from "react";
import {
  getAllHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from "@/lib/actions/admin/hero";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Save, X, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import MediaSelector from "./MediaSelector";
import Image from "next/image";
import { toast } from "sonner";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  mobileImage?: string | null;
  ctaText: string;
  ctaLink: string;
  position: string;
  order: number;
  isActive: boolean;
  showContent?: boolean;
  showOverlay?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function HeroManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    subtitle: string;
    description: string;
    image: string;
    mobileImage: string;
    ctaText: string;
    ctaLink: string;
    position: string;
    order: number;
    isActive: boolean;
    showContent: boolean;
    showOverlay: boolean;
  }>({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    mobileImage: "",
    ctaText: "",
    ctaLink: "",
    position: "center",
    order: 0,
    isActive: true,
    showContent: true,
    showOverlay: true,
  });
  const [selectedImage, setSelectedImage] = useState<{ url: string } | null>(null);
  const [selectedMobileImage, setSelectedMobileImage] = useState<{ url: string } | null>(null);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const data = await getAllHeroSlides();
      setSlides(data);
    } catch (error) {
      console.error("Error loading hero slides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedImage?.url && !formData.image) {
      toast.error("Lütfen bir resim seçin");
      return;
    }
    try {
      const dataToSubmit = {
        ...formData,
        image: selectedImage?.url || formData.image,
        mobileImage: selectedMobileImage?.url || formData.mobileImage || null,
        position: formData.position as "left" | "center" | "right",
      };
      await createHeroSlide(dataToSubmit);
      await loadSlides();
      resetForm();
      toast.success("Hero slide başarıyla oluşturuldu");
    } catch (error: any) {
      toast.error(error.message || "Hero slide oluşturulurken bir hata oluştu");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!selectedImage?.url && !formData.image) {
      toast.error("Lütfen bir resim seçin");
      return;
    }
    try {
      const dataToSubmit = {
        id,
        ...formData,
        image: selectedImage?.url || formData.image,
        mobileImage: selectedMobileImage?.url || formData.mobileImage || null,
        position: formData.position as "left" | "center" | "right",
      };
      await updateHeroSlide(dataToSubmit);
      await loadSlides();
      setEditingId(null);
      resetForm();
      toast.success("Hero slide başarıyla güncellendi");
    } catch (error: any) {
      toast.error(error.message || "Hero slide güncellenirken bir hata oluştu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu hero slide'ı silmek istediğinize emin misiniz?")) return;

    try {
      await deleteHeroSlide(id);
      await loadSlides();
      toast.success("Hero slide başarıyla silindi");
    } catch (error: any) {
      toast.error(error.message || "Hero slide silinirken bir hata oluştu");
    }
  };

  const handleMoveUp = async (slide: HeroSlide) => {
    const sortedSlides = [...slides].sort((a, b) => a.order - b.order);
    const currentIndex = sortedSlides.findIndex((s) => s.id === slide.id);
    if (currentIndex > 0) {
      const newSlides = [...sortedSlides];
      [newSlides[currentIndex], newSlides[currentIndex - 1]] = [
        newSlides[currentIndex - 1],
        newSlides[currentIndex],
      ];
      await handleReorder(newSlides);
    }
  };

  const handleMoveDown = async (slide: HeroSlide) => {
    const sortedSlides = [...slides].sort((a, b) => a.order - b.order);
    const currentIndex = sortedSlides.findIndex((s) => s.id === slide.id);
    if (currentIndex < sortedSlides.length - 1) {
      const newSlides = [...sortedSlides];
      [newSlides[currentIndex], newSlides[currentIndex + 1]] = [
        newSlides[currentIndex + 1],
        newSlides[currentIndex],
      ];
      await handleReorder(newSlides);
    }
  };

  const handleReorder = async (newSlides: HeroSlide[]) => {
    try {
      await reorderHeroSlides(
        newSlides.map((slide, index) => ({ id: slide.id, order: index }))
      );
      await loadSlides();
    } catch (error: any) {
      alert(error.message || "Sıralama güncellenirken bir hata oluştu");
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      image: slide.image,
      mobileImage: slide.mobileImage || "",
      ctaText: slide.ctaText,
      ctaLink: slide.ctaLink,
      position: slide.position,
      order: slide.order,
      isActive: slide.isActive,
      showContent: slide.showContent ?? true,
      showOverlay: slide.showOverlay ?? true,
    });
    setSelectedImage(slide.image ? { url: slide.image } : null);
    setSelectedMobileImage(slide.mobileImage ? { url: slide.mobileImage } : null);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      image: "",
      mobileImage: "",
      ctaText: "",
      ctaLink: "",
      position: "center",
      order: slides.length,
      isActive: true,
      showContent: true,
      showOverlay: true,
    });
    setSelectedImage(null);
    setSelectedMobileImage(null);
    setEditingId(null);
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

  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-sans font-bold text-gray-900">Hero Slide Yönetimi</h2>
          <p className="text-sm text-gray-500 mt-1">Ana sayfa slider içeriklerini yönetin</p>
        </div>
        {editingId && (
          <button
            onClick={resetForm}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-sans flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Düzenlemeyi İptal Et
          </button>
        )}
      </div>

      {/* Create Form - Sadece yeni ekleme için */}
      {!editingId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-sans font-semibold text-gray-900">
              Yeni Hero Slide Ekle
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sol Kolon - Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Başlık <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                  placeholder="Ana başlık"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Alt Başlık
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                  placeholder="Alt başlık"
                />
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                  placeholder="Kısa açıklama metni"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    CTA Metni
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                    placeholder="Ürünleri Keşfet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    CTA Link
                  </label>
                  <input
                    type="text"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                    placeholder="/urunler"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Pozisyon
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position: e.target.value as "left" | "center" | "right",
                      })
                    }
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  >
                    <option value="left">Sol</option>
                    <option value="center">Orta</option>
                    <option value="right">Sağ</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 p-2.5 border border-gray-300 rounded-lg w-full cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded w-4 h-4"
                    />
                    <span className="text-sm font-sans text-gray-700">Aktif</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 p-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.showContent}
                    onChange={(e) => setFormData({ ...formData, showContent: e.target.checked })}
                    className="rounded w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-sans font-medium text-gray-700 block">İçerik Göster</span>
                    <span className="text-xs text-gray-500">Başlık, açıklama ve buton gösterilsin</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 p-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.showOverlay}
                    onChange={(e) => setFormData({ ...formData, showOverlay: e.target.checked })}
                    className="rounded w-4 h-4"
                  />
                  <div>
                    <span className="text-sm font-sans font-medium text-gray-700 block">Overlay Efektleri</span>
                    <span className="text-xs text-gray-500">Görsel üzerinde efekt gösterilsin</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Sağ Kolon - Resim */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Desktop Görsel <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {selectedImage ? (
                    <div className="relative group">
                      <div className="relative aspect-video bg-gray-50 border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                        <Image
                          src={selectedImage.url}
                          alt={formData.title || "Hero slide"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 640px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setFormData({ ...formData, image: "" });
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <span className="text-sm font-sans text-gray-400">Görsel seçilmedi</span>
                    </div>
                  )}
                  <MediaSelector
                    onSelect={(media) => {
                      if (media.length > 0) {
                        const imageUrl = media[0].url;
                        setSelectedImage({ url: imageUrl });
                        setFormData({ ...formData, image: imageUrl });
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
                      alt: formData.title || "",
                      createdAt: new Date(),
                      usageCount: 0,
                    }] : []}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Mobil Görsel <span className="text-xs text-gray-500 font-normal">(Opsiyonel)</span>
                </label>
                <div className="space-y-3">
                  {selectedMobileImage ? (
                    <div className="relative group">
                      <div className="relative aspect-video bg-gray-50 border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                        <Image
                          src={selectedMobileImage.url}
                          alt={formData.title || "Hero slide - Mobil"}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 640px"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMobileImage(null);
                          setFormData({ ...formData, mobileImage: "" });
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      <span className="text-sm font-sans text-gray-400">Mobil görsel seçilmedi</span>
                      <span className="text-xs font-sans text-gray-400">Boş bırakılırsa desktop görsel kullanılır</span>
                    </div>
                  )}
                  <MediaSelector
                    onSelect={(media) => {
                      if (media.length > 0) {
                        const imageUrl = media[0].url;
                        setSelectedMobileImage({ url: imageUrl });
                        setFormData({ ...formData, mobileImage: imageUrl });
                      }
                    }}
                    multiple={false}
                    currentSelection={selectedMobileImage ? [{
                      id: "",
                      name: "",
                      url: selectedMobileImage.url,
                      type: "image",
                      size: 0,
                      mimeType: "image/jpeg",
                      alt: formData.title || "",
                      createdAt: new Date(),
                      usageCount: 0,
                    }] : []}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={handleCreate}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-sans font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Hero Slide Ekle
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-sans font-medium transition-colors"
            >
              Temizle
            </button>
          </div>
        </div>
      )}

      {/* Slides List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-sans font-semibold text-gray-900">
            Mevcut Hero Slides ({sortedSlides.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {sortedSlides.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-sans mb-2">Henüz hero slide yok</p>
              <p className="text-sm text-gray-400">Yukarıdaki formu kullanarak yeni bir hero slide ekleyin</p>
            </div>
          ) : (
            sortedSlides.map((slide) => (
              <div key={slide.id}>
                {editingId === slide.id ? (
                  // Düzenleme Formu - Inline
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-6">
                      <Edit className="w-5 h-5 text-blue-600" />
                      <h4 className="text-lg font-sans font-semibold text-gray-900">
                        Hero Slide Düzenle
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Sol Kolon - Form */}
                      <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                          Başlık <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all bg-white"
                          placeholder="Ana başlık"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                          Alt Başlık
                        </label>
                        <input
                          type="text"
                          value={formData.subtitle}
                          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                          className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all bg-white"
                          placeholder="Alt başlık"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                          Açıklama
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all bg-white"
                          placeholder="Kısa açıklama metni"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            CTA Metni
                          </label>
                          <input
                            type="text"
                            value={formData.ctaText}
                            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all bg-white"
                            placeholder="Ürünleri Keşfet"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            CTA Link
                          </label>
                          <input
                            type="text"
                            value={formData.ctaLink}
                            onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all bg-white"
                            placeholder="/urunler"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                            Pozisyon
                          </label>
                          <select
                            value={formData.position}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                position: e.target.value as "left" | "center" | "right",
                              })
                            }
                            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                          >
                            <option value="left">Sol</option>
                            <option value="center">Orta</option>
                            <option value="right">Sağ</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 p-2.5 border border-gray-300 rounded-lg w-full cursor-pointer hover:bg-white/50 bg-white">
                            <input
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                              className="rounded w-4 h-4"
                            />
                            <span className="text-sm font-sans text-gray-700">Aktif</span>
                          </label>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <label className="flex items-center gap-2 p-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-white/50 bg-white">
                          <input
                            type="checkbox"
                            checked={formData.showContent}
                            onChange={(e) => setFormData({ ...formData, showContent: e.target.checked })}
                            className="rounded w-4 h-4"
                          />
                          <div>
                            <span className="text-sm font-sans font-medium text-gray-700 block">İçerik Göster</span>
                            <span className="text-xs text-gray-500">Başlık, açıklama ve buton gösterilsin</span>
                          </div>
                        </label>
                        <label className="flex items-center gap-2 p-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-white/50 bg-white">
                          <input
                            type="checkbox"
                            checked={formData.showOverlay}
                            onChange={(e) => setFormData({ ...formData, showOverlay: e.target.checked })}
                            className="rounded w-4 h-4"
                          />
                          <div>
                            <span className="text-sm font-sans font-medium text-gray-700 block">Overlay Efektleri</span>
                            <span className="text-xs text-gray-500">Görsel üzerinde efekt gösterilsin</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Sağ Kolon - Resim */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                          Desktop Görsel <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-3">
                          {selectedImage ? (
                            <div className="relative group">
                              <div className="relative aspect-video bg-gray-50 border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                <Image
                                  src={selectedImage.url}
                                  alt={formData.title || "Hero slide"}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 640px"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedImage(null);
                                  setFormData({ ...formData, image: "" });
                                }}
                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2">
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                              <span className="text-sm font-sans text-gray-400">Görsel seçilmedi</span>
                            </div>
                          )}
                          <MediaSelector
                            onSelect={(media) => {
                              if (media.length > 0) {
                                const imageUrl = media[0].url;
                                setSelectedImage({ url: imageUrl });
                                setFormData({ ...formData, image: imageUrl });
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
                              alt: formData.title || "",
                              createdAt: new Date(),
                              usageCount: 0,
                            }] : []}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                          Mobil Görsel <span className="text-xs text-gray-500 font-normal">(Opsiyonel)</span>
                        </label>
                        <div className="space-y-3">
                          {selectedMobileImage ? (
                            <div className="relative group">
                              <div className="relative aspect-video bg-gray-50 border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                <Image
                                  src={selectedMobileImage.url}
                                  alt={formData.title || "Hero slide - Mobil"}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 640px"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMobileImage(null);
                                  setFormData({ ...formData, mobileImage: "" });
                                }}
                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2">
                              <ImageIcon className="w-12 h-12 text-gray-400" />
                              <span className="text-sm font-sans text-gray-400">Mobil görsel seçilmedi</span>
                              <span className="text-xs font-sans text-gray-400">Boş bırakılırsa desktop görsel kullanılır</span>
                            </div>
                          )}
                          <MediaSelector
                            onSelect={(media) => {
                              if (media.length > 0) {
                                const imageUrl = media[0].url;
                                setSelectedMobileImage({ url: imageUrl });
                                setFormData({ ...formData, mobileImage: imageUrl });
                              }
                            }}
                            multiple={false}
                            currentSelection={selectedMobileImage ? [{
                              id: "",
                              name: "",
                              url: selectedMobileImage.url,
                              type: "image",
                              size: 0,
                              mimeType: "image/jpeg",
                              alt: formData.title || "",
                              createdAt: new Date(),
                              usageCount: 0,
                            }] : []}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-blue-200 mt-6">
                    <button
                      onClick={() => handleUpdate(slide.id)}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-sans font-medium flex items-center gap-2 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Değişiklikleri Kaydet
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-sans font-medium transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
                ) : (
                  // Normal Görünüm - Kart Tasarımı
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Görsel Önizleme */}
                      <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        {slide.image ? (
                          <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        {!slide.isActive && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <EyeOff className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* İçerik */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-sans font-semibold text-gray-900 truncate">
                                {slide.title || "Başlıksız"}
                              </h4>
                              {slide.isActive ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                                  Aktif
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                  Pasif
                                </span>
                              )}
                            </div>
                            {slide.subtitle && (
                              <p className="text-sm font-sans text-gray-600 mb-1">{slide.subtitle}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                              <span className="capitalize">Pozisyon: {slide.position}</span>
                              <span>•</span>
                              <span>Sıra: {slide.order + 1}</span>
                              {slide.ctaText && (
                                <>
                                  <span>•</span>
                                  <span>CTA: {slide.ctaText}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Aksiyon Butonları */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleMoveUp(slide)}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Yukarı taşı"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(slide)}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Aşağı taşı"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(slide)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(slide.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

