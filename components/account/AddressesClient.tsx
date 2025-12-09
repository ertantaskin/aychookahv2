"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAddress, updateAddress, deleteAddress } from "@/lib/actions/addresses";
import { toast } from "sonner";

interface Address {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AddressesClientProps {
  addresses: Address[];
}

export default function AddressesClient({ addresses: initialAddresses }: AddressesClientProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    isDefault: false,
  });

  const handleOpenForm = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        title: address.title,
        firstName: address.firstName,
        lastName: address.lastName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        district: address.district,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        title: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        city: "",
        district: "",
        postalCode: "",
        isDefault: false,
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
    setFormData({
      title: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      district: "",
      postalCode: "",
      isDefault: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
        toast.success("Adres güncellendi");
      } else {
        await createAddress(formData);
        toast.success("Adres eklendi");
      }
      router.refresh();
      handleCloseForm();
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await deleteAddress(addressId);
      toast.success("Adres silindi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Adres silinirken bir hata oluştu");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link
                href="/hesabim"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-sans font-semibold text-gray-900">Adreslerim</h1>
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="px-4 py-2 text-sm font-sans font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              + Yeni Adres
            </button>
          </div>
        </div>

        {addresses.length === 0 && !isFormOpen ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4 font-sans">Henüz adresiniz bulunmamaktadır.</p>
            <button
              onClick={() => handleOpenForm()}
              className="inline-block px-6 py-2.5 text-sm font-sans font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              İlk Adresinizi Ekleyin
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-lg border border-gray-200 p-6 relative"
              >
                {address.isDefault && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-sans font-medium rounded">
                    Varsayılan
                  </span>
                )}
                <h3 className="text-base font-sans font-semibold text-gray-900 mb-2">{address.title}</h3>
                <div className="space-y-1 text-sm font-sans text-gray-700 mb-4">
                  <p>
                    <strong>{address.firstName} {address.lastName}</strong>
                  </p>
                  <p>{address.address}</p>
                  <p>
                    {address.district} / {address.city}
                  </p>
                  <p>{address.postalCode}</p>
                  <p>Tel: {address.phone}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenForm(address)}
                    className="flex-1 px-4 py-2 text-sm font-sans font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="flex-1 px-4 py-2 text-sm font-sans font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-sans font-semibold text-gray-900">
                    {editingAddress ? "Adresi Düzenle" : "Yeni Adres Ekle"}
                  </h2>
                  <button
                    onClick={handleCloseForm}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-sans"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                      Adres Başlığı
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                      placeholder="Ev, İş, vs."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                        Ad
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                        Soyad
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                      Adres
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                        İlçe
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                        Şehir
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                      Posta Kodu
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4 text-luxury-goldLight border-gray-300 rounded focus:ring-luxury-goldLight"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm font-sans text-gray-700">
                      Varsayılan adres olarak ayarla
                    </label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 text-sm font-sans font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                    >
                      {isSubmitting ? "Kaydediliyor..." : editingAddress ? "Güncelle" : "Kaydet"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="px-4 py-2.5 text-sm font-sans font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

