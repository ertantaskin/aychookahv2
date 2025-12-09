"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    error === "login_required"
      ? "Bu sayfaya erişmek için giriş yapmalısınız."
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: "user", // Sadece kullanıcı girişi
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Email veya şifre hatalı.");
        setLoading(false);
      } else if (result?.ok) {
        // Başarılı giriş - kullanıcı paneline yönlendir
        router.push("/hesabim");
        router.refresh();
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

