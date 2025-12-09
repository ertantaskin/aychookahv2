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
    <div className="p-8">
      <h1 className="text-3xl font-bold text-luxury-black mb-8">Ürün Düzenle</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}

