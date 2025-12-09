"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { addToCart } from "@/lib/actions/cart";
import { addToGuestCart, getGuestCart } from "@/lib/utils/cart-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import DOMPurify from "dompurify";

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    stock: number;
    images: Array<{ id: string; url: string; alt: string | null; isPrimary: boolean }>;
    features: Array<{ id: string; name: string }>;
    category: { id: string; name: string; slug: string };
    material?: string | null;
    height?: string | null;
    equipmentType?: string | null;
    isNew: boolean;
    isBestseller: boolean;
    reviews: Array<{
      id: string;
      rating: number;
      comment: string | null;
      user: { name: string | null };
      createdAt: Date;
    }>;
    _count: { reviews: number };
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();
  const images = product.images || [];
  const reviews = product.reviews || [];
  
  // Primary image'i bul veya ilk görseli kullan
  const primaryImageIndex = images.findIndex((img) => img.isPrimary);
  const initialImageIndex = primaryImageIndex >= 0 ? primaryImageIndex : 0;
  const primaryImage = images[initialImageIndex] || images[0];
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialImageIndex);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [availableStock, setAvailableStock] = useState(product.stock);

  // Kullanıcı session kontrolü ve mevcut stok hesaplama
  useEffect(() => {
    const checkSessionAndStock = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        if (data.user && data.user.role === "user") {
          setUser(data.user);
          setAvailableStock(product.stock);
        } else {
          // Guest kullanıcılar için sepetteki mevcut miktarı kontrol et
          const guestCart = getGuestCart();
          const existingItem = guestCart.find(item => item.productId === product.id);
          if (existingItem) {
            // Sepetteki miktarı stoktan çıkar
            const available = Math.max(0, product.stock - existingItem.quantity);
            setAvailableStock(available);
          } else {
            setAvailableStock(product.stock);
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
        setAvailableStock(product.stock);
      }
    };
    checkSessionAndStock();
  }, [product.id, product.stock]);

  // Quantity'yi availableStock'a göre sınırla
  useEffect(() => {
    if (quantity > availableStock && availableStock > 0) {
      setQuantity(availableStock);
    } else if (availableStock === 0 && quantity > 0) {
      setQuantity(1);
    }
  }, [availableStock]);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const handleAddToCart = async () => {
    // İlk stok kontrolü
    if (product.stock < quantity) {
      toast.dismiss();
      toast.error("Yeterli stok bulunmuyor", { duration: 2000 });
      return;
    }

    setIsAddingToCart(true);
    try {
      // Önce kullanıcı durumunu kontrol et
      const sessionResponse = await fetch("/api/auth/session");
      const sessionData = await sessionResponse.json();
      
      if (sessionData.user) {
        // Authenticated kullanıcı için server action kullan (stok kontrolü server-side yapılacak)
        const result = await addToCart(product.id, quantity);
        
        if (!result?.isGuest) {
          // Sepet sayısını güncellemek için custom event gönder
          window.dispatchEvent(new CustomEvent("cartUpdated"));
          toast.dismiss();
          toast.success("Ürün sepete eklendi", { duration: 2000 });
          router.refresh();
        } else {
          // Kullanıcı session'ı var ama veritabanında yok, guest olarak işle
          // Guest sepet için stok kontrolü
          const guestCart = getGuestCart();
          const existingItem = guestCart.find(item => item.productId === product.id);
          const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
          
          if (product.stock < totalQuantity) {
            toast.dismiss();
            toast.error(
              `Stokta sadece ${product.stock} adet ürün bulunmaktadır.${existingItem ? ` Sepetinizde ${existingItem.quantity} adet var.` : ''}`,
              { duration: 2000 }
            );
            setIsAddingToCart(false);
            return;
          }
          
          addToGuestCart(product.id, quantity);
          // Available stock'u güncelle
          const newAvailable = Math.max(0, availableStock - quantity);
          setAvailableStock(newAvailable);
          // localStorage senkron olduğu için direkt event dispatch edebiliriz
            window.dispatchEvent(new CustomEvent("cartUpdated"));
          toast.dismiss();
          toast.success("Ürün sepete eklendi", { duration: 2000 });
        }
      } else {
        // Guest kullanıcı için stok kontrolü yap
        const guestCart = getGuestCart();
        const existingItem = guestCart.find(item => item.productId === product.id);
        const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;
        
        if (product.stock < totalQuantity) {
          toast.dismiss();
          toast.error(
            `Stokta sadece ${product.stock} adet ürün bulunmaktadır.${existingItem ? ` Sepetinizde ${existingItem.quantity} adet var.` : ''}`,
            { duration: 2000 }
          );
          setIsAddingToCart(false);
          return;
        }
        
        // Guest kullanıcı için direkt localStorage'a ekle
        addToGuestCart(product.id, quantity);
        // Available stock'u güncelle
        const newAvailable = Math.max(0, availableStock - quantity);
        setAvailableStock(newAvailable);
        // localStorage senkron olduğu için direkt event dispatch edebiliriz
          window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast.dismiss();
        toast.success("Ürün sepete eklendi", { duration: 2000 });
      }
    } catch (error: any) {
      console.error("Add to cart error:", error);
      toast.error(error.message || "Sepete eklenirken bir hata oluştu");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm flex-wrap">
          <li>
            <Link
              href="/urunler"
              className="font-sans text-gray-500 hover:text-luxury-goldLight transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Ürünler
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <Link
              href={`/urunler?category=${product.category.slug}`}
              className="font-sans text-gray-500 hover:text-luxury-goldLight transition-colors"
            >
              {product.category.name}
            </Link>
          </li>
          <li>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <span className="font-sans text-luxury-black font-medium" aria-current="page">
              {product.name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Görseller - Left Thumbnail Gallery Layout */}
        <div className="flex gap-4">
          {/* Sol Taraf - Thumbnail Galeri */}
          {images.length > 1 && (
            <div className="hidden lg:flex flex-col gap-3 flex-shrink-0">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? "border-luxury-goldLight ring-2 ring-luxury-goldLight/30"
                      : "border-gray-200 hover:border-luxury-goldLight/50"
                  }`}
                  aria-label={`Görsel ${index + 1}'i seç`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `${product.name} - ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Sağ Taraf - Ana Görsel */}
          <div className="flex-1 relative">
            <div className="relative aspect-square w-full bg-gray-100 rounded-2xl overflow-hidden">
              {images.length > 0 && images[selectedImageIndex] && (
                <Image
                  src={images[selectedImageIndex].url}
                  alt={images[selectedImageIndex].alt || product.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}
              {product.isNew && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-luxury-goldLight text-luxury-black text-xs font-bold rounded-full z-10">
                  YENİ
                </span>
              )}
              {product.isBestseller && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full z-10">
                  ÇOK SATAN
                </span>
              )}
            </div>

            {/* Mobil için Thumbnail Görseller (Alt kısımda) */}
            {images.length > 1 && (
              <div className="lg:hidden grid grid-cols-4 gap-3 mt-4">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-luxury-goldLight ring-2 ring-luxury-goldLight/30"
                        : "border-gray-200 hover:border-luxury-goldLight/50"
                    }`}
                    aria-label={`Görsel ${index + 1}'i seç`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ürün Bilgileri */}
        <div className="space-y-6">
          {/* Kategori */}
          <div>
            <a
              href={`/urunler?category=${product.category.slug}`}
              className="font-sans text-sm text-luxury-goldLight hover:text-luxury-gold font-medium"
            >
              {product.category.name}
            </a>
          </div>

          {/* Başlık */}
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-luxury-black">
            {product.name}
          </h1>

          {/* Yorum Sayısı ve Yıldız Ortalaması - Küçük */}
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-2.5 h-2.5 ${
                    i < Math.round(averageRating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {reviews.length > 0 ? (
              <span className="font-sans text-[10px] text-gray-500">
                {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "yorum" : "yorum"})
              </span>
            ) : (
              <span className="font-sans text-[10px] text-gray-400">
                (Henüz yorum yok)
              </span>
            )}
          </div>

          {/* Fiyat */}
          <div className="font-sans text-4xl font-bold text-luxury-black">
            {product.price.toLocaleString("tr-TR")} ₺
          </div>

          {/* Stok Durumu */}
          <div>
            {product.stock > 0 ? (
              <span className="font-sans inline-flex items-center gap-2 text-green-600 font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Stokta var
              </span>
            ) : (
              <span className="font-sans inline-flex items-center gap-2 text-red-600 font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Stokta yok
              </span>
            )}
          </div>

          {/* Özellikler */}
          {product.features.length > 0 && (
            <div>
              <h3 className="font-sans text-lg font-semibold text-luxury-black mb-3">Özellikler</h3>
              <ul className="space-y-2">
                {product.features.map((feature) => (
                  <li key={feature.id} className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-luxury-goldLight"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-sans text-gray-700">{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ek Bilgiler */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {product.material && (
              <div>
                <span className="font-sans text-sm text-gray-600">Malzeme:</span>
                <p className="font-sans font-medium text-luxury-black">{product.material}</p>
              </div>
            )}
            {product.height && (
              <div>
                <span className="font-sans text-sm text-gray-600">Yükseklik:</span>
                <p className="font-sans font-medium text-luxury-black">{product.height}</p>
              </div>
            )}
            {product.equipmentType && (
              <div>
                <span className="font-sans text-sm text-gray-600">Ekipman Tipi:</span>
                <p className="font-sans font-medium text-luxury-black">{product.equipmentType}</p>
              </div>
            )}
          </div>

          {/* Kısa Açıklama */}
          {product.shortDescription && (
            <div className="pt-6 border-t border-gray-200">
              <p className="font-sans text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {product.shortDescription}
              </p>
            </div>
          )}

          {/* Miktar ve Sepete Ekle */}
          <div className="pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
              {/* Miktar Seçici */}
              <div className="w-full">
                <label className="font-sans text-sm font-medium text-gray-700 mb-2 block">Miktar</label>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white hover:border-luxury-goldLight transition-colors w-full h-[48px]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                    className="font-sans px-3 sm:px-4 h-full hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:text-luxury-black flex-shrink-0 flex items-center justify-center"
                    aria-label="Azalt"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="font-sans px-4 sm:px-6 h-full flex-1 text-center font-semibold text-luxury-black border-x border-gray-200 min-w-[60px] flex items-center justify-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock || availableStock === 0}
                    className="font-sans px-3 sm:px-4 h-full hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 hover:text-luxury-black flex-shrink-0 flex items-center justify-center"
                    aria-label="Artır"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
                </div>
                {product.stock > 0 && (
                  <p className="font-sans text-xs text-gray-500 mt-2">
                    {availableStock < product.stock ? (
                      <>
                        Stokta {product.stock} adet var. Sepetinizde {product.stock - availableStock} adet mevcut. 
                        <span className="text-luxury-goldLight font-semibold"> Maksimum {availableStock} adet ekleyebilirsiniz.</span>
                      </>
                    ) : (
                      <>Stokta {product.stock} adet var</>
                    )}
                  </p>
                )}
              </div>

              {/* Sepete Ekle Butonu */}
              <div className="w-full">
                <label className="font-sans text-sm font-medium text-gray-700 mb-2 block">
                  <span className="sm:hidden">Sepete Ekle</span>
                  <span className="hidden sm:inline opacity-0 pointer-events-none">Sepete Ekle</span>
                </label>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                  className="font-sans w-full h-[48px] px-6 bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Ekleniyor...</span>
                    </>
                  ) : product.stock === 0 ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Stokta Yok</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Sepete Ekle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Yapısı - Açıklama ve Yorumlar */}
      <div className="mt-16">
        {/* Tab Butonları - Modern Tasarım */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("description")}
            className={`font-sans px-6 py-4 font-semibold text-sm transition-all duration-300 relative ${
              activeTab === "description"
                ? "text-luxury-black"
                : "text-gray-500 hover:text-luxury-black"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg
                className={`w-5 h-5 transition-colors ${
                  activeTab === "description" ? "text-luxury-goldLight" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Açıklama
            </span>
            {activeTab === "description" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-luxury-goldLight to-luxury-goldDark rounded-t-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`font-sans px-6 py-4 font-semibold text-sm transition-all duration-300 relative ${
              activeTab === "reviews"
                ? "text-luxury-black"
                : "text-gray-500 hover:text-luxury-black"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg
                className={`w-5 h-5 transition-colors ${
                  activeTab === "reviews" ? "text-luxury-goldLight" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Yorumlar
              {reviews.length > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === "reviews"
                      ? "bg-luxury-goldLight text-luxury-black"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {reviews.length}
                </span>
              )}
            </span>
            {activeTab === "reviews" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-luxury-goldLight to-luxury-goldDark rounded-t-full"></span>
            )}
          </button>
        </div>

        {/* Tab İçerikleri - Animasyonlu Geçiş */}
        <div className="relative">
          {/* Açıklama Tab */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "description"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
            }`}
          >
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 md:p-12 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-luxury-goldLight/10 rounded-lg">
                  <svg
                    className="w-6 h-6 text-luxury-goldLight"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-sans text-2xl font-bold text-luxury-black">
                  Ürün Açıklaması
                </h3>
              </div>
              <div
                className="product-description-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.description, {
                    ALLOWED_TAGS: [
                      "p",
                      "br",
                      "strong",
                      "em",
                      "u",
                      "s",
                      "h1",
                      "h2",
                      "h3",
                      "h4",
                      "h5",
                      "h6",
                      "ul",
                      "ol",
                      "li",
                      "blockquote",
                      "a",
                      "img",
                      "code",
                      "pre",
                      "span",
                      "div",
                    ],
                    ALLOWED_ATTR: [
                      "href",
                      "src",
                      "alt",
                      "title",
                      "class",
                      "style",
                      "target",
                      "rel",
                    ],
                    ALLOW_DATA_ATTR: false,
                  }),
                }}
              />
            </div>
          </div>

          {/* Yorumlar Tab */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "reviews"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none"
            }`}
          >
            <div className="space-y-8">
              {/* Yorum Formu - Sadece giriş yapmış kullanıcılar için */}
              {user ? (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-luxury-goldLight/10 rounded-lg">
                      <svg
                        className="w-6 h-6 text-luxury-goldLight"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-sans text-2xl font-bold text-luxury-black">
                      Yorumunuzu Paylaşın
                    </h3>
                  </div>
                  <ReviewForm
                    productId={product.id}
                    onSuccess={() => {
                      router.refresh();
                    }}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-luxury-goldLight/5 to-luxury-goldLight/10 rounded-2xl p-8 text-center border-2 border-dashed border-luxury-goldLight/30">
                  <div className="max-w-md mx-auto">
                    <div className="p-3 bg-luxury-goldLight/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-luxury-goldLight"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="font-sans text-base text-gray-700 mb-6 font-medium">
                      Yorum yapmak için giriş yapmanız gerekiyor
                    </p>
                    <Link
                      href="/giris"
                      className="font-sans inline-flex items-center gap-2 px-6 py-3 bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all shadow-lg hover:shadow-xl"
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
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      Giriş Yap
                    </Link>
                  </div>
                </div>
              )}

              {/* Yorum Listesi */}
              <div className={user ? "pt-8" : ""}>
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-luxury-goldLight/10 rounded-lg">
                        <svg
                          className="w-6 h-6 text-luxury-goldLight"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-sans text-2xl font-bold text-luxury-black">
                        Müşteri Yorumları
                      </h3>
                    </div>
                    {reviews.length > 0 && (
                      <span className="font-sans text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                        {reviews.length} {reviews.length === 1 ? "yorum" : "yorum"}
                      </span>
                    )}
                  </div>
                  <ReviewList reviews={reviews} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

