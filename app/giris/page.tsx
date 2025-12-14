"use client";

import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getGuestCart } from "@/lib/utils/cart-client";
import { mergeGuestCart } from "@/lib/actions/cart";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // URL'deki error parametresini sadece ilk yüklemede göster
  useEffect(() => {
    if (error === "login_required") {
      // Bu mesajı göstermeyelim, çünkü kullanıcı zaten giriş yapmaya çalışıyor
      // setErrorMessage("Bu sayfaya erişmek için giriş yapmalısınız.");
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // Giriş işlemini başlat
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: "user", // Sadece kullanıcı girişi
        redirect: false,
      });

      // NextAuth v5'te bazen result güvenilir olmayabiliyor
      // Bu yüzden session kontrolünü öncelikli yapıyoruz
      // Session cookie'sinin set edilmesi için kısa bir gecikme
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Session kontrolü yap - bu en güvenilir yöntem
      let sessionData = null;
      let sessionCheckAttempts = 0;
      const maxAttempts = 3;
      
      while (sessionCheckAttempts < maxAttempts && !sessionData?.user) {
        try {
          const sessionResponse = await fetch("/api/auth/session", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          });
          sessionData = await sessionResponse.json();
          
          if (sessionData?.user) {
            break; // Session bulundu, döngüden çık
          }
          
          // Session henüz oluşmadıysa biraz bekle ve tekrar dene
          if (sessionCheckAttempts < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        } catch (error) {
          console.error("Session check error:", error);
        }
        sessionCheckAttempts++;
      }
      
      // Session kontrolü sonucu
      if (sessionData?.user) {
        // Başarılı giriş - misafir sepetini kullanıcı sepetine aktar
        try {
          const guestCart = getGuestCart();
          if (guestCart.length > 0) {
            await mergeGuestCart(guestCart);
            // Misafir sepetini temizle
            if (typeof window !== "undefined") {
              localStorage.removeItem("aychookah_guest_cart");
            }
          }
        } catch (error) {
          console.error("Error merging guest cart:", error);
          // Sepet aktarımı hatası olsa bile girişe devam et
        }

        // Yönlendirme: callbackUrl varsa oraya, yoksa sepet sayfasına
        const redirectPath = callbackUrl || "/sepet";
        
        // Sepet sayfasına yönlendiriyorsak, sepetin güncellenmesi için event gönder
        if (redirectPath === "/sepet" || redirectPath === "/odeme") {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("cartUpdated"));
          }
        }
        
        router.push(redirectPath);
        router.refresh();
      } else {
        // Session oluşmadı - giriş başarısız
        // result.error kontrolü de yap (fallback)
      if (result?.error) {
        setErrorMessage("Email veya şifre hatalı.");
        } else {
          setErrorMessage("Giriş yapılamadı. Lütfen tekrar deneyin.");
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sol Kolon - Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-4 flex justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-luxury-goldLight/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-sans font-bold text-luxury-black mb-2 text-center">
              Hesabınıza Giriş Yapın
            </h1>
            <p className="text-sm sm:text-base font-sans text-gray-600 text-center">
              Aychookah hesabınızla giriş yaparak alışverişe devam edin
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-sans text-red-600">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">
                Email Adresiniz
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 font-sans text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                placeholder="ornek@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">
                Şifreniz
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 font-sans text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-gray-300 bg-white text-luxury-goldLight focus:ring-2 focus:ring-luxury-goldLight"
                />
                <label htmlFor="remember" className="text-xs sm:text-sm font-sans text-gray-600">
                  Beni hatırla
                </label>
              </div>
              <Link href="/sifre-sifirla" className="text-xs sm:text-sm font-sans text-luxury-goldLight hover:underline">
                Şifremi Unuttum
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 font-sans bg-gradient-to-r from-luxury-goldLight to-luxury-gold text-luxury-black font-semibold rounded-lg hover:shadow-lg hover:shadow-luxury-goldLight/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-luxury-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-sans text-gray-600">
              Hesabınız yok mu?{" "}
              <Link href="/kayit" className="text-luxury-goldLight font-semibold hover:underline">
                Kayıt Ol
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs sm:text-sm font-sans text-gray-500 hover:text-gray-700 transition-colors">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>

      {/* Sağ Kolon - Açıklama */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-luxury-black via-luxury-darkGray to-luxury-black flex-col items-center justify-center p-8 relative overflow-hidden min-h-screen">
        {/* Arka Plan Dekorasyonu */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-luxury-goldLight rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-luxury-gold rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg text-center w-full flex flex-col items-center justify-center">
          {/* Logo veya İkon */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-luxury-goldLight to-luxury-gold rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-luxury-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-sans font-bold text-white mb-6">
            Tekrar Hoş Geldiniz
          </h2>
          
          <p className="text-lg sm:text-xl font-sans text-luxury-lightGray mb-8 leading-relaxed">
            Aychookah hesabınızla giriş yaparak özel fırsatlar, hızlı sipariş takibi ve 
            kişiselleştirilmiş alışveriş deneyiminin keyfini çıkarın.
          </p>

          {/* Özellikler */}
          <div className="space-y-4 mb-8 max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-luxury-goldLight/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm sm:text-base font-sans text-luxury-lightGray text-left">
                Hızlı ve güvenli ödeme seçenekleri
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-luxury-goldLight/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm sm:text-base font-sans text-luxury-lightGray text-left">
                Sipariş geçmişinize kolay erişim
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-luxury-goldLight/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm sm:text-base font-sans text-luxury-lightGray text-left">
                Özel indirimler ve kampanyalar
              </p>
            </div>
          </div>

          {/* Güven Rozeti */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-luxury-goldLight/10 rounded-full border border-luxury-goldLight/30">
            <svg className="w-4 h-4 text-luxury-goldLight" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-sans text-luxury-lightGray">
              Güvenli ve Hızlı Alışveriş
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-luxury-goldLight border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm font-sans text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

