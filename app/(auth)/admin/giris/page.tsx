"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // URL'deki error parametresini dinle ve hata mesajını güncelle
  useEffect(() => {
    if (error === "admin_required") {
      setErrorMessage("Bu sayfaya erişmek için admin girişi yapmalısınız.");
      // URL'den error parametresini temizle
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("error");
      window.history.replaceState({}, "", newUrl.toString());
    } else {
      setErrorMessage(null);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: "admin", // Admin için sabit
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Email veya şifre hatalı. Lütfen tekrar deneyin.");
        setLoading(false);
      } else if (result?.ok) {
        // Başarılı giriş - Session cookie'sinin set edilmesi için kısa bir gecikme
        // Sonra tam sayfa yenileme ile admin paneline yönlendir
        // Bu, middleware'in yeni session'ı görmesini sağlar
        // window.location.href kullanarak tam sayfa yenileme yapıyoruz
        // Bu sayede middleware yeni session cookie'sini görebilir
        await new Promise((resolve) => setTimeout(resolve, 300));
        window.location.href = "/admin";
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-black via-luxury-darkGray to-luxury-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-luxury-goldLight/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-luxury-gold/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-luxury-goldLight/10 rounded-full blur-3xl" />
      </div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-luxury-goldLight to-luxury-gold rounded-2xl mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-luxury-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-sans font-bold text-white mb-2">
              Admin Girişi
            </h1>
            <p className="text-sm sm:text-base font-sans text-luxury-lightGray">
              Yönetici paneline erişim için giriş yapın
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
              <p className="text-sm font-sans text-red-200">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-sans font-semibold text-white mb-2">
                Email Adresiniz
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 font-sans text-white bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-white/50 backdrop-blur-sm transition-all"
                placeholder="admin@aychookah.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-sans font-semibold text-white mb-2">
                Şifreniz
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 font-sans text-white bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-white/50 backdrop-blur-sm transition-all"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 font-sans bg-gradient-to-r from-luxury-goldLight to-luxury-gold text-luxury-black font-semibold rounded-xl hover:shadow-2xl hover:shadow-luxury-goldLight/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-luxury-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
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
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-sans text-white/70 hover:text-white transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-white/60">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-sans">
                Bu sayfa sadece yetkili yöneticiler içindir
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-luxury-black via-luxury-darkGray to-luxury-black flex items-center justify-center p-4">
        <div className="max-w-md w-full backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-luxury-goldLight border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm font-sans text-white/70">Yükleniyor...</p>
          </div>
        </div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}

