import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCategoryForAdmin } from "@/lib/actions/admin/categories";
import CategoryForm from "@/components/admin/CategoryForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/giris?error=admin_required");
  }

  const { id } = await params;
  const category = await getCategoryForAdmin(id);

  if (!category) {
    redirect("/admin/urunler/kategoriler");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-sans font-semibold text-gray-800">Kategori Düzenle</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}

