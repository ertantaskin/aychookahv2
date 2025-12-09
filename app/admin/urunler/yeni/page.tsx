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
    <div className="p-8">
      <h1 className="text-3xl font-bold text-luxury-black mb-8">Yeni Ürün Ekle</h1>
      <ProductForm categories={categories} />
    </div>
  );
}

