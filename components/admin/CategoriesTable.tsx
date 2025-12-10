"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteCategory } from "@/lib/actions/admin/categories";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: {
    products: number;
  };
}

interface CategoriesTableProps {
  categories: Category[];
}

export default function CategoriesTable({ categories }: CategoriesTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} kategorisini silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteCategory(id);
      toast.success("Kategori silindi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Kategori silinirken bir hata oluştu");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-sans font-semibold text-gray-900">Kategoriler</h2>
        <Link
          href="/admin/urunler/kategoriler/yeni"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sans text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Yeni Kategori
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500 font-sans">Henüz kategori eklenmemiş.</p>
          <Link
            href="/admin/urunler/kategoriler/yeni"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sans text-sm"
          >
            İlk Kategoriyi Ekle
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-700 uppercase tracking-wider">
                  Kategori Adı
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-700 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-700 uppercase tracking-wider">
                  Ürün Sayısı
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-medium text-gray-700 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {category.image && (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="text-sm font-sans font-medium text-gray-900">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-xs font-sans text-gray-500 truncate max-w-md">
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs font-sans text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-sans text-gray-900">
                      {category._count.products}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-sans">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/urunler/kategoriler/${category.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Düzenle"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={deletingId === category.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

