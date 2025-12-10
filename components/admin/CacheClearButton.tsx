"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { clearAllCache } from "@/lib/actions/admin/cache";

export default function CacheClearButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleClearCache = async () => {
    if (!confirm("Tüm site cache'i temizlenecek. Devam etmek istediğinize emin misiniz?")) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await clearAllCache();
      setMessage({
        type: "success",
        text: result.message || "Cache başarıyla temizlendi!",
      });
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Cache temizlenirken bir hata oluştu",
      });
      
      // 5 saniye sonra mesajı kaldır
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClearCache}
        disabled={isLoading}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left font-sans ${
          isLoading
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700 text-white"
        }`}
        title="Tüm site cache'ini temizle"
      >
        <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        <span className="font-medium">
          {isLoading ? "Temizleniyor..." : "Cache Temizle"}
        </span>
      </button>

      {message && (
        <div
          className={`absolute bottom-full left-0 mb-2 w-full p-3 rounded-lg text-sm font-sans ${
            message.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}

