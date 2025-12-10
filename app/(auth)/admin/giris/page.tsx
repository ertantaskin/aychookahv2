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
    <div className="min-h-screen bg-gradient-to-br from-luxury-black via-luxury-darkGray to-luxury-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-luxury-goldLight/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-luxury-goldLight/10 rounded-full mb-4">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-sans font-bold text-luxury-black mb-2">
            Admin Girişi
          </h1>
          <p className="text-sm font-sans text-gray-600">
            Yönetici paneline erişim için giriş yapın
          </p>
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
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
              placeholder="admin@aychookah.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 font-sans bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            className="text-sm font-sans text-gray-500 hover:text-gray-700 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs font-sans text-gray-400">
            Bu sayfa sadece yetkili yöneticiler içindir.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-luxury-black via-luxury-darkGray to-luxury-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-luxury-goldLight/20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-luxury-goldLight border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm font-sans text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}

