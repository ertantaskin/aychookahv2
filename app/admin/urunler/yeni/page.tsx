import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/actions/products";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/giris?error=admin_required");
  }

  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* WordPress benzeri üst bar */}
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-800">
            Yeni Ürün Ekle
          </h1>
        </div>
      </div>
      
      {/* Ana içerik alanı */}
      <div className="max-w-7xl mx-auto px-6 py-6">
      <ProductForm categories={categories} />
      </div>
    </div>
  );
}

