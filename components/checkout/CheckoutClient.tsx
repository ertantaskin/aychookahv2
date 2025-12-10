"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPayment } from "@/lib/actions/payment";
import { getAvailablePaymentMethods } from "@/lib/actions/admin/payment-gateways";
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
}

interface CheckoutClientProps {
  cart: {
    id: string;
    items: Array<{
      id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        price: number;
      };
    }>;
  } | null;
  retryOrder: {
    id: string;
    orderNumber: string;
    total: number;
    subtotal: number;
    tax: number;
    shippingCost: number;
    shippingAddress: any;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        name: string;
        price: number;
      } | null;
    }>;
  } | null;
  addresses: Address[];
  userEmail: string;
  calculatedSubtotal: number;
  calculatedTax: number;
  calculatedShipping: number;
  calculatedTotal: number;
  taxSettings: {
    defaultTaxRate: number;
    taxIncluded: boolean;
  };
}

interface PaymentMethod {
  id: string;
  name: string;
  displayName: string;
  type: "manual" | "gateway";
  isActive: boolean;
}

export default function CheckoutClient({
  cart,
  retryOrder,
  addresses,
  userEmail,
  calculatedSubtotal,
  calculatedTax,
  calculatedShipping,
  calculatedTotal,
  taxSettings,
}: CheckoutClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
  });

  // Ödeme yöntemlerini yükle
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await getAvailablePaymentMethods();
        setPaymentMethods(methods);
        // İlk aktif yöntemi varsayılan olarak seç
        if (methods.length > 0 && !selectedPaymentMethod) {
          setSelectedPaymentMethod(methods[0].id);
        }
      } catch (error) {
        console.error("Error loading payment methods:", error);
        toast.error("Ödeme yöntemleri yüklenirken bir hata oluştu");
      } finally {
        setIsLoadingMethods(false);
      }
    };
    loadPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Retry durumunda mevcut sipariş adresini yükle
  useEffect(() => {
    if (retryOrder?.shippingAddress) {
      setFormData({
        firstName: retryOrder.shippingAddress.firstName || "",
        lastName: retryOrder.shippingAddress.lastName || "",
        phone: retryOrder.shippingAddress.phone || "",
        email: retryOrder.shippingAddress.email || userEmail,
        address: retryOrder.shippingAddress.address || "",
        city: retryOrder.shippingAddress.city || "",
        district: retryOrder.shippingAddress.district || "",
        postalCode: retryOrder.shippingAddress.postalCode || "",
      });
      setSelectedAddressId("retry");
    } else if (addresses.length > 0) {
      // Varsayılan adresi bul veya ilk adresi seç
      const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setFormData({
          firstName: defaultAddress.firstName,
          lastName: defaultAddress.lastName,
          phone: defaultAddress.phone,
          email: userEmail,
          address: defaultAddress.address,
          city: defaultAddress.city,
          district: defaultAddress.district,
          postalCode: defaultAddress.postalCode,
        });
      }
    } else {
      // Adres yoksa sadece e-postayı doldur
      setFormData((prev) => ({
        ...prev,
        email: userEmail,
      }));
    }
  }, [retryOrder, addresses, userEmail]);

  // Adres seçildiğinde formu doldur
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === "new") {
      // Yeni adres seçildi, formu temizle ama e-postayı koru
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: userEmail, // E-postayı koru
        address: "",
        city: "",
        district: "",
        postalCode: "",
      });
    } else {
      // Kayıtlı adres seçildi, formu doldur
      const selectedAddress = addresses.find((addr) => addr.id === addressId);
      if (selectedAddress) {
        setFormData({
          firstName: selectedAddress.firstName,
          lastName: selectedAddress.lastName,
          phone: selectedAddress.phone,
          email: userEmail, // Kullanıcının e-postasını kullan
          address: selectedAddress.address,
          city: selectedAddress.city,
          district: selectedAddress.district,
          postalCode: selectedAddress.postalCode,
        });
      }
    }
  };

  // Hesaplanmış değerleri kullan
  const subtotal = calculatedSubtotal;
  const shippingCost = calculatedShipping;
  const tax = calculatedTax;
  const total = calculatedTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPaymentMethod) {
      toast.error("Lütfen bir ödeme yöntemi seçin");
      return;
    }

    setIsProcessing(true);

    try {
      const shippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        postalCode: formData.postalCode,
      };

      // Retry durumunda retryOrderId'yi ekle
      const retryOrderId = retryOrder?.id;

      // EFT/Havale seçildiyse
      if (selectedPaymentMethod === "eft-havale") {
        const paymentResult = await createPayment(shippingAddress, "eft-havale", retryOrderId);
        
        if (paymentResult && typeof paymentResult === "object" && "type" in paymentResult && paymentResult.type === "eft-havale") {
          const orderId = (paymentResult as any).orderId;
          const orderNumber = (paymentResult as any).orderNumber;
          // Ortak başarı sayfasına yönlendir (paymentMethod parametresi ile)
          router.push(`/odeme/basarili?orderId=${encodeURIComponent(orderId)}&orderNumber=${encodeURIComponent(orderNumber)}&paymentMethod=eft-havale`);
          return;
        }
      }

      // Cookie'ye gerek yok - artık veritabanından çalışıyoruz
      const paymentResult = await createPayment(shippingAddress, selectedPaymentMethod, retryOrderId);

      console.log("Payment result:", paymentResult);

      // iyzico iframe sayfasına yönlendir
      if (paymentResult && typeof paymentResult === "object" && "token" in paymentResult) {
        const token = (paymentResult as any).token as string;
        const checkoutFormContent = (paymentResult as any).checkoutFormContent as string | undefined;
        
        if (token && token.trim() !== "") {
          console.log("Redirecting to iframe with token:", token);
          // checkoutFormContent varsa, onu da gönder
          if (checkoutFormContent) {
            // checkoutFormContent'i sessionStorage'a kaydet
            sessionStorage.setItem("iyzico_checkoutFormContent", checkoutFormContent);
          }
          router.push(`/odeme/iframe?token=${encodeURIComponent(token)}`);
        } else {
          throw new Error("Ödeme token'ı alınamadı");
        }
      } else if (paymentResult && typeof paymentResult === "object" && "paymentPageUrl" in paymentResult) {
        // Fallback: Eski yöntem (redirect)
        window.location.href = (paymentResult as any).paymentPageUrl as string;
      } else {
        throw new Error("Ödeme formu oluşturulamadı");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Ödeme başlatılırken bir hata oluştu");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-sans font-bold text-luxury-black mb-8">Ödeme</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-sans font-bold text-luxury-black mb-6">
                Teslimat Bilgileri
              </h2>

              {/* Kayıtlı Adresler */}
              {addresses.length > 0 && !retryOrder && (
                <div className="mb-6">
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-3">
                    Kayıtlı Adresler
                  </label>
                  <div className="space-y-2">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddressId === address.id
                            ? "border-luxury-goldLight bg-luxury-goldLight/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={(e) => handleAddressSelect(e.target.value)}
                          className="mt-1 w-4 h-4 text-luxury-goldLight border-gray-300 focus:ring-luxury-goldLight focus:ring-2"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-semibold text-gray-900">
                              {address.title}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                                Varsayılan
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-sans text-gray-600 mt-1">
                            {address.firstName} {address.lastName}
                          </p>
                          <p className="text-sm font-sans text-gray-600">
                            {address.address}, {address.district} / {address.city}
                          </p>
                          <p className="text-sm font-sans text-gray-600">
                            {address.postalCode} - Tel: {address.phone}
                          </p>
                        </div>
                      </label>
                    ))}
                    <label
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === "new"
                          ? "border-luxury-goldLight bg-luxury-goldLight/10"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value="new"
                        checked={selectedAddressId === "new"}
                        onChange={(e) => handleAddressSelect(e.target.value)}
                        className="w-4 h-4 text-luxury-goldLight border-gray-300 focus:ring-luxury-goldLight focus:ring-2"
                      />
                      <span className="ml-3 font-sans font-medium text-gray-900">
                        Yeni Adres Ekle
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Adres *
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    İl *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    İlçe *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-2">
                    Posta Kodu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Özet */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-xl font-sans font-bold text-luxury-black mb-6">Sipariş Özeti</h2>

              <div className="space-y-3 mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-sm font-sans font-semibold text-gray-700 mb-3">Sipariş İçeriği</h3>
                {(retryOrder ? retryOrder.items : cart?.items || []).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans font-medium text-gray-900 truncate">
                        {(retryOrder ? (item.product?.name || "Silinmiş Ürün") : (item.product?.name || "Silinmiş Ürün")) || "Ürün"}
                      </p>
                      <p className="text-xs text-gray-500 font-sans mt-0.5">Adet: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-sans font-semibold text-gray-900 whitespace-nowrap">
                      {((retryOrder && 'price' in item ? item.price : (item.product?.price || 0)) * item.quantity).toLocaleString("tr-TR")} ₺
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-6">
                  {/* Ara Toplam */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span className="text-gray-700 font-sans font-medium">Ara Toplam</span>
                      </div>
                      <span className="text-gray-900 font-sans font-semibold whitespace-nowrap">{subtotal.toLocaleString("tr-TR")} ₺</span>
                    </div>
                    <p className="text-xs text-gray-500 font-sans ml-7">Ürün fiyatları toplamı (KDV hariç)</p>
                  </div>

                  {/* Kargo */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span className="text-gray-700 font-sans font-medium">Kargo Ücreti</span>
                  </div>
                      <span className={`font-sans font-semibold whitespace-nowrap ${shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {shippingCost === 0
                        ? "Ücretsiz"
                        : `${shippingCost.toLocaleString("tr-TR")} ₺`}
                    </span>
                  </div>
                    {shippingCost === 0 ? (
                      <p className="text-xs text-green-600 font-sans ml-7">✓ Ücretsiz kargo uygulandı</p>
                    ) : (
                      <p className="text-xs text-gray-500 font-sans ml-7">Kargo ücreti (KDV hariç)</p>
                    )}
                  </div>

                  {/* KDV */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-700 font-sans font-medium">
                          KDV (%{(taxSettings.defaultTaxRate * 100).toFixed(0)})
                        </span>
                      </div>
                      <span className="text-gray-900 font-sans font-semibold whitespace-nowrap">{tax.toLocaleString("tr-TR")} ₺</span>
                    </div>
                    <p className="text-xs text-gray-500 font-sans ml-7">Katma Değer Vergisi (ürünler + kargo üzerinden)</p>
                  </div>

                  {/* Toplam */}
                  <div className="border-t-2 border-gray-300 pt-4 mt-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <svg className="w-6 h-6 text-luxury-goldLight flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <span className="text-xl font-sans font-bold text-luxury-black block">Toplam Tutar</span>
                          <p className="text-xs text-gray-500 font-sans mt-1">Ödenecek toplam tutar</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-2xl font-sans font-bold text-luxury-black whitespace-nowrap block">{total.toLocaleString("tr-TR")} ₺</span>
                        <span className="text-xs font-normal text-gray-500 mt-1 block">KDV Dahil</span>
                      </div>
                  </div>
                </div>
              </div>

              {/* Ödeme Yöntemi Seçimi */}
              <div className="mb-6">
                <h3 className="text-lg font-sans font-semibold text-luxury-black mb-4">
                  Ödeme Yöntemi
                </h3>
                {isLoadingMethods ? (
                  <div className="text-sm text-gray-500 font-sans">Yükleniyor...</div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === method.id
                            ? "border-luxury-goldLight bg-luxury-goldLight/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod === method.id}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                          className="w-4 h-4 text-luxury-goldLight border-gray-300 focus:ring-luxury-goldLight focus:ring-2"
                        />
                        <span className="ml-3 font-sans font-medium text-gray-900">
                          {method.displayName}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing || !selectedPaymentMethod || isLoadingMethods}
                className="w-full px-6 py-4 font-sans bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "İşleniyor..." : "Ödemeye Geç"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

