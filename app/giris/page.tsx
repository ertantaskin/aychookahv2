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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-sans font-bold text-luxury-black mb-2">Giriş Yap</h1>
          <p className="text-sm font-sans text-gray-600">Hesabınıza giriş yapın</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-sans text-red-600">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 font-sans bg-gradient-to-r from-luxury-goldLight to-luxury-gold text-luxury-black font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs font-sans text-gray-400 mb-2">
            Yönetici misiniz?
          </p>
          <Link
            href="/admin/giris"
            className="text-sm font-sans text-luxury-goldLight hover:text-luxury-gold font-semibold"
          >
            Admin Girişi
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm font-sans text-gray-500 hover:text-gray-700">
            Ana Sayfaya Dön
          </Link>
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

