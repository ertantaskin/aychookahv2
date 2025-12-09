"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  upsertPaymentGateway,
  togglePaymentGateway,
  deletePaymentGateway,
} from "@/lib/actions/admin/payment-gateways";
import { useRouter } from "next/navigation";

interface PaymentGateway {
  id: string;
  name: string;
  displayName: string;
  isActive: boolean;
  isTestMode: boolean;
  config: {
    apiKey?: string;
    secretKey?: string;
    uri?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentGatewaysClientProps {
  initialGateways: PaymentGateway[];
}

export default function PaymentGatewaysClient({
  initialGateways,
}: PaymentGatewaysClientProps) {
  const router = useRouter();
  const [gateways, setGateways] = useState(initialGateways);
  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "iyzico",
    displayName: "iyzico Sanal POS",
    isActive: false,
    isTestMode: true,
    apiKey: "",
    secretKey: "",
    uri: "https://sandbox-api.iyzipay.com",
    // EFT/Havale için
    bankName: "",
    accountName: "",
    iban: "",
    branch: "",
    accountNumber: "",
  });

  const handleEdit = (gateway: PaymentGateway) => {
    setEditingGateway(gateway);
    const config = gateway.config as any;
    setFormData({
      name: gateway.name,
      displayName: gateway.displayName,
      isActive: gateway.isActive,
      isTestMode: gateway.isTestMode,
      apiKey: config?.apiKey || "",
      secretKey: config?.secretKey || "",
      uri: config?.uri || "https://sandbox-api.iyzipay.com",
      // EFT/Havale için
      bankName: config?.bankName || "",
      accountName: config?.accountName || "",
      iban: config?.iban || "",
      branch: config?.branch || "",
      accountNumber: config?.accountNumber || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // EFT/Havale için özel config
      const config = formData.name === "eft-havale" 
        ? {
            bankName: formData.bankName,
            accountName: formData.accountName,
            iban: formData.iban,
            branch: formData.branch,
            accountNumber: formData.accountNumber,
          }
        : {
            apiKey: formData.apiKey,
            secretKey: formData.secretKey,
            uri: formData.uri,
          };

      await upsertPaymentGateway({
        name: formData.name,
        displayName: formData.displayName,
        isActive: formData.isActive,
        isTestMode: formData.isTestMode,
        config,
      });

      toast.success("Ödeme sistemi kaydedildi");
      setEditingGateway(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await togglePaymentGateway(id, !currentStatus);
      toast.success(
        !currentStatus
          ? "Ödeme sistemi aktif edildi"
          : "Ödeme sistemi devre dışı bırakıldı"
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ödeme sistemini silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await deletePaymentGateway(id);
      toast.success("Ödeme sistemi silindi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-sans font-bold text-luxury-black">Ödeme Sistemleri</h1>
        <button
          onClick={() => {
            setEditingGateway(null);
            setFormData({
              name: "iyzico",
              displayName: "iyzico Sanal POS",
              isActive: false,
              isTestMode: true,
              apiKey: "",
              secretKey: "",
              uri: "https://sandbox-api.iyzipay.com",
              bankName: "",
              accountName: "",
              iban: "",
              branch: "",
              accountNumber: "",
            });
          }}
          className="px-4 py-2 font-sans bg-luxury-goldLight text-luxury-black rounded-lg hover:bg-luxury-goldLight/90 transition-colors font-semibold"
        >
          Yeni Ödeme Sistemi Ekle
        </button>
      </div>

      {/* Form Modal */}
      {(editingGateway !== null || gateways.length === 0) && (
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-sans font-semibold mb-4 text-luxury-black">
            {editingGateway ? "Ödeme Sistemi Düzenle" : "Yeni Ödeme Sistemi Ekle"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Sistem Adı
                </label>
                {editingGateway ? (
                <input
                  type="text"
                  value={formData.name}
                    disabled
                    className="w-full px-4 py-2.5 font-sans text-gray-500 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      if (newName === "eft-havale") {
                        setFormData({
                          ...formData,
                          name: "eft-havale",
                          displayName: "EFT/Havale",
                          isTestMode: false,
                          apiKey: "",
                          secretKey: "",
                          uri: "",
                          bankName: "",
                          accountName: "",
                          iban: "",
                          branch: "",
                          accountNumber: "",
                        });
                      } else {
                        setFormData({
                          ...formData,
                          name: newName,
                          displayName: newName === "iyzico" ? "iyzico Sanal POS" : formData.displayName,
                          isTestMode: true,
                          apiKey: "",
                          secretKey: "",
                          uri: "https://sandbox-api.iyzipay.com",
                          bankName: "",
                          accountName: "",
                          iban: "",
                          branch: "",
                          accountNumber: "",
                        });
                      }
                    }}
                  required
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight transition-all"
                  >
                    <option value="iyzico">iyzico</option>
                    <option value="eft-havale">EFT/Havale</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                  Görünen Ad
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                  placeholder="iyzico Sanal POS"
                />
              </div>
            </div>

            {formData.name !== "eft-havale" && (
              <>
            <div>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={formData.apiKey}
                onChange={(e) =>
                  setFormData({ ...formData, apiKey: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                placeholder="API Key"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                Secret Key
              </label>
              <input
                type="password"
                value={formData.secretKey}
                onChange={(e) =>
                  setFormData({ ...formData, secretKey: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                placeholder="Secret Key"
              />
            </div>
              </>
            )}

            {/* Gateway tipine göre form alanları */}
            {formData.name === "eft-havale" ? (
              <>
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Banka Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                    placeholder="Ziraat Bankası"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Hesap Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                    placeholder="AYC HOOKAH"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    IBAN *
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) =>
                      setFormData({ ...formData, iban: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all font-mono"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Şube
                  </label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                    placeholder="Şube Adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Hesap Numarası
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, accountNumber: e.target.value })
                    }
                    className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                    placeholder="00000000"
                  />
                </div>
              </>
            ) : (
              <>
            <div>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                API URI
              </label>
              <select
                value={formData.uri}
                onChange={(e) =>
                  setFormData({ ...formData, uri: e.target.value })
                }
                className="w-full px-4 py-2.5 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight transition-all"
              >
                <option value="https://sandbox-api.iyzipay.com">
                  Sandbox (Test)
                </option>
                <option value="https://api.iyzipay.com">Production</option>
              </select>
            </div>
              </>
            )}

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-luxury-goldLight border-gray-300 rounded focus:ring-luxury-goldLight"
                />
                <span className="text-sm font-sans font-medium text-gray-700">Aktif</span>
              </label>
              {formData.name !== "eft-havale" && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isTestMode}
                  onChange={(e) =>
                    setFormData({ ...formData, isTestMode: e.target.checked })
                  }
                  className="w-4 h-4 text-luxury-goldLight border-gray-300 rounded focus:ring-luxury-goldLight"
                />
                <span className="text-sm font-sans font-medium text-gray-700">Test Modu</span>
              </label>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 font-sans bg-luxury-goldLight text-luxury-black rounded-lg hover:bg-luxury-goldLight/90 transition-colors disabled:opacity-50 font-semibold"
              >
                {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => setEditingGateway(null)}
                className="px-4 py-2 font-sans bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gateway List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                Sistem
              </th>
              <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                Mod
              </th>
              <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {gateways.map((gateway) => (
              <tr key={gateway.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-sans font-medium text-gray-900">
                    {gateway.displayName}
                  </div>
                  <div className="text-sm font-sans text-gray-500">{gateway.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-sans font-semibold rounded-full ${
                      gateway.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {gateway.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-sans text-gray-500">
                  {gateway.name === "eft-havale" ? "-" : gateway.isTestMode ? "Test" : "Production"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-sans font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(gateway)}
                    className="text-blue-600 hover:text-blue-900 font-sans"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleToggle(gateway.id, gateway.isActive)}
                    className={`font-sans ${
                      gateway.isActive
                        ? "text-yellow-600 hover:text-yellow-900"
                        : "text-green-600 hover:text-green-900"
                    }`}
                  >
                    {gateway.isActive ? "Devre Dışı" : "Aktif Et"}
                  </button>
                  {gateway.name !== "eft-havale" && (
                  <button
                    onClick={() => handleDelete(gateway.id)}
                    className="text-red-600 hover:text-red-900 font-sans"
                  >
                    Sil
                  </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

