"use client";

import Link from "next/link";

export default function ProductsError() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Veritabanı Bağlantı Hatası
        </h2>

        <p className="text-gray-600 mb-6">
          Ürünler yüklenirken bir hata oluştu. Lütfen aşağıdaki adımları kontrol edin:
        </p>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-left mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Yapılması Gerekenler:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <strong>.env.local</strong> dosyasında <code className="bg-gray-100 px-2 py-1 rounded">DATABASE_URL</code> değişkeninin doğru olduğundan emin olun
            </li>
            <li>
              PostgreSQL veritabanınızın çalıştığından emin olun
            </li>
            <li>
              Migration&apos;ları çalıştırın: <code className="bg-gray-100 px-2 py-1 rounded">npx prisma migrate dev</code>
            </li>
            <li>
              Prisma client&apos;ı generate edin: <code className="bg-gray-100 px-2 py-1 rounded">npx prisma generate</code>
            </li>
          </ol>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all"
          >
            Ana Sayfaya Dön
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    </div>
  );
}

