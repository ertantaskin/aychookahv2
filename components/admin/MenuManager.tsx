"use client";

import { useState, useEffect } from "react";
import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateSectionTitle,
  reorderMenuItems,
} from "@/lib/actions/admin/menu";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Save, X } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  href: string | null;
  location: string;
  order: number;
  isActive: boolean;
  isSectionTitle: boolean;
  icon: string | null;
}

const LOCATIONS = [
  { value: "header", label: "Header Menüsü" },
  { value: "footer-links", label: "Footer - Keşfet" },
  { value: "footer-categories", label: "Footer - Kategoriler" },
  { value: "footer-social", label: "Footer - Sosyal Medya" },
  { value: "footer-bottom", label: "Footer - Alt Bar" },
];

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("header");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    href: "",
    location: "header",
    order: 0,
    isActive: true,
    isSectionTitle: false,
    icon: "",
  });
  const [sectionTitle, setSectionTitle] = useState("");

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await getAllMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error("Error loading menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const getItemsByLocation = (location: string) => {
    return menuItems.filter((item) => item.location === location && !item.isSectionTitle);
  };

  const getSectionTitle = (location: string) => {
    return menuItems.find((item) => item.location === `${location}-title` && item.isSectionTitle);
  };

  const handleCreate = async () => {
    try {
      await createMenuItem({
        ...formData,
        href: formData.href || null,
        icon: formData.icon || null,
      });
      await loadMenuItems();
      resetForm();
    } catch (error: any) {
      alert(error.message || "Menü öğesi oluşturulurken bir hata oluştu");
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateMenuItem({
        id,
        ...formData,
        href: formData.href || null,
        icon: formData.icon || null,
      });
      await loadMenuItems();
      setEditingId(null);
      resetForm();
    } catch (error: any) {
      alert(error.message || "Menü öğesi güncellenirken bir hata oluştu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu menü öğesini silmek istediğinize emin misiniz?")) return;

    try {
      await deleteMenuItem(id);
      await loadMenuItems();
    } catch (error: any) {
      alert(error.message || "Menü öğesi silinirken bir hata oluştu");
    }
  };

  const handleReorder = async (location: string, items: MenuItem[]) => {
    try {
      await reorderMenuItems(
        location,
        items.map((item, index) => ({ id: item.id, order: index }))
      );
      await loadMenuItems();
    } catch (error: any) {
      alert(error.message || "Sıralama güncellenirken bir hata oluştu");
    }
  };

  const handleMoveUp = async (item: MenuItem) => {
    const items = getItemsByLocation(item.location);
    const currentIndex = items.findIndex((i) => i.id === item.id);
    if (currentIndex > 0) {
      const newItems = [...items];
      [newItems[currentIndex], newItems[currentIndex - 1]] = [
        newItems[currentIndex - 1],
        newItems[currentIndex],
      ];
      await handleReorder(item.location, newItems);
    }
  };

  const handleMoveDown = async (item: MenuItem) => {
    const items = getItemsByLocation(item.location);
    const currentIndex = items.findIndex((i) => i.id === item.id);
    if (currentIndex < items.length - 1) {
      const newItems = [...items];
      [newItems[currentIndex], newItems[currentIndex + 1]] = [
        newItems[currentIndex + 1],
        newItems[currentIndex],
      ];
      await handleReorder(item.location, newItems);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData({
      label: item.label,
      href: item.href || "",
      location: item.location,
      order: item.order,
      isActive: item.isActive,
      isSectionTitle: item.isSectionTitle,
      icon: item.icon || "",
    });
  };

  const handleSectionTitleUpdate = async (location: string) => {
    try {
      await updateSectionTitle(location, sectionTitle);
      await loadMenuItems();
      setEditingSectionTitle(null);
      setSectionTitle("");
    } catch (error: any) {
      alert(error.message || "Bölüm başlığı güncellenirken bir hata oluştu");
    }
  };

  const resetForm = () => {
    setFormData({
      label: "",
      href: "",
      location: selectedLocation,
      order: 0,
      isActive: true,
      isSectionTitle: false,
      icon: "",
    });
    setEditingId(null);
  };

  const currentItems = getItemsByLocation(selectedLocation);
  const currentSectionTitle = getSectionTitle(selectedLocation);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 font-sans">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
          Menü Konumu
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            resetForm();
          }}
          className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>

      {/* Section Title */}
      {selectedLocation !== "header" && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-sans font-medium text-gray-700">
              Bölüm Başlığı
            </label>
            {editingSectionTitle === selectedLocation ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSectionTitleUpdate(selectedLocation)}
                  className="p-1 text-green-600 hover:text-green-700"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingSectionTitle(null);
                    setSectionTitle("");
                  }}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingSectionTitle(selectedLocation);
                  setSectionTitle(currentSectionTitle?.label || "");
                }}
                className="p-1 text-blue-600 hover:text-blue-700"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
          {editingSectionTitle === selectedLocation ? (
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
              placeholder="Bölüm başlığı"
            />
          ) : (
            <div className="text-lg font-sans font-semibold text-gray-900">
              {currentSectionTitle?.label || "Başlık yok"}
            </div>
          )}
        </div>
      )}

      {/* Create Form - Sadece yeni ekleme için */}
      {!editingId && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-sans font-semibold mb-4 text-gray-900">
            Yeni Menü Öğesi Ekle
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                Label
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                Link (href)
              </label>
              <input
                type="text"
                value={formData.href}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                placeholder="/urunler"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-sans text-gray-700">Aktif</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-sans font-semibold text-gray-900">Menü Öğeleri</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {currentItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-sans">
              Henüz menü öğesi yok
            </div>
          ) : (
            currentItems.map((item) => (
              <div key={item.id}>
                {editingId === item.id ? (
                  // Düzenleme Formu - Inline
                  <div className="px-4 py-4 bg-blue-50 border-l-4 border-blue-500">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-sans font-semibold text-gray-900">
                          Menü Öğesini Düzenle
                        </h4>
                      </div>
                      <div>
                        <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                          Label
                        </label>
                        <input
                          type="text"
                          value={formData.label}
                          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                          className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                          Link (href)
                        </label>
                        <input
                          type="text"
                          value={formData.href}
                          onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                          className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
                          placeholder="/urunler"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm font-sans text-gray-700">Aktif</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdate(item.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-sans"
                        >
                          Güncelle
                        </button>
                        <button
                          onClick={resetForm}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-sans"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal Görünüm
                  <div className="px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-sans font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm font-sans text-gray-500">{item.href || "Link yok"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMoveUp(item)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                        title="Yukarı taşı"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(item)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                        title="Aşağı taşı"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

