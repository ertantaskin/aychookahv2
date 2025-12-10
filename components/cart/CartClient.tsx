"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from "@/lib/actions/cart";
import {
  getGuestCart,
  removeFromGuestCart,
  updateGuestCartItemQuantity,
  clearGuestCart,
} from "@/lib/utils/cart-client";
import { calculateTaxForCartWithShipping } from "@/lib/utils/tax-calculator";
import { calculateShippingCost } from "@/lib/utils/shipping-calculator";
import { toast } from "sonner";

interface CartClientProps {
  cart: {
    id: string;
    items: Array<{
      id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        stock: number;
        images: Array<{ url: string; alt: string | null }>;
      };
    }>;
  } | null;
  calculatedSubtotal: number;
  calculatedTax: number;
  calculatedShipping: number;
  calculatedTotal: number;
  taxSettings: {
    defaultTaxRate: number;
    taxIncluded: boolean;
  };
  shippingSettings: {
    defaultShippingCost: number;
    freeShippingThreshold: number | null;
    estimatedDeliveryDays: number;
  };
}

export default function CartClient({
  cart,
  calculatedSubtotal,
  calculatedTax,
  calculatedShipping,
  calculatedTotal,
  taxSettings,
  shippingSettings,
}: CartClientProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [guestCartItems, setGuestCartItems] = useState<any[]>([]);
  const [isLoadingGuestCart, setIsLoadingGuestCart] = useState(false);
  const [guestCalculations, setGuestCalculations] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });

  // Guest sepet için ürün bilgilerini yükle
  useEffect(() => {
    if (!cart) {
      setIsLoadingGuestCart(true);
      const guestCart = getGuestCart();
      
      if (guestCart.length > 0) {
        fetch("/api/products/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productIds: guestCart.map(item => item.productId) }),
        })
          .then(res => res.json())
          .then(data => {
            const items = guestCart.map(cartItem => {
              const product = data.products.find((p: any) => p.id === cartItem.productId);
              return product ? {
                id: cartItem.productId,
                quantity: cartItem.quantity,
                product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  stock: product.stock,
                  images: product.images.map((img: any) => ({ url: img.url, alt: img.alt })),
                },
              } : null;
            }).filter(Boolean);
            setGuestCartItems(items);
          })
          .catch(error => {
            console.error("Error loading guest cart:", error);
          })
          .finally(() => {
            setIsLoadingGuestCart(false);
          });
      } else {
        setIsLoadingGuestCart(false);
      }
    }
  }, [cart]);

  // Misafir sepet için hesaplamaları yap
  useEffect(() => {
    if (!cart && guestCartItems.length > 0) {
      const cartSubtotal = guestCartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      const shippingCost = calculateShippingCost(cartSubtotal, shippingSettings);
      const taxCalculation = calculateTaxForCartWithShipping(
        cartSubtotal,
        shippingCost,
        taxSettings.defaultTaxRate,
        taxSettings.taxIncluded
      );

      setGuestCalculations({
        subtotal: taxCalculation.subtotal,
        tax: taxCalculation.tax,
        shipping: taxCalculation.shippingCost,
        total: taxCalculation.total,
      });
    } else if (!cart && guestCartItems.length === 0) {
      setGuestCalculations({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      });
    }
  }, [cart, guestCartItems, taxSettings, shippingSettings]);

  const displayCart = cart || { items: guestCartItems };
  const isGuest = !cart;

  if (isLoadingGuestCart) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-goldLight mx-auto mb-4"></div>
          <p className="font-sans text-gray-600">Sepet yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!displayCart || displayCart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-6">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-sans font-bold text-gray-800 mb-2">Sepetiniz Boş</h2>
          <p className="text-sm font-sans text-gray-600 mb-8">
            Sepetinize ürün eklemek için ürünler sayfasını ziyaret edin.
          </p>
          <Link
            href="/urunler"
            className="inline-block px-6 py-3 font-sans bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  // Hesaplanmış değerleri kullan - misafir kullanıcılar için guestCalculations'ı kullan
  const subtotal = isGuest ? guestCalculations.subtotal : calculatedSubtotal;
  const shippingCost = isGuest ? guestCalculations.shipping : calculatedShipping;
  const tax = isGuest ? guestCalculations.tax : calculatedTax;
  const total = isGuest ? guestCalculations.total : calculatedTotal;

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    // Stok kontrolü - client-side
    const item = displayCart.items.find(i => i.id === itemId);
    if (item && newQuantity > item.product.stock) {
      toast.dismiss();
      toast.error(`Stokta sadece ${item.product.stock} adet ürün bulunmaktadır`, { duration: 2000 });
      return;
    }

    if (newQuantity < 1) {
      return;
    }

    setIsUpdating(itemId);
    try {
      if (isGuest) {
        // Optimistic update: Önce state'i güncelle
        setGuestCartItems(prevItems => 
          prevItems.map(i => 
            i.id === itemId ? { ...i, quantity: newQuantity } : i
          )
        );
        
        // localStorage'ı güncelle
        updateGuestCartItemQuantity(itemId, newQuantity);
        
        // Sepet sayısını güncelle
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        
        // Ürün bilgilerini güncelle (arka planda)
        const guestCart = getGuestCart();
        const productIds = guestCart.map(item => item.productId);
        if (productIds.length > 0) {
          fetch("/api/products/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds }),
          })
            .then(res => res.json())
            .then(data => {
              const items = guestCart.map(cartItem => {
                const product = data.products.find((p: any) => p.id === cartItem.productId);
                return product ? {
                  id: cartItem.productId,
                  quantity: cartItem.quantity,
                  product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    stock: product.stock,
                    images: product.images.map((img: any) => ({ url: img.url, alt: img.alt })),
                  },
                } : null;
              }).filter(Boolean);
              setGuestCartItems(items);
            })
            .catch(error => {
              console.error("Error updating guest cart items:", error);
            });
        } else {
          setGuestCartItems([]);
        }
        
        toast.dismiss();
        toast.success("Miktar güncellendi", { duration: 2000 });
      } else {
      await updateCartItemQuantity(itemId, newQuantity);
        window.dispatchEvent(new CustomEvent("cartUpdated"));
      router.refresh();
        toast.dismiss();
        toast.success("Miktar güncellendi", { duration: 2000 });
      }
    } catch (error: any) {
      // Hata durumunda state'i geri al
      if (isGuest && item) {
        setGuestCartItems(prevItems => 
          prevItems.map(i => 
            i.id === itemId ? { ...i, quantity: item.quantity } : i
          )
        );
      }
      toast.error(error.message || "Miktar güncellenirken bir hata oluştu");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setIsUpdating(itemId);
    try {
      if (isGuest) {
        removeFromGuestCart(itemId);
        const guestCart = getGuestCart();
        if (guestCart.length > 0) {
          const productIds = guestCart.map(item => item.productId);
          const res = await fetch("/api/products/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productIds }),
          });
          const data = await res.json();
          const items = guestCart.map(cartItem => {
            const product = data.products.find((p: any) => p.id === cartItem.productId);
            return product ? {
              id: cartItem.productId,
              quantity: cartItem.quantity,
              product: {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                stock: product.stock,
                images: product.images.map((img: any) => ({ url: img.url, alt: img.alt })),
              },
            } : null;
          }).filter(Boolean);
          setGuestCartItems(items);
        } else {
          setGuestCartItems([]);
        }
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast.dismiss();
        toast.success("Ürün sepetten çıkarıldı", { duration: 2000 });
      } else {
        await removeFromCart(itemId);
        // Sepet güncellendiğinde header'ı güncelle
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast.dismiss();
        toast.success("Ürün sepetten çıkarıldı", { duration: 2000 });
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Ürün çıkarılırken bir hata oluştu");
      setIsUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Sepeti temizlemek istediğinize emin misiniz?")) {
      return;
    }

    try {
      if (isGuest) {
        clearGuestCart();
        setGuestCartItems([]);
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast.dismiss();
        toast.success("Sepet temizlendi", { duration: 2000 });
      } else {
        await clearCart();
        // Sepet temizlendiğinde header'ı güncelle
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast.dismiss();
        toast.success("Sepet temizlendi", { duration: 2000 });
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Sepet temizlenirken bir hata oluştu");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-sans font-bold text-luxury-black">Sepetim</h1>
          <p className="text-sm font-sans text-gray-600 mt-2">
            {displayCart.items.length} ürün
          </p>
          {isGuest && (
            <p className="text-xs font-sans text-yellow-600 mt-1">
              Sepetinizi kaydetmek için giriş yapın
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sepet Kalemleri */}
          <div className="lg:col-span-2 space-y-4">
            {displayCart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Ürün Görseli */}
                  <Link
                    href={`/urun/${item.product.slug}`}
                    className="relative w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <Image
                      src={item.product.images[0]?.url || "/images/placeholder.jpg"}
                      alt={item.product.images[0]?.alt || item.product.name}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Ürün Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/urun/${item.product.slug}`}
                      className="text-lg font-sans font-semibold text-luxury-black hover:text-luxury-goldLight transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xl font-sans font-bold text-luxury-black mt-2">
                      {item.product.price.toLocaleString("tr-TR")} ₺
                    </p>
                    {item.product.stock < item.quantity && (
                      <p className="text-sm font-sans text-red-600 mt-1">
                        Stok yetersiz (Stok: {item.product.stock})
                      </p>
                    )}
                  </div>

                  {/* Miktar ve İşlemler */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Miktar */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={isUpdating === item.id || item.quantity <= 1}
                        className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold text-lg"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 min-w-[60px] text-center font-sans text-gray-900 border-x border-gray-300">
                        {isUpdating === item.id ? "..." : item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={
                          isUpdating === item.id ||
                          item.quantity >= item.product.stock
                        }
                        className="px-3 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold text-lg"
                      >
                        +
                      </button>
                    </div>

                    {/* Toplam */}
                    <div className="text-right">
                      <p className="text-lg font-sans font-bold text-luxury-black">
                        {(item.product.price * item.quantity).toLocaleString("tr-TR")} ₺
                      </p>
                    </div>

                    {/* Sil */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isUpdating === item.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Sepetten Çıkar"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Sepeti Temizle */}
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 font-sans font-medium text-sm"
            >
              Sepeti Temizle
            </button>
          </div>

          {/* Özet */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-xl font-sans font-bold text-luxury-black mb-6">Sipariş Özeti</h2>

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

              {isGuest ? (
                <Link
                  href="/giris?redirect=/sepet"
                  className="block w-full text-center px-6 py-4 font-sans bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all"
                >
                  Giriş Yap ve Ödemeye Geç
                </Link>
              ) : (
              <Link
                href="/odeme"
                className="block w-full text-center px-6 py-4 font-sans bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all"
              >
                Ödemeye Geç
              </Link>
              )}

              <Link
                href="/urunler"
                className="block w-full text-center px-6 py-3 mt-3 font-sans border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

