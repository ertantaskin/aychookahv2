"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateUserProfile, changePassword } from "@/lib/actions/user";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

interface ProfileClientProps {
  user: User;
}

export default function ProfileClient({ user: initialUser }: ProfileClientProps) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    phone: user.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateUserProfile(formData);
      if (result.success) {
        setUser(result.user);
        toast.success("Profil güncellendi");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Profil güncellenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Yeni şifreler eşleşmiyor");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Şifre değiştirildi");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Şifre değiştirilirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/hesabim"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-sans font-semibold text-gray-900">Profil Düzenle</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profil Bilgileri */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-sans font-semibold text-gray-900 mb-4">Profil Bilgileri</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                  placeholder="Adınız ve Soyadınız"
                />
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                  placeholder="Telefon numaranız"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 text-sm font-sans font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
              >
                {isSubmitting ? "Güncelleniyor..." : "Profili Güncelle"}
              </button>
            </form>
          </div>

          {/* Şifre Değiştir */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-sans font-semibold text-gray-900">Şifre Değiştir</h2>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="text-sm font-sans font-medium text-luxury-goldLight hover:underline"
              >
                {isChangingPassword ? "İptal" : "Şifre Değiştir"}
              </button>
            </div>

            {isChangingPassword && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                    Mevcut Şifre
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-sans font-medium text-gray-700 mb-1">
                    Yeni Şifre (Tekrar)
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight font-sans text-gray-900"
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 text-sm font-sans font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                >
                  {isSubmitting ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

