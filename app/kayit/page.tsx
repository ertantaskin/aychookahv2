"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Validasyon
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Şifreler eşleşmiyor.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Şifre en az 6 karakter olmalıdır.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Kayıt sırasında bir hata oluştu.");
        setLoading(false);
        return;
      }

      // Başarılı kayıt - giriş sayfasına yönlendir
      router.push("/giris?registered=true");
    } catch (error: any) {
      console.error("Registration error:", error);
      setErrorMessage(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-sans font-bold text-luxury-black mb-2">Kayıt Ol</h1>
          <p className="text-sm font-sans text-gray-600">Yeni hesap oluşturun</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-sans text-red-600">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
              placeholder="Adınız Soyadınız"
              required
            />
          </div>

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
              Telefon (Opsiyonel)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 font-sans text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
              placeholder="05XX XXX XX XX"
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

          <div>
            <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">
              Şifre Tekrar
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                <span>Kayıt yapılıyor...</span>
              </>
            ) : (
              "Kayıt Ol"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm font-sans text-gray-600">
            Zaten hesabınız var mı?{" "}
            <Link href="/giris" className="text-luxury-goldLight font-semibold hover:underline">
              Giriş Yap
            </Link>
          </p>
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

