import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import CategoryForm from "@/components/admin/CategoryForm";

export default async function NewCategoryPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/giris?error=admin_required");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-sans font-semibold text-gray-800">Yeni Kategori Ekle</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <CategoryForm />
      </div>
    </div>
  );
}

