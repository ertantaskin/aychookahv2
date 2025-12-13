"use client";

import { useState, useEffect } from "react";
import { getContactInfo, updateContactInfo } from "@/lib/actions/admin/menu";
import { Save } from "lucide-react";

export default function ContactInfoManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    footerDescription: "",
  });

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      setLoading(true);
      const info = await getContactInfo();
      setFormData({
        email: info.email || "",
        phone: info.phone || "",
        footerDescription: info.footerDescription || "",
      });
    } catch (error) {
      console.error("Error loading contact info:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateContactInfo(formData);
      alert("İletişim bilgileri başarıyla güncellendi");
    } catch (error: any) {
      alert(error.message || "İletişim bilgileri güncellenirken bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 font-sans">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-sans font-semibold mb-4 text-gray-900">İletişim Bilgileri</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
            placeholder="info@aychookah.com"
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Telefon
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
            placeholder="+90 XXX XXX XX XX"
          />
        </div>
        <div>
          <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
            Footer Açıklama Metni
          </label>
          <textarea
            value={formData.footerDescription}
            onChange={(e) =>
              setFormData({ ...formData, footerDescription: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400 transition-all"
            placeholder="Footer açıklama metni..."
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>
    </div>
  );
}

