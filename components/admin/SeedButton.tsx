"use client";

import { useState } from "react";
import { Database } from "lucide-react";

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSeed = async () => {
    if (!confirm("Mevcut içeriği veritabanına aktarmak istediğinize emin misiniz? (Sadece boş veritabanı için)")) {
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch("/api/admin/seed-menu", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Seed başarıyla tamamlandı!");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage(`❌ Hata: ${data.error || "Seed başarısız"}`);
      }
    } catch (error: any) {
      setMessage(`❌ Hata: ${error.message || "Seed başarısız"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Database className="w-4 h-4" />
        {loading ? "Seed ediliyor..." : "İçeriği Seed Et"}
      </button>
      {message && (
        <div className={`text-sm ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}
    </div>
  );
}

