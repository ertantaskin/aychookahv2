"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "+90",
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

    // Telefon numarası validasyonu (opsiyonel ama girilmişse en az 10 hane olmalı)
    if (formData.phone && formData.phone !== "+90") {
      // Tüm boşluk, tire, parantez, + gibi karakterleri kaldır, sadece rakamları al
      const cleanPhone = formData.phone.replace(/\D/g, "");
      
      // Eğer "+90" ile başlıyorsa (90 rakamları), "+90"ı kaldır
      const phoneDigits = cleanPhone.startsWith("90") && cleanPhone.length > 10 
        ? cleanPhone.substring(2) 
        : cleanPhone;
      
      // En az 10 hane kontrolü
      if (phoneDigits.length < 10) {
        setErrorMessage("Telefon numarası en az 10 haneli olmalıdır (örn: 5XX XXX XX XX)");
        setLoading(false);
        return;
      }
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
    <div className="min-h-screen flex bg-white">
      {/* Sol Kolon - Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-4 flex justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-luxury-goldLight/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-sans font-bold text-luxury-black mb-2 text-center">
              Hesabınızı Oluşturun
            </h1>
            <p className="text-sm sm:text-base font-sans text-gray-600 text-center">
              Aychookah ailesine katılın ve lüks nargile deneyimini keşfedin
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
                Adınız Soyadınız
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 font-sans text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                placeholder="Örn: Ahmet Yılmaz"
                required
              />
            </div>

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
                Telefon (Opsiyonel)
              </label>
              <div className="relative flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-luxury-goldLight focus-within:border-luxury-goldLight transition-all bg-white">
                <div className="flex items-center gap-1.5 px-3 py-3 border-r border-gray-300 bg-gray-50 rounded-l-lg">
                  <span className="text-lg leading-none">🇹🇷</span>
                  <span className="text-sm font-sans text-gray-700 font-semibold">+90</span>
                </div>
                <input
                  type="tel"
                  value={formData.phone.startsWith("+90") ? formData.phone.substring(3) : formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // Sadece rakam
                    setFormData({ ...formData, phone: `+90${value}` });
                  }}
                  className="flex-1 px-4 py-3 font-sans text-gray-900 bg-transparent border-0 rounded-r-lg focus:outline-none focus:ring-0 placeholder:text-gray-400"
                  placeholder="5XX XXX XX XX"
                />
              </div>
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

            <div>
              <label className="block text-sm font-sans font-semibold text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 font-sans text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-luxury-goldLight focus:border-luxury-goldLight placeholder:text-gray-400 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 w-4 h-4 rounded border-gray-300 bg-white text-luxury-goldLight focus:ring-2 focus:ring-luxury-goldLight"
                required
              />
              <label htmlFor="terms" className="text-xs sm:text-sm font-sans text-gray-600">
                Kayıt olarak{" "}
                <Link href="/gizlilik" className="text-luxury-goldLight hover:underline">
                  Kullanım Koşulları
                </Link>
                {" "}ve{" "}
                <Link href="/gizlilik" className="text-luxury-goldLight hover:underline">
                  Gizlilik Politikası
                </Link>
                &apos;nı kabul ediyorum.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 font-sans bg-gradient-to-r from-luxury-goldLight to-luxury-gold text-luxury-black font-semibold rounded-lg hover:shadow-lg hover:shadow-luxury-goldLight/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-luxury-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Kayıt yapılıyor...</span>
                </>
              ) : (
                "Hesap Oluştur"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <h2 className="text-4xl sm:text-5xl font-sans font-bold text-white mb-6">
            Lüks Nargile Deneyimine Hoş Geldiniz
          </h2>
          
          <p className="text-lg sm:text-xl font-sans text-luxury-lightGray mb-8 leading-relaxed">
            Aychookah ile el işçiliği ve premium kalitenin buluştuğu özel koleksiyonumuzu keşfedin. 
            Binlerce mutlu müşterimizle birlikte lüks nargile dünyasına adım atın.
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
                Premium kalite ürünler ve özel koleksiyonlar
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-luxury-goldLight/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm sm:text-base font-sans text-luxury-lightGray text-left">
                Hızlı ve güvenli teslimat
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-luxury-goldLight/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm sm:text-base font-sans text-luxury-lightGray text-left">
                7/24 müşteri desteği
              </p>
            </div>
          </div>

          {/* Nargile Teması */}
          <div className="flex items-center gap-2 px-4 py-2 bg-luxury-goldLight/10 rounded-full border border-luxury-goldLight/20">
            <svg className="w-5 h-5 text-luxury-goldLight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs font-sans text-luxury-lightGray">
              Premium Nargile Koleksiyonu
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

