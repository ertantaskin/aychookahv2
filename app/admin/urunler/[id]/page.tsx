import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCategories } from "@/lib/actions/products";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/giris?error=admin_required");
  }

  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        features: true,
      },
    }),
    getCategories(),
  ]);

  if (!product) {
    redirect("/admin/urunler");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* WordPress benzeri üst bar */}
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-gray-800">
            {product ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
          </h1>
        </div>
      </div>
      
      {/* Ana içerik alanı */}
      <div className="max-w-7xl mx-auto px-6 py-6">
      <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}

